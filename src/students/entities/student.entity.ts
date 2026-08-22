import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ParentStudent } from './parent-student.entity';
import { CircleStudent } from '../../circles/entities/circle-student.entity';
import { DailyRecord } from '../../daily-records/entities/daily-record.entity';
import { CURRENT_TIMESTAMP } from '../../utils/constants';

@Entity({ name: 'students' })
export class Student {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 250 })
    name!: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone_number!: string;

    @Column({ type: 'date', nullable: true })
    birth_date!: Date;

    @OneToMany(() => ParentStudent, (ps) => ps.student)
    parentStudents!: ParentStudent[];

    @OneToMany(() => CircleStudent, (cs) => cs.student)
    circleStudents!: CircleStudent[];

    @OneToMany(() => DailyRecord, (record) => record.student)
    dailyRecords!: DailyRecord[];

    @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
    updated_at!: Date;
}
