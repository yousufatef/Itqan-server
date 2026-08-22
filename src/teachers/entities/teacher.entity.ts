import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Circle } from '../../circles/entities/circle.entity';
import { DailyRecord } from '../../daily-records/entities/daily-record.entity';
import { CURRENT_TIMESTAMP } from '../../utils/constants';

@Entity({ name: 'teachers' })
export class Teacher {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    user_id!: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @OneToMany(() => Circle, (circle) => circle.teacher)
    circles!: Circle[];

    @OneToMany(() => DailyRecord, (record) => record.teacher)
    dailyRecords!: DailyRecord[];

    @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
    created_at!: Date;
}
