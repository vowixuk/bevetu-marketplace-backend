import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateShopDto } from './create-shop.dto';
import { IsOptional, IsDate } from 'class-validator';

export class UpdateShopDto extends OmitType(PartialType(CreateShopDto), [
  'sellerId',
] as const) {
  @IsOptional()
  @IsDate()
  deletedAt?: Date;
}
