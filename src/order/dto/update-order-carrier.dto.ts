import { IsString, IsOptional, IsDateString, Length } from 'class-validator';

export class UpdateOrderCarrierDto {
  @IsString()
  @Length(1, 100)
  carrierName?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  serviceType?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  trackingUrl?: string;

  @IsOptional()
  @IsDateString()
  shippedAt?: string;

  @IsOptional()
  @IsDateString()
  estimatedDelivery?: string;

  @IsOptional()
  @IsDateString()
  deliveredAt?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  remark?: string;
}
