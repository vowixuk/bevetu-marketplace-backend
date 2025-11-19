import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { type OrderStatus } from '../entities/order.entity';

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsEnum(['CREATED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  orderStatus: OrderStatus;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;

  @IsOptional()
  @IsString()
  remark?: string;
}
