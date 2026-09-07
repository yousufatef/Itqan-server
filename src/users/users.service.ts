import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UserIdDto } from './dto/user-id.dto';
import { User } from './entities/user.entity';
import { ILike, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../utils/enums';
import { join } from 'node:path';
import { unlinkSync, existsSync } from 'node:fs';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) { }

  // ─── Admin: Paginated list with search + role filter ──────────────────────

  async getPaginatedUsers(
    page: number,
    limit: number,
    role?: UserRole,
    searchTerm?: string,
  ) {
    if (role === UserRole.SUPER_ADMIN) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }

    const where: any[] = [];

    const baseWhere = { userType: role ?? Not(UserRole.SUPER_ADMIN) };

    if (searchTerm) {
      where.push(
        { ...baseWhere, username: ILike(`%${searchTerm}%`) },
        { ...baseWhere, email: ILike(`%${searchTerm}%`) },
      );
    } else {
      where.push(baseWhere);
    }

    const [data, total] = await this.userRepository.findAndCount({
      where,
      select: ['id', 'username', 'email', 'phoneNumber', 'userType', 'isActive', 'created_at'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Admin: Dropdown list (id + username only) ────────────────────────────

  async getDropdownUsers(role?: UserRole) {
    if (role === UserRole.SUPER_ADMIN) {
      return [];
    }

    return this.userRepository.find({
      where: { userType: role ?? Not(UserRole.SUPER_ADMIN) },
      select: ['id', 'username'],
      order: { username: 'ASC' },
    });
  }

  // ─── Admin: Create user with default password ─────────────────────────────

  async createUser(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('common.users.alreadyExists');
    }

    const defaultPassword = 'Itqan@1234'; // default password — should be configurable
    const hashed = await this.hashPassword(defaultPassword);

    const user = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      phoneNumber: dto.phoneNumber ?? null,
      userType: dto.role,
      password: hashed,
      isActive: true,
    });

    return this.userRepository.save(user);
  }

  // ─── Admin: Update any user ───────────────────────────────────────────────

  async adminUpdateUser(dto: AdminUpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: dto.id } });
    if (!user) {
      throw new BadRequestException('common.users.notFound');
    }

    if (dto.username !== undefined) user.username = dto.username;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.phoneNumber !== undefined) user.phoneNumber = dto.phoneNumber;
    if (dto.role !== undefined) user.userType = dto.role;

    return this.userRepository.save(user);
  }

  // ─── Admin: Delete user by ID ─────────────────────────────────────────────

  async deleteUser({ id }: UserIdDto): Promise<null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('common.users.notFound');
    }

    if (user.profileImage) {
      const imagePath = join(process.cwd(), `uploads/profile-images/${user.profileImage}`);
      if (existsSync(imagePath)) unlinkSync(imagePath);
    }

    await this.userRepository.delete(id);
    return null;
  }

  // ─── Admin: Toggle active status ──────────────────────────────────────────

  async statusToggle({ id }: UserIdDto): Promise<{ id: number; isActive: boolean }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('common.users.notFound');
    }

    user.isActive = !user.isActive;
    await this.userRepository.save(user);

    return { id: user.id, isActive: user.isActive };
  }

  // ─── Existing helpers ─────────────────────────────────────────────────────

  async update(id: number, updateData: { username?: string; password?: string }) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('common.users.notFound');
    }
    if (updateData.username) user.username = updateData.username;
    if (updateData.password) {
      user.password = await this.hashPassword(updateData.password);
    }
    return this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('common.users.notFound');
    }
    if (user.profileImage) {
      const imagePath = join(process.cwd(), `uploads/profile-images/${user.profileImage}`);
      if (existsSync(imagePath)) unlinkSync(imagePath);
    }
    await this.userRepository.delete(id);
    return null;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
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
    if (existsSync(imagePath)) unlinkSync(imagePath);
    user.profileImage = null as any;
    return this.userRepository.save(user);
  }

  async getCurrentUser(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('common.users.notFound');
    }
    return user;
  }

  getAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      where: { userType: Not(UserRole.SUPER_ADMIN) },
    });
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('common.users.notFound');
    }
    return user;
  }
}
