import { OptionalProperties } from '../../share/types';
import { EventRecordType, OrderEventRecord } from './event-record.entity';
import { OrderItem } from './order-item.entity';

export class Order {
  id: string;

  buyerId: string;
  sellerId: string;
  shopId: string;
  cartId: string;
  addressId: string;
  carrierId?: string;

  items: OrderItem[];

  totalAmount: number;
  shippingFee: number;
  discount: number;
  currency: string;

  paymentStatus: OrderPaymentStatus;
  paymentMethod: string;
  orderStatus: OrderStatus;

  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  eventRecords: OrderEventRecord<EventRecordType>[];
  attributes?: Record<string, any>;

  remark?: string;

  constructor(
    init: Omit<Order, OptionalProperties<Order>> &
      Partial<Pick<Order, OptionalProperties<Order>>>,
  ) {
    Object.assign(this, init);
  }
}

export type OrderPaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export type OrderStatus =
  | 'CREATED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';
