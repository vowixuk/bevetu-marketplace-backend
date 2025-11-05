import { OptionalProperties } from '../../share/types';

export class OrderCarrier {
  id: string;

  orderId: string;

  carrierName: string;
  serviceType?: string;
  trackingNumber?: string;
  trackingUrl?: string;

  shippedAt?: Date;
  estimatedDelivery?: Date;
  deliveredAt?: Date;

  createdAt: Date;
  updatedAt: Date;

  remark?: string;

  constructor(
    init: Omit<OrderCarrier, OptionalProperties<OrderCarrier>> &
      Partial<Pick<OrderCarrier, OptionalProperties<OrderCarrier>>>,
  ) {
    Object.assign(this, init);
  }
}
