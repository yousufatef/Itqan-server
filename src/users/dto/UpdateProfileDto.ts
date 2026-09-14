import { IsEmail, IsOptional, IsString, Length, Matches } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateProfileDto {

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
}

