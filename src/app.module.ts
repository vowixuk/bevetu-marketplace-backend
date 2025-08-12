import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import {
  AuthMiddleware,
  authMiddlewareExclusionList,
} from './auth/middlewares/auth.middleware';
import {
  CsrfMiddleware,
  csrfMiddlewareExclusionList,
} from './auth/middlewares/csrf.middleware';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { UserModule } from './user/user.module';
import { StripeModule } from './stripe/stripe.module';
import { SellerModule } from './seller/seller.module';
import { ShopModule } from './shop/shop.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 600,
        limit: 1000000,
      },
    ]),
    AuthModule,
    UserModule,
    StripeModule,
    SellerModule,
    DatabaseModule,
    SellerModule,
    ShopModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // middleware that verifies access and refresh token
    consumer
      .apply(AuthMiddleware)
      .exclude(...authMiddlewareExclusionList)
      .forRoutes('*');

    // middleware that verifies Csrf token
    consumer
      .apply(CsrfMiddleware)
      .exclude(...csrfMiddlewareExclusionList)
      .forRoutes('*');
  }
}
