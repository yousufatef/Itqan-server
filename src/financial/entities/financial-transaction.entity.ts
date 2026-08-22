import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FinancialCategory } from './financial-category.entity';
import { CURRENT_TIMESTAMP } from '../../utils/constants';

@Entity({ name: 'financial_transactions' })
export class FinancialTransaction {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    category_id!: number;

    @ManyToOne(() => FinancialCategory, (category) => category.transactions, { onDelete: 'CASCADE', eager: true })
    @JoinColumn({ name: 'category_id' })
    category!: FinancialCategory;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount!: number;

    @Column({ type: 'date' })
    transaction_date!: Date;

    @Column({ type: 'text', nullable: true })
    notes!: string;

    @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
    updated_at!: Date;
}
