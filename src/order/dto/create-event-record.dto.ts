import { IsEnum, IsOptional, IsObject, IsString } from 'class-validator';

import {
  EventRecordType,
  MetadataSchema,
} from '../entities/event-record.entity';

export class CreateOrderEventRecordDto<
  T extends EventRecordType = EventRecordType,
> {
  @IsString()
  orderId: string;

  @IsEnum([
    'CREATE',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'REFUND_REQUEST',
    'REFUND_COMPLETED',
    'REFUND_REJECTED',
  ])
  type: T;

  @IsOptional()
  @IsObject()
  metadata?: MetadataSchema[T];
}
