import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { FinancialCategoriesService } from '../services/financial-categories.service';
import { CreateFinancialCategoryDto } from '../dto/create-financial-category.dto';
import { UpdateFinancialCategoryDto } from '../dto/update-financial-category.dto';
import { FinancialTransactionType } from '../../utils/enums';
import { AuthRoleGuard } from '../../users/guards/auth-role.guard';
import { ResponseMessage } from '../../utils/decorators/response-message.decorator';

@Controller('financial/categories')
export class FinancialCategoriesController {
    constructor(private readonly categoriesService: FinancialCategoriesService) { }

    @Get()
    @UseGuards(AuthRoleGuard)
    @ResponseMessage('common.categories.listRetrieved')
    findAll(@Query('type') type?: FinancialTransactionType) {
        return this.categoriesService.findAllCategories(type);
    }

    @Get(':id')
    @UseGuards(AuthRoleGuard)
    @ResponseMessage('common.categories.retrieved')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.categoriesService.getCategoryById(id);
    }

    @Post()
    @UseGuards(AuthRoleGuard)
    @ResponseMessage('common.categories.created')
    create(@Body() dto: CreateFinancialCategoryDto) {
        return this.categoriesService.createCategory(dto);
    }

    @Patch(':id')
    @UseGuards(AuthRoleGuard)
    @ResponseMessage('common.categories.updated')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFinancialCategoryDto) {
        return this.categoriesService.updateCategory(id, dto);
    }

    @Delete(':id')
    @UseGuards(AuthRoleGuard)
    @ResponseMessage('common.categories.deleted')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.categoriesService.deleteCategory(id);
    }
}

