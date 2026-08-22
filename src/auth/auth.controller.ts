import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthProvider } from './auth.provider';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/auth.dto';
import { ResponseMessage } from '../utils/decorators/response-message.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthProvider) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ResponseMessage('users.registered')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('common.users.loginSuccess')
    login(@Body() loginDto: LoginDto) {
        return this.authService.loginUser(loginDto);
    }

    @Post('login-admin')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('common.users.loginSuccess')
    loginAdmin(@Body() loginDto: LoginDto) {
        return this.authService.loginAdmin(loginDto);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('common.users.refreshSuccess')
    refreshToken(@Body() { refreshToken }: RefreshTokenDto) {
        return this.authService.refreshToken(refreshToken);
    }
}
