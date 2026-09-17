import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DailyRecord } from './entities/daily-record.entity';
import { Circle } from '../circles/entities/circle.entity';
import { CircleStudent } from '../circles/entities/circle-student.entity';
import { AttendanceStatus } from '../utils/enums';
import { CreateDailyRecordItemDto } from './dto/create-daily-record-item.dto';
import { UpdateDailyRecordDto } from './dto/update-daily-record.dto';

@Injectable()
export class DailyRecordsService {
    constructor(
        @InjectRepository(DailyRecord) private readonly recordRepo: Repository<DailyRecord>,
        @InjectRepository(Circle) private readonly circleRepo: Repository<Circle>,
        @InjectRepository(CircleStudent) private readonly circleStudentRepo: Repository<CircleStudent>,
        private readonly dataSource: DataSource,
    ) {}

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private validateDateFormat(date: string): void {
        const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
        if (!ISO_DATE_RE.test(date)) {
            throw new BadRequestException(`Invalid date format "${date}". Expected YYYY-MM-DD`);
        }
        const parsed = new Date(date);
        if (isNaN(parsed.getTime())) {
            throw new BadRequestException(`Invalid date value "${date}"`);
        }
    }

    private getTodayString(): string {
        return new Date().toISOString().slice(0, 10);
    }

    private async assertCircleExists(circleId: number): Promise<Circle> {
        const circle = await this.circleRepo.findOne({
            where: { id: circleId },
            relations: ['teacher', 'teacher.user'],
        });
        if (!circle) {
            throw new NotFoundException(`Circle with id ${circleId} not found`);
        }
        return circle;
    }

    private normalizeRecord(
        studentId: number,
        studentName: string,
        record: DailyRecord | undefined,
    ) {
        return {
            studentId,
            studentName,
            recordId: record?.id ?? null,
            attendanceStatus: record?.attendance_status ?? null,
            evaluation: record?.evaluation ?? null,
            notes: record?.notes ?? null,
        };
    }

    private formatSingleRecord(record: DailyRecord, studentName?: string | null) {
        return {
            id: record.id,
            recordId: record.id,
            studentId: record.student_id,
            studentName: studentName ?? record.student?.name ?? null,
            circleId: record.circle_id,
            teacherId: record.teacher_id,
            recordDate: record.record_date,
            attendanceStatus: record.attendance_status,
            evaluation: record.evaluation ?? null,
            notes: record.notes ?? null,
            createdAt: record.created_at,
            updatedAt: record.updated_at,
        };
    }

    // ─── GET /circles/:circleId/daily-records?date=YYYY-MM-DD ─────────────────

    async findByDate(circleId: number, date?: string) {
        await this.assertCircleExists(circleId);

        if (date !== undefined) {
            this.validateDateFormat(date);
        }

        // Load all students enrolled in this circle
        const circleStudents = await this.circleStudentRepo.find({
            where: { circle_id: circleId },
            relations: ['student'],
            order: { created_at: 'ASC' },
        });

        if (!date) {
            // No date provided — return students with all nulls
            return {
                students: circleStudents.map((cs) =>
                    this.normalizeRecord(cs.student_id, cs.student.name, undefined),
                ),
            };
        }

        // Fetch existing records for (circleId, date)
        const records = await this.recordRepo.find({
            where: { circle_id: circleId, record_date: date as any },
        });

        const recordMap = new Map<number, DailyRecord>(
            records.map((r) => [r.student_id, r]),
        );

        return {
            students: circleStudents.map((cs) =>
                this.normalizeRecord(
                    cs.student_id,
                    cs.student.name,
                    recordMap.get(cs.student_id),
                ),
            ),
        };
    }

    // ─── POST /circles/:circleId/daily-records?date=YYYY-MM-DD ───────────────

    async createRecord(
        circleId: number,
        date: string | undefined,
        dto: CreateDailyRecordItemDto,
    ) {
        // Resolve and validate date
        const recordDate = date ?? this.getTodayString();
        this.validateDateFormat(recordDate);

        const circle = await this.assertCircleExists(circleId);

        // Verify student is enrolled in circle
        const circleStudent = await this.circleStudentRepo.findOne({
            where: { circle_id: circleId, student_id: dto.studentId },
            relations: ['student'],
        });

        if (!circleStudent) {
            throw new BadRequestException(
                `Student ${dto.studentId} is not enrolled in circle ${circleId}`,
            );
        }

        // Check if daily record already exists for this student on this date
        const existingRecord = await this.recordRepo.findOne({
            where: {
                circle_id: circleId,
                student_id: dto.studentId,
                record_date: recordDate as any,
            },
        });

        if (existingRecord) {
            throw new BadRequestException('common.dailyRecords.alreadyExists');
        }

        const evaluation =
            dto.attendanceStatus === AttendanceStatus.ABSENT
                ? null
                : (dto.evaluation ?? null);
        const notes =
            dto.attendanceStatus === AttendanceStatus.ABSENT
                ? null
                : (dto.notes ?? null);

        const record = this.recordRepo.create({
            student_id: dto.studentId,
            circle_id: circleId,
            teacher_id: circle.teacher_id,
            record_date: recordDate,
            attendance_status: dto.attendanceStatus,
            evaluation,
            notes,
        });

        const saved = await this.recordRepo.save(record);
        return this.formatSingleRecord(saved, circleStudent.student?.name);
    }

    // ─── PATCH /circles/:circleId/daily-records/:id ───────────────────────────

    async updateRecord(
        circleId: number,
        id: number,
        dto: UpdateDailyRecordDto,
        date?: string,
    ) {
        await this.assertCircleExists(circleId);

        if (date !== undefined) {
            this.validateDateFormat(date);
        }

        const record = await this.recordRepo.findOne({
            where: { id, circle_id: circleId },
            relations: ['student'],
        });

        if (!record) {
            throw new NotFoundException(`Daily record with id ${id} not found in circle ${circleId}`);
        }

        if (date !== undefined && record.record_date !== date) {
            throw new BadRequestException(
                `Record date (${record.record_date}) does not match requested date (${date})`,
            );
        }

        const newAttendance = dto.attendanceStatus ?? record.attendance_status;

        if (newAttendance === AttendanceStatus.ABSENT) {
            record.attendance_status = AttendanceStatus.ABSENT;
            record.evaluation = null;
            record.notes = null;
        } else {
            record.attendance_status = newAttendance;
            if (dto.evaluation !== undefined) {
                record.evaluation = dto.evaluation;
            }
            if (dto.notes !== undefined) {
                record.notes = dto.notes;
            }
        }

        const saved = await this.recordRepo.save(record);
        return this.formatSingleRecord(saved, record.student?.name);
    }
}


