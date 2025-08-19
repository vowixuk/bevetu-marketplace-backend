import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsObject,
} from 'class-validator';

export class CreateShopDto {
  @ApiProperty({
    description: 'The name of the shop.',
    example: 'My Awesome Shop',
  })
  @IsString()
  @IsNotEmpty({ message: 'Shop name is required' })
  name: string;

  @ApiProperty({
    description: 'A short description of the shop.',
    example: 'We sell eco-friendly products.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Shop description is required' })
  description: string;

  @ApiProperty({
    description: 'The country where the shop is located.',
    example: 'US',
  })
  @IsString()
  @IsNotEmpty({ message: 'Country is required' })
  country: string;

  @ApiProperty({
    description: 'The unique URL slug for the shop.',
    example: 'my-awesome-shop',
  })
  @IsString()
  @IsOptional()
  shopUrl?: string;

  @ApiPropertyOptional({
    description: 'Optional website URL of the shop.',
    example: 'https://www.myawesomeshop.com',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website?: string;

  @ApiPropertyOptional({
    description:
      'Optional additional attributes for the shop in key-value format.',
    example: { theme: 'dark', currency: 'USD' },
  })
  @IsOptional()
  @IsObject({ message: 'Attributes must be an object' })
  attributes?: Record<string, any>;
}
