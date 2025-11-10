import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RemoveItemFromCartDto {
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
}
