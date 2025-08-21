import { IProduct } from './vo/product.vo';

export type MetadataSchema = {
  CREATE: {
    productCode: string;
    productName: string;
    productMode: string;
  };

  PAYMENT: {
    amount: number;
    currency: string;
    productCode: string;
    quantity: number;
    nextPaymentDate: Date;
    nextPaymentAmount: Date;
  };
  PENDING_CANCEL: {
    productCode: string;
    cancelReason: string;
    cancel_at: Date;
  };
  PAYMENT_FAILED: {
    productCode: string;
    error: string;
  };
  PAYMENT_SUCCESS: {
    productCode: string;
    paidAt: Date;
    paidAmount: number;
    nextPaymentDate: Date;
    nextPaymentAmount: Date;
  };
  REFUND: {
    refundReason: string;
    amount: number;
  };

  UPDATE: {
    from: IProduct;
    to: IProduct;
    proration: boolean;
  };
  EXPIRY: {
    productCode: string;
    productName: string;
  };

  CANCELLED: {
    productCode: string;
    cancelReason: string;
  };
  RESTORE: {
    productCode: string;
  };
  REACTIVATE: {
    productCode: string;
  };

  /** Unused so far */
  ERROR: { [key: string]: any };
  OTHER: { [key: string]: any };

  MODE_CHANGE: null;
};

export type EventRecordType = keyof MetadataSchema;

export class SubscriptionEventRecord<T extends EventRecordType> {
  id: string;
  subscriptionId: string;
  createdAt: Date;
  type: T;
  metadata?: MetadataSchema[T] | null;

  constructor(init: {
    id: string;
    subscriptionId: string;
    createdAt: Date;
    type: T;
    metadata?: MetadataSchema[T] | null;
  }) {
    Object.assign(this, init);
  }
}
