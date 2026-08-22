import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ParentStudent } from '../../students/entities/parent-student.entity';
import { CURRENT_TIMESTAMP } from '../../utils/constants';
import { Exclude } from 'class-transformer';

@Entity({ name: 'parents' })
export class Parent {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    user_id!: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'varchar', unique: true })
    @Exclude()
    access_token!: string;

    @OneToMany(() => ParentStudent, (ps) => ps.parent)
    parentStudents!: ParentStudent[];

    @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
    created_at!: Date;
}
