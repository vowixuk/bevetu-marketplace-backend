import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsObject,
  Length,
  Min,
} from 'class-validator';
import { type OrderRefundStatus } from '../entities/order-item.entity';

export class CreateOrderItemDto {
  @IsString()
  orderId: string;

  @IsString()
  shopId: string;

  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  varientId?: string;

  @IsString()
  @Length(1, 255)
  productName: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  shippingFee: number;

  @IsNumber()
  @Min(0)
  discount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  refundedQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  refundedAmount?: number;

  @IsEnum(['NONE', 'REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED'])
  refundStatus: OrderRefundStatus;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  remark?: string;
}
