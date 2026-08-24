import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthProvider } from './auth.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Otp } from '../otp/entities/otp.entity';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '../mail/mail.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Otp]),
        JwtModule.register({}),
        MailModule,
        ConfigModule,
    ],
    controllers: [AuthController],
    providers: [AuthProvider],
    exports: [AuthProvider],
})
export class AuthModule { }