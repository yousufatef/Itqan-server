import { AuthProvider } from '../auth/auth.provider';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserProfile } from '../utils/types';
import { UserType } from '../utils/enums';
import { join } from 'node:path';
import { unlinkSync, existsSync } from 'node:fs';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    // private readonly AuthProvider: AuthProvider,
    // private readonly jwtService: JwtService,

  ) { }


  async update(id: number, updateUserDto: UpdateUserDto) {
    const { username, password } = updateUserDto;
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new BadRequestException('common.users.notFound');
      }
      if (username) user.username = username;
      if (password) {
        user.password = await this.hashPassword(password);
      }
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('common.users.notFound');
    }
    if (user.id === id || user.userType === UserType.ADMIN) {
      // Clean up profile image before deleting user
      if (user.profileImage) {
        const imagePath = join(process.cwd(), `uploads/profile-images/${user.profileImage}`);
        if (existsSync(imagePath)) {
          unlinkSync(imagePath);
        }
      }
      await this.userRepository.delete(id);
      return null;
    }
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  async uploadProfileImage(newProfileImage: string, userId: number) {
    const user = await this.getCurrentUser(userId);

    if (user.profileImage === null) {
      user.profileImage = newProfileImage;
    } else {
      await this.removeProfileImage(userId);
      user.profileImage = newProfileImage;
    }
    return this.userRepository.save(user);
  }

  async removeProfileImage(userId: number) {
    const user = await this.getCurrentUser(userId);

    if (user.profileImage === null) {
      throw new BadRequestException('common.users.noProfileImage');
    }

    const imagePath = join(process.cwd(), `uploads/profile-images/${user.profileImage}`);

    if (existsSync(imagePath)) {
      unlinkSync(imagePath);
    }

    user.profileImage = null as any;
    return this.userRepository.save(user);
  }

  async getCurrentUser(id: number): Promise<UserProfile> {
    try {
      const user = await this.userRepository.findOne({ where: { id: id } });
      console.log("🚀 ~ UsersService ~ getCurrentUser ~ user:", user)

      if (!user) {
        throw new BadRequestException('common.users.notFound');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getUserById(id: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new BadRequestException('common.users.notFound');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }
}
