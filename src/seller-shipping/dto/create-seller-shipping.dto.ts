// create-seller-shipping.dto.ts
import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FreeShippingOptionDto {
  @IsString()
  freeShippingThresholdAmount: string;

  @IsString()
  currency: string;
}

export class CreateSellerShippingDto {
  @IsString()
  shopId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => FreeShippingOptionDto)
  freeShippingOption?: FreeShippingOptionDto;
}
