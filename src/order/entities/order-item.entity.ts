import { OptionalProperties } from '../../share/types';
export class OrderItem {
  id: string;

  orderId: string;
  shopId: string;
  productId: string;
  varientId?: string;
  productName: string;
  quantity: number;
  price: number;

  shippingFee: number;
  discount: number;

  refundedQuantity: number = 0;
  refundedAmount: number = 0;
  refundStatus: OrderRefundStatus;

  attributes?: Record<string, any>;
  remark?: string;

  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(
    init: Omit<OrderItem, OptionalProperties<OrderItem>> &
      Partial<Pick<OrderItem, OptionalProperties<OrderItem>>>,
  ) {
    Object.assign(this, init);
  }
}

type OrderRefundStatus = 'NONE' | 'PENDING' | 'COMPLETED' | 'REJECTED';
