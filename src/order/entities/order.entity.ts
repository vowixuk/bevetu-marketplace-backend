import { OptionalProperties } from 'src/share/types';
import { EventRecordType, OrderEventRecord } from './event-record.entity';
import { OrderItem } from './order-item.entity';

export class Order {
  id: string;
  buyerId: string; // Who placed the order
  shopId: string;
  totalAmount: number; // Total price for all items
  currency: string;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
  paymentMethod: string; // e.g., stripe, paypal
  orderStatus: 'CREATED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
  eventRecords: OrderEventRecord<EventRecordType>[]; // Order events
  items: OrderItem[]; // Products in this order

  constructor(
    init: Omit<Order, OptionalProperties<Order>> &
      Partial<Pick<Order, OptionalProperties<Order>>>,
  ) {
    Object.assign(this, init);
  }
}
