import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateSellerShippingDto } from './create-seller-shipping.dto';

export class UpdateSellerShippingDto extends PartialType(
  OmitType(CreateSellerShippingDto, ['shopId'] as const),
) {}
