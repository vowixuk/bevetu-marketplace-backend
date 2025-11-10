import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderAddressDto } from './create-order-address.dto';

export class CreateOrderUseCaseDto {
  @IsString()
  cartId: string;

  @ValidateNested()
  @Type(() => CreateOrderAddressDto)
  createOrderAddressDto: CreateOrderAddressDto;

  @IsOptional()
  @IsString()
  promotionCode?: string;
}
