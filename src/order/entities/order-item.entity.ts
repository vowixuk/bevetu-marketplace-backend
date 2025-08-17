import { OptionalProperties } from '../../share/types';
export class OrderItem {
  id: string;
  orderId: string;

  productId: string; // optional, for reference
  varientId: string;
  productName: string; // snapshot of name at purchase
  quantity: number;
  price: number; // unit price at purchase

  // Refund info
  refundedQuantity: number; // how many items refunded
  refundedAmount: number; // how much money refunded
  refundStatus: 'NONE' | 'PENDING' | 'COMPLETED' | 'REJECTED';

  createdAt: Date;
  updatedAt?: Date;

  constructor(
    init: Omit<OrderItem, OptionalProperties<OrderItem>> &
      Partial<Pick<OrderItem, OptionalProperties<OrderItem>>>,
  ) {
    Object.assign(this, init);
  }
}
