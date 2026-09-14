import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DailyRecord } from './entities/daily-record.entity';
import { Circle } from '../circles/entities/circle.entity';
import { CircleStudent } from '../circles/entities/circle-student.entity';
import { AttendanceStatus } from '../utils/enums';
import { CreateDailyRecordItemDto } from './dto/create-daily-record-item.dto';

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

    async upsertBatch(
        circleId: number,
        date: string | undefined,
        items: CreateDailyRecordItemDto[],
    ) {
        // Resolve and validate date
        const recordDate = date ?? this.getTodayString();
        this.validateDateFormat(recordDate);

        const circle = await this.assertCircleExists(circleId);

        // Load the set of student IDs enrolled in this circle
        const circleStudents = await this.circleStudentRepo.find({
            where: { circle_id: circleId },
            relations: ['student'],
            order: { created_at: 'ASC' },
        });

        const enrolledStudentIds = new Set(circleStudents.map((cs) => cs.student_id));

        // Validate each item before touching the DB
        for (const item of items) {
            if (!enrolledStudentIds.has(item.studentId)) {
                throw new BadRequestException(
                    `Student ${item.studentId} is not enrolled in circle ${circleId}`,
                );
            }

            if (item.attendanceStatus === AttendanceStatus.ABSENT) {
                if (item.evaluation !== undefined || item.notes !== undefined) {
                    throw new BadRequestException({
                        message: "evaluation/notes cannot be set when attendanceStatus is 'absent'",
                        studentId: item.studentId,
                    });
                }
            }
        }

        // Run all upserts in a single transaction
        await this.dataSource.transaction(async (manager) => {
            for (const item of items) {
                const existing = await manager.findOne(DailyRecord, {
                    where: {
                        student_id: item.studentId,
                        circle_id: circleId,
                        record_date: recordDate as any,
                    },
                });

                const evaluation =
                    item.attendanceStatus === AttendanceStatus.ABSENT
                        ? null
                        : (item.evaluation ?? null);
                const notes =
                    item.attendanceStatus === AttendanceStatus.ABSENT
                        ? null
                        : (item.notes ?? null);

                if (existing) {
                    await manager.update(DailyRecord, existing.id, {
                        attendance_status: item.attendanceStatus,
                        evaluation,
                        notes,
                    });
                } else {
                    const record = manager.create(DailyRecord, {
                        student_id: item.studentId,
                        circle_id: circleId,
                        teacher_id: circle.teacher_id,
                        record_date: recordDate,
                        attendance_status: item.attendanceStatus,
                        evaluation,
                        notes,
                    });
                    await manager.save(DailyRecord, record);
                }
            }
        });

        // Return the refreshed list in the same shape as GET
        return this.findByDate(circleId, recordDate);
    }
}
