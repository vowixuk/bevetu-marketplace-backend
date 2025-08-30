import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import type { IProductCode } from '../entities/vo/product.vo';
export class CompleteSellerListingSubscriptionEnrollmentDto {
  @IsString()
  @IsNotEmpty()
  stripeCustomerId: string;

  @IsString()
  @IsNotEmpty()
  stripeSubscriptionId: string;

  @IsString()
  @IsNotEmpty()
  stripeSubscriptionItemId: string | null;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  buyerId: string;

  @IsString()
  @IsNotEmpty()
  sellerId: string;

  @IsNotEmpty()
  productCode: IProductCode;

  @IsNumber()
  amount: number;
  @IsString()
  currency: number;

  @IsNumber()
  quantity: number;
}
