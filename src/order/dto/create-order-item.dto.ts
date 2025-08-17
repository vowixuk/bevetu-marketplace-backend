import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  varientId: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}
