import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateFinancialTransactionDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: i18nValidationMessage('validation.isNumber') })
    category_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: i18nValidationMessage('validation.isNumber') })
    @Min(0, { message: i18nValidationMessage('validation.min') })
    amount?: number;

    @IsOptional()
    @IsDateString({}, { message: i18nValidationMessage('validation.isDateString') })
    transaction_date?: string;

    @IsOptional()
    @IsString({ message: i18nValidationMessage('validation.isString') })
    notes?: string;
}


