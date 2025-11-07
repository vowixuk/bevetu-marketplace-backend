import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class AddItemToCartDto {
  @IsString({ message: 'Cart ID must be a string.' })
  cartId: string;

  @ApiProperty({
    description: 'ID of the product being added to the cart.',
    example: 'product_67890',
  })
  @IsString({ message: 'Product ID must be a string.' })
  productId: string;

  @IsNumber({}, { message: 'Quantity must be a number.' })
  @Min(1, { message: 'Quantity must be at least 1.' })
  quantity: number;
}
