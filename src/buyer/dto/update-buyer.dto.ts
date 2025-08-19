import { Address } from '../entities/address.vo';
import { PaymentMethod } from '../entities/payment.vo,';

export class UpdateBuyerDto {
  address?: Address;
  paymentMethod?: PaymentMethod;
}
