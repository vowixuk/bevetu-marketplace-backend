import { Module } from '@nestjs/common';
import { SellerShippingService } from './services/seller-shipping.service';
import { SellerShippingController } from './seller-shipping.controller';
import { SellerShippingRepository } from './repositories/seller-shipping.repository';

@Module({
  controllers: [SellerShippingController],

  providers: [SellerShippingService, SellerShippingRepository],
})
export class SellerShippingModule {}
