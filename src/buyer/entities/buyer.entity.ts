import { Address } from './address.vo';
import { PaymentMethod } from './payment.vo,';

export class Buyer {
  id: string;
  userId: string;
  address?: Address;
  paymentMethod?: PaymentMethod;
  constructor(init: Buyer) {
    Object.assign(this, init);
  }
}
