import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ViewProductsDto {
  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    example: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Number of records per page',
    required: false,
    example: 10,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(100)
  limit?: number;

  @ApiProperty({
    description: 'Filter by shop ID',
    required: false,
    example: 'abc123',
  })
  @IsOptional()
  @IsString()
  shopId?: string;

  @ApiProperty({
    description: 'product id',
    required: false,
    example: 'abc123',
  })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({
    description: 'Filter by category',
    required: false,
    example: 'food-treats',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Search by name, description, or category',
    required: false,
    example: 'dog toy',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Sort by latest products',
    required: false,
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  latest?: boolean;
}
