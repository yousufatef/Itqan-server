import { IsInt, IsPositive } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Type } from 'class-transformer';

export class UserIdDto {
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.isInt') })
  @IsPositive({ message: i18nValidationMessage('validation.isPositive') })
  id!: number;
}
