

import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import type { SellerStatusType } from '../entities/seller.entity';
export class CreateSellerDto {
  @IsString()
  email: string;

  @IsEnum(['ACTIVE', 'DELETED', 'SUSPENDED'], {
    message: 'status must be ACTIVE, DELETED, or SUSPENDED',
  })
  @IsOptional()
  status?: SellerStatusType;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;
}