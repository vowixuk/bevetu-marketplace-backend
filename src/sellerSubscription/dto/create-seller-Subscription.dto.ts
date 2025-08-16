import { subscriptionItems } from '../entities/seller-subscription.entity';
import { SubscriptionStatusType } from '../entities/vo/subscription-status.vo';

export class CreateSellerSubscriptionDto {
  nextPaymentDate: Date;
  status: SubscriptionStatusType;
  items: subscriptionItems[];
}
