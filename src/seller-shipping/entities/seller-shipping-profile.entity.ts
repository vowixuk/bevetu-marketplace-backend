export class SellerShippingProfile {
  id: string;
  shopId: string;
  sellerId: string;
  sellerShippingId: string;

  name: string;

  feeType: 'flat' | 'per_item' | 'by_weight' | 'free';

  feeAmount: number;
  currency: string;

  originCountry: string;
  originZip: string;

  buyerPickUp?: boolean;
  buyerPickUpLocation?: string;

  supportedRegions?: string[];

  estimatedDeliveryMinDays?: number;
  estimatedDeliveryMaxDays?: number;

  createdAt?: Date;
  updatedAt?: Date;

  constructor(init: SellerShippingProfile) {
    Object.assign(this, init);
  }
}

/**
 *  --------- Fee type explaination ---------
 *
 * Type of shipping fee calculation.
 *
 * 'flat'      - Fixed shipping fee regardless of quantity or weight.
 *               Example: Fee = £5; 1 item → £5, 10 items → £5.
 *
 * 'per_item'  - Shipping fee multiplied by the quantity of the product.
 *               Example: Fee = £3 per item; 1 item → £3, 4 items → £12.
 *
 * 'by_weight' - Shipping fee depends on the weight of the product or total weight.
 *               Example: Rate = £2 per 500g; Product weight = 1kg → £4.
 *
 * 'free'      - No shipping fee is charged for this product.
 *               Example: Product is free to ship → £0 shipping.
 */
