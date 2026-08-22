import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { FinancialCategoriesService } from '../services/financial-categories.service';

@Controller('financial/categories')
export class FinancialCategoriesController {
    constructor(private readonly categoriesService: FinancialCategoriesService) { }

    // TODO: implement
    @Get()
    findAll() {
        console.log('endpoint hit: GET /financial/categories');
        return { message: 'Financial categories list placeholder' };
    }

    // TODO: implement
    @Post()
    create(@Body() body: any) {
        console.log('endpoint hit: POST /financial/categories');
        return { message: 'Financial category created placeholder', body };
    }

    // TODO: implement
    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any) {
        console.log(`endpoint hit: PATCH /financial/categories/${id}`);
        return { message: 'Financial category updated placeholder', id, body };
    }

    // TODO: implement
    @Delete(':id')
    remove(@Param('id') id: string) {
        console.log(`endpoint hit: DELETE /financial/categories/${id}`);
        return { message: 'Financial category deleted placeholder', id };
    }
}
