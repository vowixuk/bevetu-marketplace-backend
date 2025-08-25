import { Module } from '@nestjs/common';
import { SellerShippingService } from './services/seller-shipping.service';
import { SellerShippingController } from './seller-shipping.controller';
import { SellerShippingRepository } from './repositories/seller-shipping.repository';
import { SellerShippingProfileService } from './services/seller-shipping-profile.service';
import { SellerShippingProfileRepository } from './repositories/seller-shipping-profile.repository';

@Module({
  controllers: [SellerShippingController],
  providers: [
    SellerShippingService,
    SellerShippingRepository,
    SellerShippingProfileService,
    SellerShippingProfileRepository,
  ],
  exports: [
    SellerShippingService,
    SellerShippingRepository,
    SellerShippingProfileService,
    SellerShippingProfileRepository,
  ],
})
export class SellerShippingModule {}
