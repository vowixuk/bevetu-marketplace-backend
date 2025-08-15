import { OptionalProperties } from './subscription.entity';

type MetadataSchema = {
  CREATE: {
    productCode: string;
    productName: string;
    productMode: string;
  };
  PAYMENT: {
    amount: number;
    currency: string;
    productMode: string; // "Monthly" or "Yearly"
    seatNo: number;
    nextPaymentDate: Date;
  };
  PENDING_CANCEL: { cancelReason: string; cancel_at: Date };
  PAYMENT_FAILED: { error: string };
  PAYMENT_SUCCESS: { paidAt: Date; paidAmount: number };
  EXPIRY: {
    productCode: string;
    productName: string;
  };

  CANCELLED: { cancelReason: string; cancel_at: Date };
  RESTORE: null;

  /** Unused so far */
  ERROR: { [key: string]: any };
  OTHER: { [key: string]: any };
  REFUND: null;
  REACTIVATE: null;
  MODE_CHANGE: null;
  REENROLL_FREE_TRIAL_AFTER_CANCEL: {
    effevtiveDate: Date;
  };
};

export type EventRecordType = keyof MetadataSchema;

export class EventRecord<T extends EventRecordType> {
  id: string;
  subscriptionId: string;
  createdAt: Date;
  type: T;
  metadata?: MetadataSchema[T] | null;

  constructor(
    init: Omit<EventRecord<T>, OptionalProperties<EventRecord<T>>> &
      Partial<Pick<EventRecord<T>, OptionalProperties<EventRecord<T>>>>,
  ) {
    Object.assign(this, init);
  }
}
