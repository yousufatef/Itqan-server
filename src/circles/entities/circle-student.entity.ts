import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Circle } from './circle.entity';
import { Student } from '../../students/entities/student.entity';
import { CURRENT_TIMESTAMP } from '../../utils/constants';

@Entity({ name: 'circle_students' })
export class CircleStudent {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    circle_id!: number;

    @ManyToOne(() => Circle, (circle) => circle.circleStudents, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'circle_id' })
    circle!: Circle;

    @Column()
    student_id!: number;

    @ManyToOne(() => Student, (student) => student.circleStudents, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'student_id' })
    student!: Student;

    @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
    created_at!: Date;
}
