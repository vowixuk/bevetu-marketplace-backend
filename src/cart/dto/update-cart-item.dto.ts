import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  IsString,
} from 'class-validator';

export class UpdateCartItemDto {
  @ApiPropertyOptional({
    description: 'Name of the product being added to the cart.',
    example: 'Dog Food',
  })
  @IsString({ message: 'Product ID must be a string.' })
  productName?: string;

  @ApiPropertyOptional({
    description: 'Updated quantity of the product in the cart.',
    example: 3,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Quantity must be a number.' })
  @Min(1, { message: 'Quantity must be at least 1.' })
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Updated price per unit of the product.',
    example: 17.99,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number.' })
  price?: number;

  @ApiPropertyOptional({
    description: 'Updated availability status of the product.',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Available must be a boolean value.' })
  available?: boolean;

  @ApiPropertyOptional({
    description: 'Reason that is not able to purchase',
    example: 'Out of stock',
  })
  @IsString()
  @IsOptional()
  unavailableReason?: string;
}
