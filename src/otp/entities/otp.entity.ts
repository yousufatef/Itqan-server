import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'otps' })
@Index(['userId'])
@Index(['expiresAt'])
export class Otp {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int' })
    userId!: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: User;

    @Column({ type: 'varchar', length: 255 })
    otpHash!: string; // never store raw OTP

    @Column({ type: 'timestamp' })
    expiresAt!: Date;

    @Column({ type: 'int', default: 0 })
    attempts!: number; // failed verification attempts

    @Column({ type: 'boolean', default: false })
    isUsed!: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;
}