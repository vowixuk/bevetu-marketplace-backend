import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  OrderEventRecord,
  EventRecordType,
  MetadataSchema,
} from '../entities/event-record.entity';
import {
  OrderEventRecord as PrismaOrderEventRecord,
  OrderEventRecordType as PrismaOrderEventRecordType,
} from '@prisma/client';

@Injectable()
export class OrderEventRecordRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create<T extends EventRecordType>(
    record: OrderEventRecord<T>,
  ): Promise<OrderEventRecord<T>> {
    return mapPrismaOrderEventRecordToDomain(
      await this.prisma.orderEventRecord.create({
        data: {
          orderId: record.orderId,
          type: record.type as PrismaOrderEventRecordType,
          metadata:
            (JSON.parse(
              JSON.stringify(record.metadata),
            ) as unknown as 'InputJsonValue | null | undefined') ?? undefined,
          createdAt: record.createdAt ?? new Date(),
        },
      }),
    ) as OrderEventRecord<T>;
  }
}

/**
 * Map Prisma order event record to domain OrderEventRecord entity.
 * Keeps Prisma types locked in the repository layer.
 */
export function mapPrismaOrderEventRecordToDomain(
  prismaRecord?: PrismaOrderEventRecord | null,
): OrderEventRecord<EventRecordType> | null {
  if (!prismaRecord) return null;

  return new OrderEventRecord<EventRecordType>({
    id: prismaRecord.id,
    orderId: prismaRecord.orderId,
    type: prismaRecord.type as EventRecordType,
    metadata:
      (prismaRecord.metadata as MetadataSchema[EventRecordType] | null) ?? null,
    createdAt: prismaRecord.createdAt,
  });
}
