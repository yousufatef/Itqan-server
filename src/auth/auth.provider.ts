import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { authTokensType, JwtPayloadType } from '../utils/types';
import { UserType } from '../utils/enums';

@Injectable()
export class AuthProvider {

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    private async generateAccessToken(user: User): Promise<string> {
        const payload: JwtPayloadType = { id: user.id, userType: user.userType };
        return await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '15m',
        });
    }

    private async generateRefreshToken(user: User): Promise<string> {
        const payload: JwtPayloadType = { id: user.id, userType: user.userType };
        return await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d',
        });
    }

    private async generateTokens(user: User): Promise<authTokensType> {
        const [accessToken, refreshToken] = await Promise.all([
            this.generateAccessToken(user),
            this.generateRefreshToken(user),
        ]);

        const { password, ...userWithoutPassword } = user;

        return {
            accessToken,
            refreshToken,
            user: userWithoutPassword
        };
    }

    async register(registerDto: RegisterDto): Promise<authTokensType> {
        const { email, username, password } = registerDto;

        const existingUser = await this.userRepository.findOne({
            where: {
                email,
                userType: UserType.NORMAL_USER
            }
        }); if (existingUser) {
            throw new BadRequestException('common.users.alreadyExists');
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = this.userRepository.create({ email, username, password: hashedPassword });
        await this.userRepository.save(newUser);

        return this.generateTokens(newUser);
    }

    async loginUser(loginDto: LoginDto): Promise<authTokensType> {
        const { email, password } = loginDto;

        const user = await this.userRepository.findOne({
            where: { email, userType: UserType.NORMAL_USER }
        });

        if (!user) throw new BadRequestException('common.users.invalidCredentials');

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new BadRequestException('common.users.invalidCredentials');

        return this.generateTokens(user);
    }


    async loginAdmin(loginDto: LoginDto): Promise<authTokensType> {
        const { email, password } = loginDto;

        const user = await this.userRepository.findOne({
            where: { email, userType: In([UserType.ADMIN, UserType.SUPER_ADMIN]) }
        });

        if (!user) {
            throw new BadRequestException('common.users.invalidCredentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new BadRequestException('common.users.invalidCredentials');
        }

        return this.generateTokens(user);
    }
    async refreshToken(token: string): Promise<authTokensType> {
        try {
            const payload = await this.jwtService.verifyAsync<JwtPayloadType>(token, {
                secret: process.env.JWT_REFRESH_SECRET,
            });

            const user = await this.userRepository.findOne({ where: { id: payload.id } });
            if (!user) {
                throw new UnauthorizedException('common.auth.userNoLongerExists');
            }

            return this.generateTokens(user);

        } catch (error) {
            if (error instanceof UnauthorizedException) throw error;
            throw new UnauthorizedException('common.auth.invalidRefreshToken');
        }
    }
}
