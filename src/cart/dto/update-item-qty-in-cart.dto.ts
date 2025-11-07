import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class UpdateItemQtyInCartDto {
  @ApiProperty({
    description: 'ID of the cart.',
    example: 'cartItem_67890',
  })
  @IsString({ message: 'Cart ID must be a string.' })
  cartId: string;

  @ApiProperty({
    description: 'ID of the item in cart being added to the cart.',
    example: 'cartItem_67890',
  })
  @IsString({ message: 'CartItem ID must be a string.' })
  cartItemId: string;

  @ApiProperty({
    description: 'ID of the product being added to the cart.',
    example: 'product_67890',
  })
  @IsString({ message: 'Product ID must be a string.' })
  productId: string;

  @IsNumber({}, { message: 'new quantity must be a number.' })
  @Min(1, { message: 'new quantity must be at least 1.' })
  quantity: number;
}
