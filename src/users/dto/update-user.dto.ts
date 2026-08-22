import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsOptional, IsPositive, IsString, Length } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsString({ message: i18nValidationMessage('validation.isString') })
    @IsOptional()
    @Length(2, 150, { message: i18nValidationMessage('validation.usernameLength') })
    username?: string;

    @IsString({ message: i18nValidationMessage('validation.isString') })
    @IsOptional()
    @Length(8, 128, { message: i18nValidationMessage('validation.passwordLength') })
    password?: string;

    @IsInt({ message: i18nValidationMessage('validation.roleIdInt') })
    @IsPositive({ message: i18nValidationMessage('validation.roleIdPositive') })
    @IsOptional()
    roleId?: number;
}
