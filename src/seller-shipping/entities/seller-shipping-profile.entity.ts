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
