// dto/refresh-token.dto.ts
import { IsJWT, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class RefreshTokenDto {
    @IsNotEmpty({ message: i18nValidationMessage('validation.refreshTokenRequired') })
    @IsJWT({ message: i18nValidationMessage('validation.isJWT') })
    refreshToken!: string;
}
