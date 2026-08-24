import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { authTokensType, JwtPayloadType } from '../utils/types';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { MailService } from '../mail/mail.service';
import { Otp } from '../otp/entities/otp.entity';

@Injectable()
export class AuthProvider {

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Otp) private readonly otpRepository: Repository<Otp>,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
    ) { }

    private async generateAccessToken(user: User): Promise<string> {
        const payload: JwtPayloadType = { id: user.id, userType: user.userType, tokenVersion: user.tokenVersion };
        return await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: (process.env.JWT_ACCESS_EXPIRY || '15m') as any,
        });
    }

    private async generateRefreshToken(user: User): Promise<string> {
        const payload: JwtPayloadType = { id: user.id, userType: user.userType, tokenVersion: user.tokenVersion };
        return await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: (process.env.JWT_REFRESH_EXPIRY || '7d') as any,
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


    async login(loginDto: LoginDto): Promise<authTokensType> {
        const { email, password } = loginDto;
        console.log("🚀 ~ AuthProvider ~ login ~ email:", email)

        // Explicitly select password in case the User entity marks it `select: false`
        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.email = :email', { email }).getOne();

        if (!user) throw new BadRequestException('common.users.invalidCredentials');
        if (!user.isActive) throw new BadRequestException('common.users.inactiveAccount');

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new BadRequestException('common.users.invalidCredentials');

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

            if (!user.isActive) {
                throw new UnauthorizedException('common.auth.inactiveAccount');
            }

            if (user.tokenVersion !== payload.tokenVersion) {
                throw new UnauthorizedException('common.auth.tokenRevoked');
            }

            return this.generateTokens(user);

        } catch (error) {
            if (error instanceof UnauthorizedException) throw error;
            throw new UnauthorizedException('common.auth.invalidRefreshToken');
        }
    }

    private generateOtp(): string {
        // 6-digit numeric OTP (using crypto.randomInt cleanly in the full [100000, 999999] range)
        return crypto.randomInt(100000, 1000000).toString();
    }

    async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
        const { email } = dto;
        const user = await this.userRepository.findOne({ where: { email } });

        // Always return the same message — don't leak whether the email exists
        const genericResponse = {
            message: 'common.auth.otpSentIfExists',
        };

        if (!user) return genericResponse;

        const otp = this.generateOtp();
        const otpHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        // Wrap OTP invalidation and creation in a transaction
        await this.otpRepository.manager.transaction(async (transactionalEntityManager) => {
            await transactionalEntityManager.update(
                Otp,
                { userId: user.id, isUsed: false },
                { isUsed: true },
            );

            await transactionalEntityManager.save(
                Otp,
                transactionalEntityManager.create(Otp, {
                    userId: user.id,
                    otpHash,
                    expiresAt,
                }),
            );
        });

        try {
            await this.mailService.sendOtpEmail(user.email, otp);
        } catch (err) {
            // Log but don't crash — OTP is securely created so user can retry or ask admin
            console.error('Failed to send OTP email:', err);
        }

        return genericResponse;
    }

    /**
     * Shared OTP lookup/validation used by both verifyOtp and resetPassword.
     * Atomically increments `attempts` on a wrong OTP (via query builder .increment())
     * to avoid the race where two concurrent wrong guesses both read the same
     * stale `attempts` value and only count as one.
     */
    private async validateOtp(email: string, otp: string): Promise<{ user: User; otpRecord: Otp }> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) throw new BadRequestException('common.auth.invalidOtp');

        const otpRecord = await this.otpRepository.findOne({
            where: { userId: user.id, isUsed: false },
            order: { created_at: 'DESC' },
        });

        if (!otpRecord) throw new BadRequestException('common.auth.invalidOtp');

        if (otpRecord.expiresAt < new Date()) {
            throw new BadRequestException('common.auth.otpExpired');
        }

        if (otpRecord.attempts >= 5) {
            throw new BadRequestException('common.auth.tooManyAttempts');
        }

        const isValid = await bcrypt.compare(otp, otpRecord.otpHash);

        if (!isValid) {
            // Atomic increment at the DB level — avoids lost updates under concurrent requests
            await this.otpRepository.increment({ id: otpRecord.id }, 'attempts', 1);
            throw new BadRequestException('common.auth.invalidOtp');
        }

        return { user, otpRecord };
    }

    async verifyOtp(dto: VerifyOtpDto): Promise<{ valid: boolean }> {
        const { email, otp } = dto;
        await this.validateOtp(email, otp);
        return { valid: true };
    }

    async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
        const { email, otp, newPassword } = dto;
        const { user, otpRecord } = await this.validateOtp(email, otp);

        // Mark OTP as used
        otpRecord.isUsed = true;
        await this.otpRepository.save(otpRecord);

        // Update password & increment token version to invalidate all active refresh tokens.
        // NOTE: access tokens (short-lived, default 15m) remain valid until they expire unless
        // your JWT access-token guard/strategy also checks tokenVersion against the DB on each
        // request. If you need immediate revocation, add that check there.
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.tokenVersion += 1;
        await this.userRepository.save(user);

        return { message: 'common.auth.passwordResetSuccess' };
    }
}