import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class ProductIdParamDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'ID must only contain letters, numbers, underscores, or dashes',
  })
  productId: string;
}
