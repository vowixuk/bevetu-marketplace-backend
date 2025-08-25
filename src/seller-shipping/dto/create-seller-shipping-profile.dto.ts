import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class CreateSellerShippingProfileDto {
  @IsString()
  shopId: string;

  @IsString()
  sellerShippingId: string;

  @IsString()
  name: string;

  @IsEnum(['flat', 'per_item', 'by_weight', 'free'], { each: false })
  feeType: 'flat' | 'per_item' | 'by_weight' | 'free';

  @IsNumber()
  feeAmount: number;

  @IsString()
  currency: string;

  @IsString()
  originCountry: string;

  @IsString()
  originZip: string;

  @IsOptional()
  @IsNumber()
  freeShippingThresholdAmount?: number;

  @IsOptional()
  @IsBoolean()
  buyerPickUp?: boolean;

  @IsOptional()
  @IsString()
  buyerPickUpLocation?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportedRegions?: string[];

  @IsOptional()
  @IsNumber()
  estimatedDeliveryMinDays?: number;

  @IsOptional()
  @IsNumber()
  estimatedDeliveryMaxDays?: number;
}
