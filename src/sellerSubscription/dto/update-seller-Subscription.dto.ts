import { PartialType } from '@nestjs/swagger';
import { CreateSellerSubscriptionDto } from './create-seller-Subscription.dto';

export class UpdateSellerSubscriptionDto extends PartialType(
  CreateSellerSubscriptionDto,
) {}
