import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsObject,
} from 'class-validator';

export class CreateShopDto {
  @IsString()
  @IsNotEmpty()
  sellerId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  shopUrl: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;
}
