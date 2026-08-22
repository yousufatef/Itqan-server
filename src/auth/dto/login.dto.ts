import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class LoginDto {
    @IsEmail({}, { message: i18nValidationMessage('validation.isEmail') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.emailRequired') })
    @MaxLength(255, { message: i18nValidationMessage('validation.emailLength') })
    email!: string;

    @IsNotEmpty({ message: i18nValidationMessage('validation.passwordRequired') })
    @MinLength(6, { message: i18nValidationMessage('validation.passwordLength') })
    @IsString({ message: i18nValidationMessage('validation.isString') })
    password!: string;
}
