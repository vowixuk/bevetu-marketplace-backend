import { Module } from '@nestjs/common';
import { SellerSubscriptionService } from './services/seller-subscription.service';
import { SubscriptionEventRecordService } from './services/event-record.service';
import { SubscriptionEventRecordRepository } from './repositories/event-record.repository';
import { SellerSubscriptionRepository } from './repositories/seller-subscription.repository';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [StripeModule],
  controllers: [],
  providers: [
    SellerSubscriptionService,
    SubscriptionEventRecordService,
    SubscriptionEventRecordRepository,
    SellerSubscriptionRepository,
  ],
  exports: [
    SellerSubscriptionService,
    SubscriptionEventRecordService,
    SellerSubscriptionRepository,
  ],
})
export class SubscriptionModule {}
