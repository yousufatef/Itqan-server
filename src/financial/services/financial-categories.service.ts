import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialCategory } from '../entities/financial-category.entity';
import { CreateFinancialCategoryDto } from '../dto/create-financial-category.dto';
import { UpdateFinancialCategoryDto } from '../dto/update-financial-category.dto';
import { FinancialTransactionType } from '../../utils/enums';

@Injectable()
export class FinancialCategoriesService {
    constructor(
        @InjectRepository(FinancialCategory)
        private readonly categoryRepository: Repository<FinancialCategory>,
    ) { }

    async createCategory(dto: CreateFinancialCategoryDto): Promise<FinancialCategory> {
        const category = this.categoryRepository.create({
            name: dto.name,
            type: dto.type,
        });
        return this.categoryRepository.save(category);
    }

    async findAllCategories(type?: FinancialTransactionType): Promise<FinancialCategory[]> {
        const whereClause = type ? { type } : {};
        return this.categoryRepository.find({
            where: whereClause,
            order: { name: 'ASC' },
        });
    }

    async getCategoryById(id: number): Promise<FinancialCategory> {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new NotFoundException(`Financial category with ID ${id} not found`);
        }
        return category;
    }

    async updateCategory(id: number, dto: UpdateFinancialCategoryDto): Promise<FinancialCategory> {
        const category = await this.getCategoryById(id);
        Object.assign(category, dto);
        return this.categoryRepository.save(category);
    }

    async deleteCategory(id: number): Promise<{ message: string }> {
        const category = await this.getCategoryById(id);
        await this.categoryRepository.remove(category);
        return { message: `Financial category with ID ${id} deleted successfully` };
    }
}

