import { OptionalProperties } from './seller-subscription.entity';

type MetadataSchema = {
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
  REFUND: null;
  MODE_CHANGE: null;
};

export type EventRecordType = keyof MetadataSchema;

export class SubscriptionEventRecord<T extends EventRecordType> {
  id: string;
  subscriptionId: string;
  createdAt: Date;
  type: T;
  metadata?: MetadataSchema[T] | null;

  constructor(
    init: Omit<
      SubscriptionEventRecord<T>,
      OptionalProperties<SubscriptionEventRecord<T>>
    > &
      Partial<
        Pick<
          SubscriptionEventRecord<T>,
          OptionalProperties<SubscriptionEventRecord<T>>
        >
      >,
  ) {
    Object.assign(this, init);
  }
}
