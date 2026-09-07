import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { UserIdDto } from '../users/dto/user-id.dto';
import { UsersService } from '../users/users.service';
import { Parent } from '../parents/entities/parent.entity';
import { ParentStudent } from './entities/parent-student.entity';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { UserRole } from '../utils/enums';
import { randomUUID } from 'crypto';

@Injectable()
export class StudentsService {
    constructor(
        @InjectRepository(Student) private readonly studentRepository: Repository<Student>,
        @InjectRepository(Parent) private readonly parentRepository: Repository<Parent>,
        @InjectRepository(ParentStudent) private readonly parentStudentRepository: Repository<ParentStudent>,
        private readonly usersService: UsersService,
    ) { }

    private normalizeStudent(student: any, parentIdOverride?: number | null, parentUserIdOverride?: number | null) {
        const parentStudent = Array.isArray(student.parentStudents) && student.parentStudents.length > 0
            ? student.parentStudents[0]
            : null;

        const parentId = parentIdOverride ?? parentStudent?.parent_id ?? parentStudent?.parent?.id ?? null;
        const parentUserId = parentUserIdOverride ?? parentStudent?.parent?.user_id ?? parentStudent?.parent?.user?.id ?? null;

        const birthOfDate = student.birth_date
            ? student.birth_date instanceof Date
                ? student.birth_date.toISOString().slice(0, 10)
                : String(student.birth_date)
            : null;

        return {
            id: student.id,
            name: student.name,
            phoneNumber: student.phone_number ?? null,
            birthOfDate,
            parent: {
                id: parentId,
                parentName: parentStudent?.parent?.user?.username ?? null,
            },
            createdAt: student.created_at,
            updatedAt: student.updated_at,
        };
    }

    /**
     * Find or auto-create a Parent record for a user with userType "parent".
     */
    private async findOrCreateParent(userId: number): Promise<Parent> {
        const user = await this.usersService.getUserById(userId);

        if (user.userType !== UserRole.PARENT) {
            throw new BadRequestException('User is not a parent');
        }

        let parentRecord = await this.parentRepository.findOne({
            where: { user_id: user.id },
            relations: ['user'],
        });

        if (!parentRecord) {
            parentRecord = this.parentRepository.create({
                user_id: user.id,
                access_token: randomUUID(),
            });
            parentRecord = await this.parentRepository.save(parentRecord);
            parentRecord = await this.parentRepository.findOne({
                where: { id: parentRecord.id },
                relations: ['user'],
            }) as Parent;
        }

        return parentRecord;
    }

    async getPaginatedStudents(page: number, limit: number, searchTerm?: string) {
        const where = searchTerm
            ? [
                { name: ILike(`%${searchTerm}%`) },
                { phone_number: ILike(`%${searchTerm}%`) },
            ]
            : {};

        const [data, total] = await this.studentRepository.findAndCount({
            where,
            relations: ['parentStudents', 'parentStudents.parent', 'parentStudents.parent.user'],
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            data: data.map((student) => this.normalizeStudent(student)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async createStudent(dto: CreateStudentDto) {
        const name = dto.name?.trim();
        if (!name) {
            throw new BadRequestException('Student name is required');
        }

        const parentValue = dto.parent_id ?? (dto as any).parent ?? (dto as any).parentId;
        let parentRecord: Parent | null = null;

        if (parentValue !== undefined && parentValue !== null && parentValue !== '') {
            const parentId = Number(parentValue);
            parentRecord = await this.findOrCreateParent(parentId);
        }

        const student = this.studentRepository.create({
            name,
            phone_number: dto.phoneNumber ?? (dto as any).phone_number ?? null,
            birth_date: dto.birthOfDate ?? (dto as any).birth_date ?? null,
        });

        const savedStudent = await this.studentRepository.save(student);

        if (parentRecord) {
            await this.parentStudentRepository.save({
                parent_id: parentRecord.id,
                student_id: savedStudent.id,
            });
        }

        const result = await this.studentRepository.findOne({
            where: { id: savedStudent.id },
            relations: ['parentStudents', 'parentStudents.parent', 'parentStudents.parent.user'],
        });

        return this.normalizeStudent(
            result ?? { ...savedStudent, parentStudents: parentRecord ? [{ parent_id: parentRecord.id, parent: { id: parentRecord.id, user_id: parentRecord.user_id } }] : [] },
            parentRecord?.id ?? null,
            parentRecord?.user_id ?? null,
        );
    }

    async updateStudent(id: number, dto: UpdateStudentDto) {
        const student = await this.studentRepository.findOne({
            where: { id },
            relations: ['parentStudents', 'parentStudents.parent', 'parentStudents.parent.user'],
        });

        if (!student) {
            throw new BadRequestException('Student not found');
        }

        if (dto.name !== undefined) {
            const name = dto.name?.trim();
            if (!name) {
                throw new BadRequestException('Student name is required');
            }
            student.name = name;
        }

        if (dto.phoneNumber !== undefined || (dto as any).phone_number !== undefined) {
            student.phone_number = dto.phoneNumber ?? (dto as any).phone_number ?? null;
        }

        if (dto.birthOfDate !== undefined || (dto as any).birth_date !== undefined) {
            student.birth_date = dto.birthOfDate ?? (dto as any).birth_date ?? null;
        }

        const parentValue = dto.parent ?? (dto as any).parentId ?? (dto as any).parent_id;
        if (parentValue !== undefined && parentValue !== null && parentValue !== '') {
            const parentId = Number(parentValue);
            const parentRecord = await this.findOrCreateParent(parentId);

            const hasCurrentParent = student.parentStudents?.some((link) => link.parent_id === parentRecord.id);
            if (!hasCurrentParent) {
                await this.parentStudentRepository.delete({ student_id: id });
                await this.parentStudentRepository.save({ parent_id: parentRecord.id, student_id: id });
            }
        }

        const updatedStudent = await this.studentRepository.save(student);
        const result = await this.studentRepository.findOne({
            where: { id: updatedStudent.id },
            relations: ['parentStudents', 'parentStudents.parent', 'parentStudents.parent.user'],
        });

        const activeParent = result?.parentStudents?.[0]?.parent ?? student.parentStudents?.[0]?.parent ?? null;
        const nextParentId = activeParent?.id ?? (result && result.parentStudents?.[0]?.parent_id) ?? null;
        const nextParentUserId = activeParent?.user_id ?? activeParent?.user?.id ?? null;

        return this.normalizeStudent(
            result ?? { ...updatedStudent, parentStudents: nextParentId ? [{ parent_id: nextParentId, parent: { id: nextParentId, user_id: nextParentUserId } }] : [] },
            nextParentId,
            nextParentUserId,
        );
    }

    async deleteStudent({ id }: UserIdDto) {
        const student = await this.studentRepository.findOne({ where: { id } });
        if (!student) {
            throw new BadRequestException('Student not found');
        }

        await this.parentStudentRepository.delete({ student_id: id });
        await this.studentRepository.delete(id);
        return null;
    }
}
