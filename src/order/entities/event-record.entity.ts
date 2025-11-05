export type MetadataSchema = {
  CREATE: {
    totalAmount: number;
    currency: string;
    paymentMethod: string;
    itemCount: number;
  };
  PROCESSING: {
    processingBy?: string;
    notes?: string;
  };
  SHIPPED: {
    shippedAt: string;
    trackingNumber?: string;
    carrier?: string;
  };
  DELIVERED: {
    deliveredAt: string;
    receivedBy: string;
  };
  REFUND_REQUEST: {
    orderItemId: string;
    refundedQuantity: number;
    refundedAmount: string;
    reason?: string;
  };
  REFUND_COMPLETED: {
    orderItemId: string;
    refundedQuantity: number;
    refundedAmount: string;
    reason?: string;
  };
  REFUND_REJECTED: {
    orderItemId: string;
    refundedQuantity: number;
    refundedAmount: string;
    reason?: string;
  };
};

export type EventRecordType = keyof MetadataSchema;

export class OrderEventRecord<T extends EventRecordType> {
  id: string;
  orderId: string;
  createdAt: Date;
  type: T;
  metadata?: MetadataSchema[T] | null;

  constructor(init: {
    id: string;
    orderId: string;
    createdAt: Date;
    type: T;
    metadata?: MetadataSchema[T] | null;
  }) {
    Object.assign(this, init);
  }
}
