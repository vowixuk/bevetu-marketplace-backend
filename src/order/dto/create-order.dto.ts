import { IsString, IsNumber, IsEnum } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  shopId: string;

  @IsNumber()
  totalAmount: number;

  @IsString()
  currency: string;

  @IsEnum(['PENDING', 'SUCCESS', 'FAILED'])
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';

  @IsString()
  paymentMethod: string;

  @IsEnum(['CREATED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  orderStatus: 'CREATED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

  attributes?: Record<string, any>;
}
