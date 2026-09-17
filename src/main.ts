import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import helmet from 'helmet';
import { I18nValidationPipe } from 'nestjs-i18n';
import type { Request, Response } from 'express';

const expressApp = express();
let isInitialized = false;
let bootstrapPromise: Promise<void> | null = null;

async function bootstrap(): Promise<void> {
  if (isInitialized) return;
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

    app.useGlobalPipes(
      new I18nValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://itqan-lovat.vercel.app',
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    });

    // ✅ helmet AFTER cors
    app.use(
      helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' }, // ← critical
      }),
    );

    if (process.env.VERCEL) {
      // Serverless: initialise middleware without starting an HTTP server
      await app.init();
    } else {
      // Local dev / traditional server
      await app.listen(process.env.PORT ?? 3001);
    }

    isInitialized = true;
  })();

  return bootstrapPromise;
}

// ─── Vercel serverless handler ────────────────────────────────────────────────
export default async function handler(req: Request, res: Response) {
  await bootstrap();
  expressApp(req, res);
}

// ─── Start HTTP server when NOT running on Vercel (local dev, Docker, etc.) ──
if (!process.env.VERCEL) {
  bootstrap().catch(console.error);
}
