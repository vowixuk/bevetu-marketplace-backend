import { Module } from '@nestjs/common';
import { SellerService } from './services/seller.service';
import { SellerRepository } from './seller.repository';
import { SellerUseCase } from './use-cases/seller.useCase';
import { StripeModule } from 'src/stripe/stripe.module';
import { ShopModule } from 'src/shop/shop.module';
import { SellerController } from './seller.controller';

@Module({
  imports: [StripeModule, ShopModule],
  controllers: [SellerController],
  providers: [SellerService, SellerUseCase, SellerRepository],
})
export class SellerModule {}
