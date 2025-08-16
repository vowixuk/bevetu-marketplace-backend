import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class PreviewProrationAmountDto {
  @IsString()
  @IsNotEmpty()
  stripeCustomerId: string;
  @IsString()
  @IsNotEmpty()
  stripeSubscriptionId: string;
  @IsString()
  @IsNotEmpty()
  stripeSubscriptionItemId: string;
  @IsInt()
  @Min(1)
  quantity: number;

  newPriceId: string

}
