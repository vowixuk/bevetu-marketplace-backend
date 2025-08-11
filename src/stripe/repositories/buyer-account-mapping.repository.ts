import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BuyerStripeAccountMapping } from '../entities/buyer-account-mapping.entity';
import { BuyerStripeAccountMapping as PrismaBuyerStripeAccountMapping } from '@prisma/client';

@Injectable()
export class BuyerStripeAccountMappingRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create(
    mapping: BuyerStripeAccountMapping,
  ): Promise<BuyerStripeAccountMapping> {
    return mapPrismaBuyerStripeAccountMappingToDomain(
      await this.prisma.buyerStripeAccountMapping.create({
        data: {
          userId: mapping.userId,
          stripeCustomerId: mapping.stripeCustomerId,
          identifyId: mapping.identifyId,
          createdAt: mapping.createdAt ?? new Date(),
        },
      }),
    ) as BuyerStripeAccountMapping;
  }

  async findOne(id: string): Promise<BuyerStripeAccountMapping> {
    return mapPrismaBuyerStripeAccountMappingToDomain(
      await this.prisma.buyerStripeAccountMapping.findUnique({
        where: { id },
      }),
    ) as BuyerStripeAccountMapping;
  }

  async findByUserId(userId: string): Promise<BuyerStripeAccountMapping[]> {
    const mappings = await this.prisma.buyerStripeAccountMapping.findMany({
      where: { userId },
    });
    return mappings.map(
      mapPrismaBuyerStripeAccountMappingToDomain,
    ) as BuyerStripeAccountMapping[];
  }

  async update(
    mapping: BuyerStripeAccountMapping,
  ): Promise<BuyerStripeAccountMapping> {
    return mapPrismaBuyerStripeAccountMappingToDomain(
      await this.prisma.buyerStripeAccountMapping.update({
        where: { id: mapping.id },
        data: {
          stripeCustomerId: mapping.stripeCustomerId,
          identifyId: mapping.identifyId,
        },
      }),
    ) as BuyerStripeAccountMapping;
  }

  async remove(id: string): Promise<BuyerStripeAccountMapping> {
    return mapPrismaBuyerStripeAccountMappingToDomain(
      await this.prisma.buyerStripeAccountMapping.delete({
        where: { id },
      }),
    ) as BuyerStripeAccountMapping;
  }
}

export function mapPrismaBuyerStripeAccountMappingToDomain(
  prismaMapping?: PrismaBuyerStripeAccountMapping | null,
): BuyerStripeAccountMapping | null {
  if (!prismaMapping) return null;
  return new BuyerStripeAccountMapping({
    id: prismaMapping.id,
    userId: prismaMapping.userId,
    stripeCustomerId: prismaMapping.stripeCustomerId,
    identifyId: prismaMapping.identifyId,
    createdAt: prismaMapping.createdAt,
  });
}
