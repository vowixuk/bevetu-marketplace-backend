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
import { Type } from 'class-transformer';
import type { PetType, ProductType } from '../entities/category.vo';

export class VariantDto {
  @IsString()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  additionalPrice: number;

  @IsNumber()
  stock: number;
}

export class DiscountDto {
  @IsNumber()
  price: number;

  @IsEnum(['percentage', 'fixed'])
  type: 'percentage' | 'fixed';

  @ValidateNested()
  @Type(() => DiscountDateDto)
  date: DiscountDateDto;
}

export class DiscountDateDto {
  @IsNotEmpty()
  start: Date;

  @IsNotEmpty()
  end: Date;
}

export class CategoriesDto {
  @IsIn(['dog', 'cat', 'fish', 'bird', 'reptile', 'small-pet'])
  pet: PetType;

  @IsIn(['food', 'toy', 'accessory', 'health', 'grooming', 'habitat'])
  product: ProductType;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  slug?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];

  @IsNumber()
  stock: number;

  @IsBoolean()
  isActive: boolean;

  @ValidateNested()
  @Type(() => CategoriesDto)
  categories: CategoriesDto;

  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants: VariantDto[];

  @ValidateNested()
  @Type(() => DiscountDto)
  discount: DiscountDto[];
}
