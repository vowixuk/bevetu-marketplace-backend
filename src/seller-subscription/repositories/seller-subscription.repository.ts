import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { SellerSubscription } from '../entities/seller-subscription.entity';
import type { subscriptionItems } from '../entities/seller-subscription.entity';
import {
  SellerSubscription as PrismaSellerSubscription,
  SellerSubscriptionEventRecord as PrismaSellerSubscriptionEventRecord,
} from '@prisma/client';
import {
  EventRecordType,
  SubscriptionEventRecord,
} from '../entities/event-record.entity';

@Injectable()
export class SellerSubscriptionRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create(subscription: SellerSubscription): Promise<SellerSubscription> {
    return mapPrismaSubscriptionToDomain(
      await this.prisma.sellerSubscription.create({
        data: {
          sellerId: subscription.sellerId,
          nextPaymentDate: subscription.nextPaymentDate,
          status: subscription.status,
          createdAt: subscription.createdAt ?? new Date(),
          items: subscription.items,
        },
        include: { eventRecords: true },
      }),
    ) as SellerSubscription;
  }

  async findAllBySellerId(sellerId: string): Promise<SellerSubscription[]> {
    return (
      await this.prisma.sellerSubscription.findMany({
        where: { sellerId },
        include: { eventRecords: true },
      })
    ).map(mapPrismaSubscriptionToDomain) as SellerSubscription[];
  }

  async findOne(id: string): Promise<SellerSubscription | null> {
    return mapPrismaSubscriptionToDomain(
      await this.prisma.sellerSubscription.findUnique({
        where: { id },
        include: { eventRecords: true },
      }),
    );
  }

  async update(subscription: SellerSubscription): Promise<SellerSubscription> {
    return mapPrismaSubscriptionToDomain(
      await this.prisma.sellerSubscription.update({
        where: { id: subscription.id },
        data: {
          nextPaymentDate: subscription.nextPaymentDate,
          status: subscription.status,
          items: subscription.items,
          cancelAt: subscription.cancelAt ?? null,
          updatedAt: new Date(),
        },
        include: { eventRecords: true },
      }),
    ) as SellerSubscription;
  }

  async remove(id: string): Promise<SellerSubscription> {
    return mapPrismaSubscriptionToDomain(
      await this.prisma.sellerSubscription.delete({
        where: { id },
        include: { eventRecords: true },
      }),
    ) as SellerSubscription;
  }
}

/**
 * Map Prisma subscription model to domain SellerSubscription entity.
 * Keeps Prisma types locked in the repository layer.
 */
export function mapPrismaSubscriptionToDomain(
  prismaSubscription?:
    | (PrismaSellerSubscription & {
        eventRecords: PrismaSellerSubscriptionEventRecord[];
      })
    | null,
): SellerSubscription | null {
  if (!prismaSubscription) return null;

  return new SellerSubscription({
    id: prismaSubscription.id,
    sellerId: prismaSubscription.sellerId,
    nextPaymentDate: prismaSubscription.nextPaymentDate,
    status: prismaSubscription.status,
    items: prismaSubscription.items as subscriptionItems[],
    eventRecords: (prismaSubscription.eventRecords ??
      []) as unknown as SubscriptionEventRecord<EventRecordType>[],
    createdAt: prismaSubscription.createdAt,
    updatedAt: prismaSubscription.updatedAt ?? undefined,
    cancelAt: prismaSubscription.cancelAt ?? undefined,
  });
}
