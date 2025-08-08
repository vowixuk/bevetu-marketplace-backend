import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
