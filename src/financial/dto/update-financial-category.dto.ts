import { IsEnum, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { FinancialTransactionType } from '../../utils/enums';

export class UpdateFinancialCategoryDto {
    @IsOptional()
    @IsString({ message: i18nValidationMessage('validation.isString') })
    name?: string;

    @IsOptional()
    @IsEnum(FinancialTransactionType, { message: i18nValidationMessage('validation.isEnum') })
    type?: FinancialTransactionType;
}


