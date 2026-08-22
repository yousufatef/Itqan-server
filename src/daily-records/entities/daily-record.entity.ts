import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Circle } from '../../circles/entities/circle.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { AttendanceStatus } from '../../utils/enums';
import { CURRENT_TIMESTAMP } from '../../utils/constants';

@Entity({ name: 'daily_records' })
@Index(['student_id', 'circle_id', 'record_date'], { unique: true })
export class DailyRecord {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    student_id!: number;

    @ManyToOne(() => Student, (student) => student.dailyRecords, { onDelete: 'CASCADE', eager: true })
    @JoinColumn({ name: 'student_id' })
    student!: Student;

    @Column()
    circle_id!: number;

    @ManyToOne(() => Circle, (circle) => circle.dailyRecords, { onDelete: 'CASCADE', eager: true })
    @JoinColumn({ name: 'circle_id' })
    circle!: Circle;

    @Column()
    teacher_id!: number;

    @ManyToOne(() => Teacher, (teacher) => teacher.dailyRecords, { onDelete: 'CASCADE', eager: true })
    @JoinColumn({ name: 'teacher_id' })
    teacher!: Teacher;

    @Column({ type: 'date' })
    record_date!: Date;

    @Column({ type: 'enum', enum: AttendanceStatus })
    attendance_status!: AttendanceStatus;

    @Column({ type: 'text', nullable: true })
    evaluation!: string;

    @Column({ type: 'text', nullable: true })
    notes!: string;

    @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
    updated_at!: Date;
}
