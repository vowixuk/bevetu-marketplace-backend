import { CreateSellerShippingProfileDto } from '../../src/seller-shipping/dto/create-seller-shipping-profile.dto';
import {
  SellerShippingProfileService,
  SellerShippingService,
} from './testing-module';
import { SellerShippingProfile } from '../../src/seller-shipping/entities/seller-shipping-profile.entity';
import { UpdateSellerShippingDto } from '../../src/seller-shipping/dto/update-seller-shipping.dto';

export async function testCreateShippingProfile({
  sellerId,
  shopId,
  sellerShippingId,
  sellerShippingProfileService,
  feeAmountVersion = 1,
}: {
  sellerId: string;
  shopId: string;
  sellerShippingId: string;
  sellerShippingProfileService: SellerShippingProfileService;
  feeAmountVersion: number;
}) {
  const dto_base = Object.assign(new CreateSellerShippingProfileDto(), {
    shopId,
    sellerShippingId,
    name: 'Shipping Profile',
    feeType: 'Free',
    feeAmount: 0,
    currency: 'GBP',
    originCountry: 'US',
    originZip: '10001',
    buyerPickUp: true,
    buyerPickUpLocation: 'Store #1',
    supportedRegions: ['Uk', 'CA'],
    estimatedDeliveryMinDays: 3,
    estimatedDeliveryMaxDays: 7,
  });

  let feeAmount: Record<'free' | 'flat' | 'per_item' | 'by_weight', number>;

  switch (feeAmountVersion) {
    case 1:
      feeAmount = {
        free: 0,
        flat: 5,
        per_item: 12,
        by_weight: 3,
      };
      break;
    case 2:
      feeAmount = {
        free: 0,
        flat: 7,
        per_item: 2,
        by_weight: 9,
      };
      break;
    case 3:
      feeAmount = {
        free: 0,
        flat: 10,
        per_item: 5,
        by_weight: 6,
      };
      break;
    case 4:
      feeAmount = {
        free: 0,
        flat: 3,
        per_item: 8,
        by_weight: 4,
      };
      break;
    default:
      feeAmount = {
        free: 0,
        flat: 0,
        per_item: 0,
        by_weight: 0,
      };
      break;
  }
  return {
    free: await sellerShippingProfileService.create(sellerId, {
      ...dto_base,
      name: 'free Shipping Profile',
      feeType: 'free' as SellerShippingProfile['feeType'],
      feeAmount: feeAmount.free,
    }),
    flat: await sellerShippingProfileService.create(sellerId, {
      ...dto_base,
      name: 'flat Shipping Profile',
      feeType: 'flat' as SellerShippingProfile['feeType'],
      feeAmount: feeAmount.flat,
    }),
    per_item: await sellerShippingProfileService.create(sellerId, {
      ...dto_base,
      name: 'per_item Shipping Profile',
      feeType: 'per_item' as SellerShippingProfile['feeType'],
      feeAmount: feeAmount.per_item,
    }),
    by_weight: await sellerShippingProfileService.create(sellerId, {
      ...dto_base,
      name: 'by_weight Shipping Profile',
      feeType: 'by_weight' as SellerShippingProfile['feeType'],
      feeAmount: feeAmount.by_weight,
    }),
  };
}

export async function testSetFreeShippingAmount(
  sellerShippingService: SellerShippingService,
  shippingId: string,
  sellerId: string,
  shopId: string,
  freeShippingThresholdAmount: number,
) {
  await sellerShippingService.update(
    shippingId,
    sellerId,
    Object.assign(new UpdateSellerShippingDto(), {
      shopId,
      freeShippingOption: {
        freeShippingThresholdAmount,
        currency: 'GBP',
      },
    }),
  );
}
