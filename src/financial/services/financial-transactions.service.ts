import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialTransaction } from '../entities/financial-transaction.entity';
import { FinancialCategory } from '../entities/financial-category.entity';
import { CreateFinancialTransactionDto } from '../dto/create-financial-transaction.dto';
import { UpdateFinancialTransactionDto } from '../dto/update-financial-transaction.dto';
import { FinancialTransactionType } from '../../utils/enums';

@Injectable()
export class FinancialTransactionsService {
    constructor(
        @InjectRepository(FinancialTransaction)
        private readonly transactionRepository: Repository<FinancialTransaction>,
        @InjectRepository(FinancialCategory)
        private readonly categoryRepository: Repository<FinancialCategory>,
    ) { }

    async createTransaction(dto: CreateFinancialTransactionDto): Promise<FinancialTransaction> {
        const category = await this.categoryRepository.findOne({ where: { id: dto.category_id } });
        if (!category) {
            throw new NotFoundException(`Financial category with ID ${dto.category_id} not found`);
        }

        const transaction = this.transactionRepository.create({
            category_id: dto.category_id,
            amount: dto.amount,
            transaction_date: dto.transaction_date,
            notes: dto.notes,
        });

        const saved = await this.transactionRepository.save(transaction);
        return this.getTransactionById(saved.id);
    }

    async getPaginatedTransactions(
        page = 1,
        limit = 10,
        categoryId?: number,
        type?: FinancialTransactionType,
        startDate?: string,
        endDate?: string,
        searchTerm?: string,
    ) {
        const query = this.transactionRepository
            .createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.category', 'category');

        if (categoryId) {
            query.andWhere('transaction.category_id = :categoryId', { categoryId });
        }

        if (type) {
            query.andWhere('category.type = :type', { type });
        }

        if (startDate) {
            query.andWhere('transaction.transaction_date >= :startDate', { startDate });
        }

        if (endDate) {
            query.andWhere('transaction.transaction_date <= :endDate', { endDate });
        }

        if (searchTerm) {
            query.andWhere(
                '(transaction.notes ILike :search OR category.name ILike :search)',
                { search: `%${searchTerm}%` },
            );
        }

        query
            .orderBy('transaction.transaction_date', 'DESC')
            .addOrderBy('transaction.id', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await query.getManyAndCount();

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getTransactionById(id: number): Promise<FinancialTransaction> {
        const transaction = await this.transactionRepository.findOne({
            where: { id },
            relations: ['category'],
        });
        if (!transaction) {
            throw new NotFoundException(`Financial transaction with ID ${id} not found`);
        }
        return transaction;
    }

    async updateTransaction(id: number, dto: UpdateFinancialTransactionDto): Promise<FinancialTransaction> {
        const transaction = await this.getTransactionById(id);

        if (dto.category_id !== undefined && dto.category_id !== transaction.category_id) {
            const category = await this.categoryRepository.findOne({ where: { id: dto.category_id } });
            if (!category) {
                throw new NotFoundException(`Financial category with ID ${dto.category_id} not found`);
            }
        }

        Object.assign(transaction, dto);
        await this.transactionRepository.save(transaction);
        return this.getTransactionById(id);
    }

    async deleteTransaction(id: number): Promise<{ message: string }> {
        const transaction = await this.getTransactionById(id);
        await this.transactionRepository.remove(transaction);
        return { message: `Financial transaction with ID ${id} deleted successfully` };
    }
}

