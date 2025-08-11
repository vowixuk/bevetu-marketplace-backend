import { IsString, IsNotEmpty } from 'class-validator';

export class CreateBuyerStripeAccountMappingDto {
  @IsString()
  @IsNotEmpty()
  stripeCustomerId: string;

  @IsString()
  @IsNotEmpty()
  identifyId: string;
}
