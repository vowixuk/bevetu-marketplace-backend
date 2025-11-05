import { OptionalProperties } from '../../share/types';

export class OrderAddress {
  id: string;

  orderId: string;
  buyerId: string;

  fullName: string;
  phoneNumber?: string;

  line1: string;
  line2?: string;

  city: string;
  state?: string;
  postalCode: string;
  country: string;

  constructor(
    init: Omit<OrderAddress, OptionalProperties<OrderAddress>> &
      Partial<Pick<OrderAddress, OptionalProperties<OrderAddress>>>,
  ) {
    Object.assign(this, init);
  }
}
