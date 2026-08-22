export class CreateFinancialTransactionDto {
    category_id!: number;
    amount!: number;
    transaction_date!: Date;
    notes?: string;
}
