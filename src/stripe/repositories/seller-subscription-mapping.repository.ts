import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  SellerSubscriptionMapping,
  StripeSubscriptionItems,
} from '../entities/seller-subscription-mapping.entity';
import { SellerSubscriptionMapping as PrismaSellerSubscriptionMapping } from '@prisma/client';

@Injectable()
export class SellerSubscriptionMappingRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create(
    mapping: SellerSubscriptionMapping,
  ): Promise<SellerSubscriptionMapping> {
    return mapPrismaSellerSubscriptionMappingToDomain(
      await this.prisma.sellerSubscriptionMapping.create({
        data: {
          sellerId: mapping.sellerId,
          bevetuSubscriptionId: mapping.bevetuSubscriptionId,
          identifyId: mapping.identifyId,
          stripeCustomerId: mapping.stripeCustomerId,
          stripeSubscriptionId: mapping.stripeSubscriptionId,
          stripeSubscriptionItem: mapping.stripeSubscriptionItems ?? [],
          createdAt: mapping.createdAt ?? new Date(),
        },
      }),
    ) as SellerSubscriptionMapping;
  }

  async findOne(id: string): Promise<SellerSubscriptionMapping | null> {
    return mapPrismaSellerSubscriptionMappingToDomain(
      await this.prisma.sellerSubscriptionMapping.findUnique({
        where: { id },
      }),
    );
  }

  async findBySellerId(sellerId: string): Promise<SellerSubscriptionMapping[]> {
    const mappings = await this.prisma.sellerSubscriptionMapping.findMany({
      where: { sellerId },
    });
    return mappings.map(
      mapPrismaSellerSubscriptionMappingToDomain,
    ) as SellerSubscriptionMapping[];
  }

  async findByBevetuSubscriptionId(
    bevetuSubscriptionId: string,
  ): Promise<SellerSubscriptionMapping[]> {
    const mappings = await this.prisma.sellerSubscriptionMapping.findMany({
      where: { bevetuSubscriptionId },
    });

    return mappings.map(
      mapPrismaSellerSubscriptionMappingToDomain,
    ) as SellerSubscriptionMapping[];
  }
  async update(
    mapping: SellerSubscriptionMapping,
  ): Promise<SellerSubscriptionMapping> {
    return mapPrismaSellerSubscriptionMappingToDomain(
      await this.prisma.sellerSubscriptionMapping.update({
        where: { id: mapping.id },
        data: {
          identifyId: mapping.identifyId,
          stripeCustomerId: mapping.stripeCustomerId,
          stripeSubscriptionId: mapping.stripeSubscriptionId,
          stripeSubscriptionItem: mapping.stripeSubscriptionItems,
        },
      }),
    ) as SellerSubscriptionMapping;
  }

  async remove(id: string): Promise<SellerSubscriptionMapping> {
    return mapPrismaSellerSubscriptionMappingToDomain(
      await this.prisma.sellerSubscriptionMapping.delete({
        where: { id },
      }),
    ) as SellerSubscriptionMapping;
  }
}

export function mapPrismaSellerSubscriptionMappingToDomain(
  prismaMapping?: PrismaSellerSubscriptionMapping | null,
): SellerSubscriptionMapping | null {
  if (!prismaMapping) return null;

  return new SellerSubscriptionMapping({
    id: prismaMapping.id,
    sellerId: prismaMapping.sellerId,
    bevetuSubscriptionId: prismaMapping.bevetuSubscriptionId,
    identifyId: prismaMapping.identifyId,
    stripeCustomerId: prismaMapping.stripeCustomerId,
    stripeSubscriptionId: prismaMapping.stripeSubscriptionId,
    stripeSubscriptionItems:
      (prismaMapping.stripeSubscriptionItem as StripeSubscriptionItems[]) ?? [],
    createdAt: prismaMapping.createdAt,
  });
}
