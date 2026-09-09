import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialCategoriesController } from './controllers/financial-categories.controller';
import { FinancialTransactionsController } from './controllers/financial-transactions.controller';
import { FinancialCategoriesService } from './services/financial-categories.service';
import { FinancialTransactionsService } from './services/financial-transactions.service';
import { FinancialCategory } from './entities/financial-category.entity';
import { FinancialTransaction } from './entities/financial-transaction.entity';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([FinancialCategory, FinancialTransaction]),
        UsersModule,
    ],
    controllers: [FinancialCategoriesController, FinancialTransactionsController],
    providers: [FinancialCategoriesService, FinancialTransactionsService],
    exports: [FinancialCategoriesService, FinancialTransactionsService],
})
export class FinancialModule { }

