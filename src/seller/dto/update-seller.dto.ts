import { IsOptional, IsEmail, IsEnum, IsObject } from 'class-validator';
import type { SellerStatusType } from '../entities/seller.entity';

export class UpdateSellerDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'DELETED', 'SUSPENDED'], {
    message: 'Status must be ACTIVE, DELETED, or SUSPENDED',
  })
  status?: SellerStatusType;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;

  @IsOptional()
  deletedAt?: Date | null;
}
