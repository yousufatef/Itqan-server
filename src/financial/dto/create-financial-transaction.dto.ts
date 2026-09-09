import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateFinancialTransactionDto {
    @Type(() => Number)
    @IsNumber({}, { message: i18nValidationMessage('validation.isNumber') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
    category_id!: number;

    @Type(() => Number)
    @IsNumber({}, { message: i18nValidationMessage('validation.isNumber') })
    @Min(0, { message: i18nValidationMessage('validation.min') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
    amount!: number;

    @IsDateString({}, { message: i18nValidationMessage('validation.isDateString') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
    transaction_date!: string;

    @IsOptional()
    @IsString({ message: i18nValidationMessage('validation.isString') })
    notes?: string;
}
