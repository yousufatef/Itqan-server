import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthProvider } from './auth.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Otp } from '../otp/entities/otp.entity';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '../mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { OtpProcessor } from './otp.processor';

// Only register the queue when a Redis connection is available
const queueModules = process.env.REDIS_URL
    ? [
          BullModule.registerQueue({ name: 'otp-queue' }),
          BullBoardModule.forFeature({
              name: 'otp-queue',
              adapter: BullMQAdapter,
          }),
      ]
    : [];

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Otp]),
        JwtModule.register({}),
        MailModule,
        ConfigModule,
        ...queueModules,
    ],
    controllers: [AuthController],
    providers: [AuthProvider, OtpProcessor],
    exports: [AuthProvider],
})
export class AuthModule { }