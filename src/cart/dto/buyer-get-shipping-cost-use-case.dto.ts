import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class BuyerGetShippingCostDto {
  @ApiProperty({
    description: 'ID of the cart.',
    example: 'cartItem_67890',
  })
  @IsString({ message: 'Cart ID must be a string.' })
  cartId: string;
}
