import { IsEmail, IsEnum, IsInt, IsOptional, IsPositive, IsString, Length, Matches } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Type } from 'class-transformer';
import { UserRole } from '../../utils/enums';

export class AdminUpdateUserDto {
  @IsInt({ message: i18nValidationMessage('validation.isInt') })
  @IsPositive({ message: i18nValidationMessage('validation.isPositive') })
  @Type(() => Number)
  id!: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @Length(2, 150, { message: i18nValidationMessage('validation.usernameLength') })
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: i18nValidationMessage('validation.isEmail') })
  email?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @Matches(/^\+?[0-9\s\-()]{7,20}$/, {
    message: i18nValidationMessage('validation.isPhoneNumber'),
  })
  phoneNumber?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: i18nValidationMessage('validation.isEnum') })
  role?: UserRole;
}
