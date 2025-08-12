import { Module } from '@nestjs/common';
import { StripeService } from './services/stripe.service';
import { BuyerStripeAccountMappingService } from './services/buyer-account-mapping.service';
import { SellerStripeAccountMappingService } from './services/seller-account-mapping.service';
import { BuyerStripeAccountMappingRepository } from './repositories/buyer-account-mapping.repository';
import { SellerStripeAccountMappingRepository } from './repositories/seller-account-mapping.repository';
@Module({
  controllers: [],
  providers: [
    StripeService,
    SellerStripeAccountMappingRepository,
    BuyerStripeAccountMappingRepository,
    SellerStripeAccountMappingService,
    BuyerStripeAccountMappingService,
  ],
  exports: [
    StripeService,
    SellerStripeAccountMappingService,
    BuyerStripeAccountMappingService,
  ],
})
export class StripeModule {}
