import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class ViewProductsDto {
  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    example: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number) // 👈 transform "1" -> 1
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
  @Type(() => Number) // 👈 transform "10" -> 10
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}