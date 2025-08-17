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
    return mapPrismaOrderToDomain(
      await this.prisma.orderEventRecord.create({
        data: {
          orderId: record.orderId,
          type: record.type as PrismaOrderEventRecordType,
          metadata: record.metadata ?? {},
          createdAt: record.createdAt ?? new Date(),
        },
      }),
    ) as OrderEventRecord<T>;
  }

  async findAllByOrderId(
    orderId: string,
  ): Promise<OrderEventRecord<EventRecordType>[]> {
    return (
      await this.prisma.orderEventRecord.findMany({
        where: { orderId },
      })
    ).map(mapPrismaOrderToDomain) as OrderEventRecord<EventRecordType>[];
  }

  async findOne(id: string): Promise<OrderEventRecord<EventRecordType> | null> {
    return mapPrismaOrderToDomain(
      await this.prisma.orderEventRecord.findUnique({
        where: { id },
      }),
    );
  }

  async remove(id: string): Promise<OrderEventRecord<EventRecordType>> {
    return mapPrismaOrderToDomain(
      await this.prisma.orderEventRecord.delete({
        where: { id },
      }),
    ) as OrderEventRecord<EventRecordType>;
  }
}

/**
 * Map Prisma order event record to domain OrderEventRecord entity.
 * Keeps Prisma types locked in the repository layer.
 */
export function mapPrismaOrderToDomain(
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
