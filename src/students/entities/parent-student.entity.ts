import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Parent } from '../../parents/entities/parent.entity';
import { Student } from './student.entity';
import { CURRENT_TIMESTAMP } from '../../utils/constants';

@Entity({ name: 'parent_students' })
export class ParentStudent {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    parent_id!: number;

    @ManyToOne(() => Parent, (parent) => parent.parentStudents, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parent_id' })
    parent!: Parent;

    @Column()
    student_id!: number;

    @ManyToOne(() => Student, (student) => student.parentStudents, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'student_id' })
    student!: Student;

    @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
    created_at!: Date;
}
