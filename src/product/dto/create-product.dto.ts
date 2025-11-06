import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsEnum,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import type { PetType, ProductType } from '../entities/category.vo';
export class VariantDto {
  @ApiProperty({
    description: 'Unique identifier of the variant',
    example: 'var_123',
  })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Variant name', example: 'Red Large' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Additional price for this variant',
    example: 5.0,
  })
  @IsNumber()
  additionalPrice: number;

  @ApiProperty({ description: 'Stock quantity for this variant', example: 10 })
  @IsNumber()
  stock: number;
}

export class DiscountDateDto {
  @ApiProperty({
    description: 'Discount start date',
    example: '2025-09-01T00:00:00Z',
  })
  @IsNotEmpty()
  start: Date;

  @ApiProperty({
    description: 'Discount end date',
    example: '2025-09-30T23:59:59Z',
  })
  @IsNotEmpty()
  end: Date;
}

export class DiscountDto {
  @ApiProperty({ description: 'Discount price or percentage', example: 10 })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Discount type',
    example: 'percentage',
    enum: ['percentage', 'fixed'],
  })
  @IsEnum(['percentage', 'fixed'])
  type: 'percentage' | 'fixed';

  @ApiProperty({ type: DiscountDateDto })
  @ValidateNested()
  @Type(() => DiscountDateDto)
  date: DiscountDateDto;
}

export class CategoriesDto {
  @ApiProperty({
    description: 'Pet category',
    example: 'dog',
    enum: ['dog', 'cat', 'fish', 'bird', 'reptile', 'small-pet'],
  })
  @IsIn(['dog', 'cat', 'fish', 'bird', 'reptile', 'small-pet'])
  pet: PetType;

  @ApiProperty({
    description: 'Product type',
    example: 'travel-carriers',
    enum: [
      'food-treats',
      'toys-chews',
      'grooming-care',
      'health-supplements',
      'beds-furniture',
      'collars-leashes-accessories',
      'training-behavior',
      'apparel',
      'travel-carriers',
    ],
  })
  @IsIn([
    'food-treats',
    'toys-chews',
    'grooming-care',
    'health-supplements',
    'beds-furniture',
    'collars-leashes-accessories',
    'training-behavior',
    'apparel',
    'travel-carriers',
  ])
  product: ProductType;
}

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Squeaky Dog Toy' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'A fun squeaky toy for dogs.',
  })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Product price', example: 100 })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Tags for the product',
    example: ['pet', 'toy'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Product slug for URLs',
    example: 'squeaky-dog-toy',
    required: false,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: 'Array of image URLs',
    example: ['https://example.com/toy.jpg'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];

  @ApiProperty({ description: 'Stock quantity', example: 50 })
  @IsNumber()
  stock: number;

  @ApiProperty({
    description: 'Whether the product is on shelf',
    example: true,
  })
  @IsBoolean()
  onShelf: boolean;

  @ApiProperty({ type: CategoriesDto })
  @ValidateNested()
  @Type(() => CategoriesDto)
  categories: CategoriesDto;

  @ApiProperty({ type: [VariantDto], required: false })
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  @IsOptional()
  variants?: VariantDto[];

  @ApiProperty({ type: [DiscountDto], required: false })
  @ValidateNested({ each: true })
  @Type(() => DiscountDto)
  @IsOptional()
  discount?: DiscountDto[];

  @ApiProperty({
    description: 'Optional shipping profile ID',
    example: 'ship_pro_123',
    required: false,
  })
  @IsString()
  @IsOptional()
  shippingProfileId?: string;

  @ApiPropertyOptional({ description: 'Product dimensions' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionsDto) // Important for class-transformer
  dimensions?: DimensionsDto;
}

export class DimensionsDto {
  @ApiPropertyOptional({ description: 'Weight in grams', example: 500 })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ description: 'Height in millimeters', example: 200 })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ description: 'Width in millimeters', example: 100 })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiPropertyOptional({ description: 'Depth in millimeters', example: 50 })
  @IsOptional()
  @IsNumber()
  depth?: number;
}
