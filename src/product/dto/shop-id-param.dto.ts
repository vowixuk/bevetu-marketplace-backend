import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class ShopIdParamDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'ID must only contain letters, numbers, underscores, or dashes',
  })
  shopId: string;
}
