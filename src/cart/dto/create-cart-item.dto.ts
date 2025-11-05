import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateCartItemDto {
  @ApiProperty({
    description: 'ID of the shop the product belongs to.',
    example: 'shop_12345',
  })
  @IsString({ message: 'Shop ID must be a string.' })
  shopId: string;

  @ApiProperty({
    description: 'ID of the cart this item belongs to.',
    example: 'cart_abcde',
  })
  @IsString({ message: 'Cart ID must be a string.' })
  cartId: string;

  @ApiProperty({
    description: 'ID of the product being added to the cart.',
    example: 'product_67890',
  })
  @IsString({ message: 'Product ID must be a string.' })
  productId: string;

  @ApiProperty({
    description: 'Name of the product being added to the cart.',
    example: 'Dog Food',
  })
  @IsString({ message: 'Product ID must be a string.' })
  productName: string;

  @ApiProperty({
    description: 'ID of the selected product variant.',
    example: 'variant_001',
  })
  @IsString({ message: 'Variant ID must be a string.' })
  @IsOptional()
  varientId?: string;

  @ApiProperty({
    description: 'Quantity of the product being added.',
    example: 2,
  })
  @IsNumber({}, { message: 'Quantity must be a number.' })
  @Min(1, { message: 'Quantity must be at least 1.' })
  quantity: number;

  @ApiProperty({
    description: 'Unit price of the product.',
    example: 19.99,
  })
  @IsNumber({}, { message: 'Price must be a number.' })
  price: number;

  @ApiProperty({
    description:
      'Indicates if the product is currently available for purchase.',
    example: true,
  })
  @IsBoolean({ message: 'Available must be a boolean value.' })
  available: boolean;

  @ApiProperty({
    description: 'Reason that is not able to purchase',
    example: 'Out of stock',
  })
  @IsString()
  @IsOptional()
  unavailableReason?: string;
}
