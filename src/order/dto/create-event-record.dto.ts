import {
  EventRecordType,
  MetadataSchema,
} from '../entities/event-record.entity';

export class CreateOrderEventRecordDto<T extends EventRecordType> {
  type: T;
  metadata?: MetadataSchema[T];
}
