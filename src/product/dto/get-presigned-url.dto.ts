import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetPresignedUrlDto {
  @ApiProperty({
    description: 'the if of the product ',
    example: 'product-123',
  })
  @IsNotEmpty()
  @IsString() // Ensures fileName is a string
  productId: string;

  @ApiProperty({
    description: 'The name of the file to be uploaded.',
    example: 'report.pdf',
  })
  @IsNotEmpty()
  @IsString() // Ensures fileName is a string
  fileName: string;

  @ApiProperty({
    description: 'The size of afile in byte. (only for upload document)',
    example: '1232332',
  })
  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  fileSize?: number;
}
