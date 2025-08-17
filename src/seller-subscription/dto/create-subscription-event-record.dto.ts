import {
  EventRecordType,
  MetadataSchema,
} from '../entities/event-record.entity';

export class CreateSubscriptionEventRecordDto<T extends EventRecordType> {
  type: T;
  metadata?: MetadataSchema[T];
}
