import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { FinancialTransactionType } from '../../utils/enums';
import { CURRENT_TIMESTAMP } from '../../utils/constants';
import { FinancialTransaction } from './financial-transaction.entity';

@Entity({ name: 'financial_categories' })
export class FinancialCategory {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 250 })
    name!: string;

    @Column({ type: 'enum', enum: FinancialTransactionType })
    type!: FinancialTransactionType;

    @OneToMany(() => FinancialTransaction, (transaction) => transaction.category)
    transactions!: FinancialTransaction[];

    @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
    created_at!: Date;
}
