import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { SellerShippingProfile } from '../entities/seller-shipping-profile.entity';
export class CreateSellerShippingProfileDto {
  @IsString()
  shopId: string;

  @IsString()
  sellerShippingId: string;

  @IsString()
  name: string;

  @IsEnum(SellerShippingProfile['feeType'])
  feeType: SellerShippingProfile['feeType'];

  @IsNumber()
  feeAmount: number;

  @IsString()
  currency: string;

  @IsString()
  originCountry: string;

  @IsString()
  originZip: string;

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
