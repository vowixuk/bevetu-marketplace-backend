import { Module } from '@nestjs/common';
import { SellerSubscriptionService } from './services/seller-subscription.service';
import { SubscriptionEventRecordService } from './services/event-record.service';
import { SubscriptionEventRecordRepository } from './repositories/event-record.repository';
import { SellerSubscriptionRepository } from './repositories/seller-subscription.repository';
import { StripeModule } from '../stripe/stripe.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SellerSubscriptionController } from './sellerSubscritpion.controller';

@Module({
  imports: [StripeModule, EventEmitterModule],
  controllers: [SellerSubscriptionController],
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
