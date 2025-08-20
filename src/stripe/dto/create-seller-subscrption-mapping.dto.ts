import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { StripeSubscriptionItems } from '../entities/seller-subscription-mapping.entity';
import type { IProductCode } from 'src/seller-subscription/entities/vo/product.vo';

export class CreateSellerSubscriptionMappingDto {
  @IsString()
  bevetuSubscriptionId: string;

  @IsString()
  identifyId: string;

  @IsString()
  stripeCustomerId: string;

  @IsString()
  stripeSubscriptionId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StripeSubscriptionItemDto)
  stripeSubscriptionItems: StripeSubscriptionItems[];
}

// Optional: helper DTO for nested array validation
export class StripeSubscriptionItemDto {
  @IsString()
  stripItemId: string;

  quantity: number;

  @IsString()
  category: 'LISTING_SUBSCRIPTION';

  @IsString()
  name: IProductCode;
}
