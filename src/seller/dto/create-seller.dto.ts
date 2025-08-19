import { IsEnum, IsObject, IsOptional } from 'class-validator';
import type { SellerStatusType } from '../entities/seller.entity';
export class CreateSellerDto {
  @IsEnum(['ACTIVE', 'PENDING', 'DELETED', 'SUSPENDED'], {
    message: 'status must be ACTIVE, DELETED, or SUSPENDED',
  })
  status: SellerStatusType;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;
}
