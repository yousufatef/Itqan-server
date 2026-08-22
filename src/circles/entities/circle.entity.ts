import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { CircleStudent } from './circle-student.entity';
import { DailyRecord } from '../../daily-records/entities/daily-record.entity';
import { CURRENT_TIMESTAMP } from '../../utils/constants';

@Entity({ name: 'circles' })
export class Circle {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 250 })
    name!: string;

    @Column()
    teacher_id!: number;

    @ManyToOne(() => Teacher, (teacher) => teacher.circles, { onDelete: 'CASCADE', eager: true })
    @JoinColumn({ name: 'teacher_id' })
    teacher!: Teacher;

    @Column({ type: 'varchar', nullable: true })
    days!: string;

    @Column({ type: 'time', nullable: true })
    start_time!: string;

    @Column({ type: 'time', nullable: true })
    end_time!: string;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @OneToMany(() => CircleStudent, (cs) => cs.circle)
    circleStudents!: CircleStudent[];

    @OneToMany(() => DailyRecord, (record) => record.circle)
    dailyRecords!: DailyRecord[];

    @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
    updated_at!: Date;
}
