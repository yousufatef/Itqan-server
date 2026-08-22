import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { FinancialTransactionsService } from '../services/financial-transactions.service';

@Controller('financial/transactions')
export class FinancialTransactionsController {
    constructor(private readonly transactionsService: FinancialTransactionsService) { }

    // TODO: implement
    @Get()
    findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
        console.log('endpoint hit: GET /financial/transactions');
        return { message: 'Financial transactions list placeholder', page, limit };
    }

    // TODO: implement
    @Post()
    create(@Body() body: any) {
        console.log('endpoint hit: POST /financial/transactions');
        return { message: 'Financial transaction created placeholder', body };
    }

    // TODO: implement
    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any) {
        console.log(`endpoint hit: PATCH /financial/transactions/${id}`);
        return { message: 'Financial transaction updated placeholder', id, body };
    }

    // TODO: implement
    @Delete(':id')
    remove(@Param('id') id: string) {
        console.log(`endpoint hit: DELETE /financial/transactions/${id}`);
        return { message: 'Financial transaction deleted placeholder', id };
    }
}
