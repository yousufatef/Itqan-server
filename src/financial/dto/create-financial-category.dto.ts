import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { FinancialTransactionType } from '../../utils/enums';

export class CreateFinancialCategoryDto {
    @IsString({ message: i18nValidationMessage('validation.isString') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
    name!: string;

    @IsEnum(FinancialTransactionType, { message: i18nValidationMessage('validation.isEnum') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
    type!: FinancialTransactionType;
}
