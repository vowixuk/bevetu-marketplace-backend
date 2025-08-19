import { Module } from '@nestjs/common';
import { SellerShippingService } from './seller-shipping.service';
import { SellerShippingController } from './seller-shipping.controller';

@Module({
  controllers: [SellerShippingController],
  providers: [SellerShippingService],
})
export class SellerShippingModule {}
