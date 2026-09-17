import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Circle } from './entities/circle.entity';
import { CircleStudent } from './entities/circle-student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Student } from '../students/entities/student.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../utils/enums';
import { CreateCircleDto } from './dto/create-circle.dto';
import { UpdateCircleDto } from './dto/update-circle.dto';

@Injectable()
export class CirclesService {
    constructor(
        @InjectRepository(Circle) private readonly circleRepo: Repository<Circle>,
        @InjectRepository(CircleStudent) private readonly circleStudentRepo: Repository<CircleStudent>,
        @InjectRepository(Teacher) private readonly teacherRepo: Repository<Teacher>,
        @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
    ) {}

    // ─── Normalisation ────────────────────────────────────────────────────────

    private normalizeCircle(circle: Circle) {
        return {
            id: circle.id,
            circleName: circle.name,
            teacherName: circle.teacher?.user?.username ?? null,
            days: circle.days ?? [],
            timeFrom: circle.start_time ?? null,
            timeTo: circle.end_time ?? null,
            isActive: circle.is_active,
        };
    }

    // ─── Validation Helpers ────────────────────────────────────────────────────

    private validateTimeOrder(startTime: string, endTime: string): void {
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        const startMinutes = sh * 60 + sm;
        const endMinutes = eh * 60 + em;
        if (startMinutes >= endMinutes) {
            throw new BadRequestException('startTime must be before endTime');
        }
    }

    private async resolveTeacher(teacherId: number): Promise<Teacher> {
        const user = await this.userRepo.findOne({ where: { id: teacherId } });
        if (!user || user.userType !== UserRole.TEACHER) {
            throw new BadRequestException(
                `Teacher with user id ${teacherId} not found or is not a teacher.`,
            );
        }

        let teacher = await this.teacherRepo.findOne({
            where: { user_id: user.id },
            relations: ['user'],
        });

        if (!teacher) {
            teacher = this.teacherRepo.create({ user_id: user.id });
            teacher = await this.teacherRepo.save(teacher);
            teacher.user = user;
        }

        return teacher;
    }

    private async resolveStudents(studentIds: number[]): Promise<Student[]> {
        if (!studentIds || studentIds.length === 0) return [];
        const students = await this.studentRepo.find({ where: { id: In(studentIds) } });
        if (students.length !== studentIds.length) {
            const foundIds = students.map((s) => s.id);
            const missing = studentIds.filter((id) => !foundIds.includes(id));
            throw new BadRequestException(`Students not found: ${missing.join(', ')}`);
        }
        return students;
    }

    private async loadCircleWithRelations(id: number): Promise<Circle> {
        const circle = await this.circleRepo.findOne({
            where: { id },
            relations: ['teacher', 'teacher.user', 'circleStudents', 'circleStudents.student'],
        });
        if (!circle) {
            throw new NotFoundException(`Circle with id ${id} not found`);
        }
        return circle;
    }

    // ─── CRUD ─────────────────────────────────────────────────────────────────

    async findAll(search?: string) {
        const qb = this.circleRepo
            .createQueryBuilder('circle')
            .leftJoinAndSelect('circle.teacher', 'teacher')
            .leftJoinAndSelect('teacher.user', 'user')
            .leftJoinAndSelect('circle.circleStudents', 'circleStudents')
            .leftJoinAndSelect('circleStudents.student', 'student')
            .orderBy('circle.created_at', 'DESC');

        if (search) {
            qb.where('circle.name ILIKE :search', { search: `%${search}%` });
        }

        const circles = await qb.getMany();
        return circles.map((c) => this.normalizeCircle(c));
    }

    async findOne(id: number) {
        const circle = await this.loadCircleWithRelations(id);
        return this.normalizeCircle(circle);
    }

    async create(dto: CreateCircleDto) {
        const teacher = await this.resolveTeacher(dto.teacherId);
        await this.resolveStudents(dto.studentIds);
        this.validateTimeOrder(dto.startTime, dto.endTime);

        const circle = this.circleRepo.create({
            name: dto.name.trim(),
            teacher_id: teacher.id,
            days: dto.days,
            start_time: dto.startTime,
            end_time: dto.endTime,
            is_active: true,
        });
        const saved = await this.circleRepo.save(circle);

        if (dto.studentIds && dto.studentIds.length > 0) {
            const links = dto.studentIds.map((sid) =>
                this.circleStudentRepo.create({ circle_id: saved.id, student_id: sid }),
            );
            await this.circleStudentRepo.save(links);
        }

        return this.findOne(saved.id);
    }

    async update(id: number, dto: UpdateCircleDto) {
        const circle = await this.loadCircleWithRelations(id);

        if (dto.teacherId !== undefined) {
            const teacher = await this.resolveTeacher(dto.teacherId);
            circle.teacher_id = teacher.id;
        }

        if (dto.name !== undefined) {
            circle.name = dto.name.trim();
        }

        if (dto.days !== undefined) {
            circle.days = dto.days;
        }

        // Validate time ordering using the final resolved values
        const effectiveStart = dto.startTime ?? circle.start_time;
        const effectiveEnd = dto.endTime ?? circle.end_time;
        if (dto.startTime !== undefined || dto.endTime !== undefined) {
            if (effectiveStart && effectiveEnd) {
                this.validateTimeOrder(effectiveStart, effectiveEnd);
            }
        }

        if (dto.startTime !== undefined) circle.start_time = dto.startTime;
        if (dto.endTime !== undefined) circle.end_time = dto.endTime;
        if (dto.isActive !== undefined) circle.is_active = dto.isActive;

        await this.circleRepo.save(circle);

        // Sync students: replace existing associations with new list
        if (dto.studentIds !== undefined) {
            await this.resolveStudents(dto.studentIds);
            await this.circleStudentRepo.delete({ circle_id: id });
            if (dto.studentIds.length > 0) {
                const links = dto.studentIds.map((sid) =>
                    this.circleStudentRepo.create({ circle_id: id, student_id: sid }),
                );
                await this.circleStudentRepo.save(links);
            }
        }

        return this.findOne(id);
    }

    async toggleActive(id: number) {
        const circle = await this.circleRepo.findOne({ where: { id } });
        if (!circle) {
            throw new NotFoundException(`Circle with id ${id} not found`);
        }
        circle.is_active = !circle.is_active;
        await this.circleRepo.save(circle);
        return this.findOne(id);
    }

    async remove(id: number): Promise<null> {
        const circle = await this.circleRepo.findOne({ where: { id } });
        if (!circle) {
            throw new NotFoundException(`Circle with id ${id} not found`);
        }
        await this.circleRepo.delete(id);
        return null;
    }
}
