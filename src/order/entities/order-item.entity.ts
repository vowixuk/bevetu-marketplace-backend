import { OptionalProperties } from '../../share/types';

export type OrderRefundStatus =
  | 'NONE'
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED';

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
  refundedQuantity?: number;
  refundedAmount?: number;
  refundStatus?: OrderRefundStatus;
  createdAt: Date;
  updatedAt: Date;

  attributes?: Record<string, any>;
  remark?: string;

  constructor(
    init: Omit<OrderItem, OptionalProperties<OrderItem>> &
      Partial<Pick<OrderItem, OptionalProperties<OrderItem>>>,
  ) {
    Object.assign(this, init);
  }
}
