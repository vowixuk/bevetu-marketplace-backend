import { Module } from '@nestjs/common';
import { SubscriptionService } from './sellerSubscription.service';
import { SubscriptionController } from './sellerSubscription.controller';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubscriptionModule {}
