import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSellerStripeAccountMappingDto {
  @IsString()
  @IsNotEmpty()
  sellerId: string;

  @IsString()
  @IsNotEmpty()
  stripeAccountId: string;

  @IsString()
  @IsNotEmpty()
  identifyId: string;
}
