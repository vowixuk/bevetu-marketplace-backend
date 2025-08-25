import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class ViewProductsDto {
  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    example: 1,
    type: Number,
  })
  @IsOptional()
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
  @IsInt()
  @Min(1)
  @Max(100) // Maximum limit for pagination, you can adjust as needed
  limit?: number;
}
