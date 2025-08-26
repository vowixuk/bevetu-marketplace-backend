import { SellerShippingProfile } from './seller-shipping-profile.entity';

export class SellerShipping {
  id: string;
  shopId: string;
  sellerId: string;
  shippingProfiles?: SellerShippingProfile[];
  freeShippingOption?: FreeShippingOption | null;
  createdAt: Date;
  updatedAt?: Date;

  constructor(init: SellerShipping) {
    Object.assign(this, init);
  }
}

export type FreeShippingOption = {
  freeShippingThresholdAmount: string;
  currency: string;
};
