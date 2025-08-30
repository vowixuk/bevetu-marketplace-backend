import { Module } from '@nestjs/common';
import { StripeService } from './services/stripe.service';
import { BuyerStripeCustomerAccountMappingService } from './services/buyer-account-mapping.service';
import { SellerStripeAccountMappingService } from './services/seller-account-mapping.service';
import { BuyerStripeCustomerAccountMappingRepository } from './repositories/buyer-account-mapping.repository';
import { SellerStripeAccountMappingRepository } from './repositories/seller-account-mapping.repository';
import { SellerSubscriptionMappingService } from './services/seller-subscription-mapping.service';
import { SellerSubscriptionMappingRepository } from './repositories/seller-subscription-mapping.repository';
import { SubscriptionModule } from '../seller-subscription/sellerSubscription.module';
import { StripeWebhook } from './stripe.webhook';
import { StripeCacheService } from './cache/stripe.cache-service';
@Module({
  imports: [SubscriptionModule],
  controllers: [StripeWebhook],
  providers: [
    StripeCacheService,
    StripeService,
    SellerStripeAccountMappingRepository,
    BuyerStripeCustomerAccountMappingRepository,
    SellerStripeAccountMappingService,
    BuyerStripeCustomerAccountMappingService,
    SellerSubscriptionMappingService,
    SellerSubscriptionMappingRepository,
  ],
  exports: [
    StripeService,
    SellerStripeAccountMappingRepository,
    BuyerStripeCustomerAccountMappingRepository,
    SellerStripeAccountMappingService,
    BuyerStripeCustomerAccountMappingService,
    SellerSubscriptionMappingService,
    SellerSubscriptionMappingRepository,
  ],
})
export class StripeModule {}
