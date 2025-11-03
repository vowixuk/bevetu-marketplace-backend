/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import * as bodyParser from 'body-parser';
import { ValidationPipe, VersioningType } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
  });
  /**
   *  ---- Swagger config ----
   */
  const config = new DocumentBuilder()
    .setTitle('Bevetu Marketplace')
    .setDescription('API documentation for Bevetu Marketplace Server')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.use(cookieParser());

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : [];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        // Allow requests with no origin (e.g. curl, Postman)
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy: Origin not allowed'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'x-csrf-token', 'authorization'],
    exposedHeaders: ['authorization', 'Set-Cookie', 'x-csrf-token'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
  } else {
    app.use(
      helmet({
        frameguard: { action: 'sameorigin' },
        contentSecurityPolicy: false,
        hsts: false,
        noSniff: false,
      }),
    );
  }

  /**
   * Stripe webhook signature verification requires the raw request body,
   * not the parsed JSON.
   *
   * This middleware attaches the raw body buffer to `req.rawBody` so that
   * it can be used later in the Stripe webhook handler.
   */
  app.use(
    bodyParser.json({
      verify: (req: any, res, buf) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        req.rawBody = buf;
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3004);
}
bootstrap();
