import { Module } from '@nestjs/common';
import { StripeService } from './services/stripe.service';
import { BuyerStripeCustomerAccountMappingService } from './services/buyer-account-mapping.service';
import { SellerStripeAccountMappingService } from './services/seller-account-mapping.service';
import { BuyerStripeCustomerAccountMappingRepository } from './repositories/buyer-account-mapping.repository';
import { SellerStripeAccountMappingRepository } from './repositories/seller-account-mapping.repository';
@Module({
  controllers: [],
  providers: [
    StripeService,
    SellerStripeAccountMappingRepository,
    BuyerStripeCustomerAccountMappingRepository,
    SellerStripeAccountMappingService,
    BuyerStripeCustomerAccountMappingService,
  ],
  exports: [
    StripeService,
    SellerStripeAccountMappingService,
    BuyerStripeCustomerAccountMappingService,
  ],
})
export class StripeModule {}
