import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthProvider } from './auth.provider';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/auth.dto';
import { ResponseMessage } from '../utils/decorators/response-message.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthProvider) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('common.users.loginSuccess')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('common.users.refreshSuccess')
    refreshToken(@Body() { refreshToken }: RefreshTokenDto) {
        return this.authService.refreshToken(refreshToken);
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('common.auth.otpSentIfExists')
    forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto);
    }

    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('common.auth.otpValid')
    verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.authService.verifyOtp(dto);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('common.auth.passwordResetSuccess')
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }
}
