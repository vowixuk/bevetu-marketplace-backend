import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateSellerShippingProfileDto } from './create-seller-shipping-profile.dto';

export class UpdateSellerShippingProfileDto extends PartialType(
  OmitType(CreateSellerShippingProfileDto, [
    'shopId',
    'sellerShippingId',
  ] as const),
) {
  // @IsEnum(['flat', 'per_item', 'by_weight', 'free'])
  // feeType: 'flat' | 'per_item' | 'by_weight' | 'free';
}
