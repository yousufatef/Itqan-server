import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MaxLength, MinLength } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class RegisterDto {
    @IsEmail({}, { message: i18nValidationMessage('validation.isEmail') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.emailRequired') })
    @MaxLength(250, { message: i18nValidationMessage('validation.emailLength') })
    email!: string;

    @Length(2, 150, { message: i18nValidationMessage('validation.usernameLength') })
    @IsString({ message: i18nValidationMessage('validation.isString') })
    @IsOptional()
    username!: string;

    @IsNotEmpty({ message: i18nValidationMessage('validation.passwordRequired') })
    @MinLength(6, { message: i18nValidationMessage('validation.passwordLength') })
    @IsString({ message: i18nValidationMessage('validation.isString') })
    password!: string;
}
