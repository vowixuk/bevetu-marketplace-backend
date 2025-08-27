import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({
    description: 'Indicates whether the product is approved by admin',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;
}
