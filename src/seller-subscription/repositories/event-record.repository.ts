import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  SubscriptionEventRecord,
  EventRecordType,
  MetadataSchema,
} from '../entities/event-record.entity';
import {
  SellerSubscriptionEventRecord as PrismaSellerSubscriptionEventRecord,
  SellerEventRecordType as PrismaSellerEventRecordType,
} from '@prisma/client';

@Injectable()
export class SubscriptionEventRecordRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create<T extends EventRecordType>(
    record: SubscriptionEventRecord<T>,
  ): Promise<SubscriptionEventRecord<T>> {
    return mapPrismaEventRecordToDomain(
      await this.prisma.sellerSubscriptionEventRecord.create({
        data: {
          subscriptionId: record.subscriptionId,
          type: record.type as PrismaSellerEventRecordType,
          metadata: record.metadata ?? undefined,
          createdAt: record.createdAt ?? new Date(),
        },
      }),
    ) as SubscriptionEventRecord<T>;
  }

  async findAllBySubscriptionId(
    subscriptionId: string,
  ): Promise<SubscriptionEventRecord<EventRecordType>[]> {
    return (
      await this.prisma.sellerSubscriptionEventRecord.findMany({
        where: { subscriptionId },
      })
    ).map(
      mapPrismaEventRecordToDomain,
    ) as SubscriptionEventRecord<EventRecordType>[];
  }

  async findOne(
    id: string,
  ): Promise<SubscriptionEventRecord<EventRecordType> | null> {
    return mapPrismaEventRecordToDomain(
      await this.prisma.sellerSubscriptionEventRecord.findUnique({
        where: { id },
      }),
    );
  }

  async remove(id: string): Promise<SubscriptionEventRecord<EventRecordType>> {
    return mapPrismaEventRecordToDomain(
      await this.prisma.sellerSubscriptionEventRecord.delete({
        where: { id },
      }),
    ) as SubscriptionEventRecord<EventRecordType>;
  }
}

/**
 * Map Prisma event record to domain SubscriptionEventRecord entity.
 * Keeps Prisma types locked in the repository layer.
 */
export function mapPrismaEventRecordToDomain(
  prismaRecord?: PrismaSellerSubscriptionEventRecord | null,
): SubscriptionEventRecord<EventRecordType> | null {
  if (!prismaRecord) return null;

  return new SubscriptionEventRecord<EventRecordType>({
    id: prismaRecord.id,
    subscriptionId: prismaRecord.subscriptionId,
    type: prismaRecord.type as EventRecordType,
    metadata:
      (prismaRecord.metadata as MetadataSchema[EventRecordType] | null) ?? null,
    createdAt: prismaRecord.createdAt,
  });
}
