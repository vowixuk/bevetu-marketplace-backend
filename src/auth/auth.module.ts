import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import { AuthUseCase } from './services/auth.useCase';
import { StripeModule } from 'src/stripe/stripe.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [JwtModule.register({}), StripeModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService, AuthUseCase],
  exports: [AuthService, JwtModule, AuthUseCase],
})
export class AuthModule {}
