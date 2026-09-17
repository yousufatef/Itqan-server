import { ClassSerializerInterceptor, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { join } from 'path';
import { existsSync } from 'fs';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import basicAuth from 'express-basic-auth';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TeachersModule } from './teachers/teachers.module';
import { ParentsModule } from './parents/parents.module';
import { StudentsModule } from './students/students.module';
import { CirclesModule } from './circles/circles.module';
import { DailyRecordsModule } from './daily-records/daily-records.module';
import { FinancialModule } from './financial/financial.module';
import { PublicModule } from './public/public.module';
import { LoggerMiddleware } from './utils/middlewares/logger.middleware';
import { ApiResponseInterceptor } from './utils/interceptors/api-response.interceptor';
import { ApiExceptionFilter } from './utils/filters/api-exception.filter';
import { dataSourceOptions } from './db/data-source';

const i18nPath = [
  join(process.cwd(), 'dist', 'i18n'),
  join(process.cwd(), 'src', 'i18n'),
  join(__dirname, 'i18n'),
  join(__dirname, '..', 'i18n'),
  join(__dirname, 'src', 'i18n'),
  join(__dirname, '..', 'src', 'i18n'),
].find((path) => existsSync(path)) ?? join(process.cwd(), 'src', 'i18n');

const redisUrl = process.env.REDIS_URL;

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: i18nPath,
        watch: process.env.NODE_ENV !== 'production',
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    UsersModule,
    AuthModule,
    TeachersModule,
    ParentsModule,
    StudentsModule,
    CirclesModule,
    DailyRecordsModule,
    FinancialModule,
    PublicModule,
    ConfigModule.forRoot({
      isGlobal: true,
      // Load .env first (DATABASE_URL remote), then env-specific file for other vars
      envFilePath: ['.env', process.env.NODE_ENV !== 'production' ? `.env.${process.env.NODE_ENV || 'development'}` : '.env'],
    }),
    // ── BullMQ + Bull Board (only when Redis is configured) ─────────────────
    ...(redisUrl
      ? [
          BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
              const url = new URL(configService.get<string>('REDIS_URL')!);
              return {
                connection: {
                  host: url.hostname,
                  port: Number(url.port) || 6379,
                  username: url.username || undefined,
                  password: url.password || undefined,
                  tls: url.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined,
                  maxRetriesPerRequest: null,
                },
              };
            },
          }),
          BullBoardModule.forRoot({
            route: '/admin/queues',
            adapter: ExpressAdapter,
            middleware: basicAuth({
              users: {
                [process.env.BULL_BOARD_USER || 'admin']: process.env.BULL_BOARD_PASSWORD || 'admin',
              },
              challenge: true,
            }),
          }),
        ]
      : []),
    // ─────────────────────────────────────────────────────────────────────────
    ThrottlerModule.forRoot({
      throttlers: [{
        ttl: 60000,
        limit: 10,
      }],
    }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({
        path: 'products',
        method: RequestMethod.GET,
      });
  }
}
