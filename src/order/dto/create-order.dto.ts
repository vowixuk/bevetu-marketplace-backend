import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsObject,
} from 'class-validator';
import {
  type OrderPaymentStatus,
  type OrderStatus,
} from '../entities/order.entity';

export class CreateOrderDto {
  @IsString()
  buyerId: string;

  @IsString()
  sellerId: string;

  @IsString()
  shopId: string;

  @IsString()
  cartId: string;

  @IsString()
  addressId: string;

  @IsOptional()
  @IsString()
  carrierId?: string;

  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => CreateOrderItemDto)
  // items: CreateOrderItemDto[];

  @IsNumber()
  totalAmount: number;

  @IsNumber()
  shippingFee: number;

  @IsNumber()
  discount: number;

  @IsString()
  currency: string;

  @IsEnum(['PENDING', 'SUCCESS', 'FAILED'])
  paymentStatus: OrderPaymentStatus;

  @IsString()
  paymentMethod: string;

  @IsEnum(['CREATED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  orderStatus: OrderStatus;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;

  @IsOptional()
  @IsString()
  remark?: string;
}
