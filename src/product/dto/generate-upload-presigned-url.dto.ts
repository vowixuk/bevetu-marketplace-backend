import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Validation for file extension
const ALLOWED_FILE_EXTENSIONS = /\.(jpg|jpeg|png)$/i;

export class GenerateUploadPresignedUrlDto {
  @ApiProperty({
    description: 'The file name with extension for the upload.',
    example: 'product-photo.jpg',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(ALLOWED_FILE_EXTENSIONS, {
    message:
      'Invalid file extension. Only  .jpg, .jpeg, and .png, files are allowed.',
  })
  fileName: string;

  @ApiProperty({
    description: 'Shop ID',
    example: 'shop-ad99afd9saf9-asdfasdf',
  })
  @IsString()
  @IsNotEmpty()
  shopId: string;
}
