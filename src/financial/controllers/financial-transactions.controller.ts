import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { FinancialTransactionsService } from '../services/financial-transactions.service';
import { CreateFinancialTransactionDto } from '../dto/create-financial-transaction.dto';
import { UpdateFinancialTransactionDto } from '../dto/update-financial-transaction.dto';
import { FinancialTransactionType } from '../../utils/enums';
import { AuthRoleGuard } from '../../users/guards/auth-role.guard';
import { ResponseMessage } from '../../utils/decorators/response-message.decorator';

@Controller('financial/transactions')
export class FinancialTransactionsController {
    constructor(private readonly transactionsService: FinancialTransactionsService) { }

    @Get()
    @UseGuards(AuthRoleGuard)
    @ResponseMessage('common.transactions.listRetrieved')
    findAll(
        @Query('page') page = '1',
        @Query('limit') limit = '10',
        @Query('categoryId') categoryId?: string,
        @Query('type') type?: FinancialTransactionType,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('searchTerm') searchTerm?: string,
    ) {
        const parsedPage = Math.max(1, parseInt(page, 10) || 1);
        const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const parsedCategoryId = categoryId ? parseInt(categoryId, 10) || undefined : undefined;

        return this.transactionsService.getPaginatedTransactions(
            parsedPage,
            parsedLimit,
            parsedCategoryId,
            type,
            startDate,
            endDate,
            searchTerm?.trim(),
        );
    }

    @Get(':id')
    @UseGuards(AuthRoleGuard)
    @ResponseMessage('common.transactions.retrieved')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.transactionsService.getTransactionById(id);
    }

    @Post()
    @UseGuards(AuthRoleGuard)
    @ResponseMessage('common.transactions.created')
    create(@Body() dto: CreateFinancialTransactionDto) {
        return this.transactionsService.createTransaction(dto);
    }

    @Patch(':id')
    @UseGuards(AuthRoleGuard)
    @ResponseMessage('common.transactions.updated')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFinancialTransactionDto) {
        return this.transactionsService.updateTransaction(id, dto);
    }

    @Delete(':id')
    @UseGuards(AuthRoleGuard)
    @ResponseMessage('common.transactions.deleted')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.transactionsService.deleteTransaction(id);
    }
}

