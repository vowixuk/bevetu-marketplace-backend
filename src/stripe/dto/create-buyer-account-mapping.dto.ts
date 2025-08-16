import { IsString, IsNotEmpty } from 'class-validator';

export class CreateBuyerStripeCustomerAccountMappingDto {
  @IsString()
  @IsNotEmpty()
  stripeCustomerId: string;

  @IsString()
  @IsNotEmpty()
  identifyId: string;
}
