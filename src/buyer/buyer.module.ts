import { Module } from '@nestjs/common';
import { BuyerService } from './services/buyer.service';
import { BuyerController } from './buyer.controller';
import { BuyerRepository } from './buyer.repository';
import { BuyerUseCase } from './use-cases/buyer.usecase';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [StripeModule],
  controllers: [BuyerController],
  providers: [BuyerService, BuyerRepository, BuyerUseCase],
  exports: [BuyerService, BuyerUseCase],
})
export class BuyerModule {}
