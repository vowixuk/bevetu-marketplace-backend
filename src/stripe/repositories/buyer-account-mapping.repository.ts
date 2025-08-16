import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BuyerStripeCustomerAccountMapping } from '../entities/buyer-customer-account-mapping.entity';
import { BuyerStripeCustomerAccountMapping as PrismaBuyerStripeCustomerAccountMapping } from '@prisma/client';

@Injectable()
export class BuyerStripeCustomerAccountMappingRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create(
    mapping: BuyerStripeCustomerAccountMapping,
  ): Promise<BuyerStripeCustomerAccountMapping> {
    return mapPrismaBuyerStripeCustomerAccountMappingToDomain(
      await this.prisma.buyerStripeCustomerAccountMapping.create({
        data: {
          userId: mapping.userId,
          stripeCustomerId: mapping.stripeCustomerId,
          identifyId: mapping.identifyId,
          createdAt: mapping.createdAt ?? new Date(),
        },
      }),
    ) as BuyerStripeCustomerAccountMapping;
  }

  async findOne(id: string): Promise<BuyerStripeCustomerAccountMapping> {
    return mapPrismaBuyerStripeCustomerAccountMappingToDomain(
      await this.prisma.buyerStripeCustomerAccountMapping.findUnique({
        where: { id },
      }),
    ) as BuyerStripeCustomerAccountMapping;
  }

  async findByUserId(
    userId: string,
  ): Promise<BuyerStripeCustomerAccountMapping> {
    return mapPrismaBuyerStripeCustomerAccountMappingToDomain(
      await this.prisma.buyerStripeCustomerAccountMapping.findUnique({
        where: { userId },
      }),
    ) as BuyerStripeCustomerAccountMapping;
  }

  async update(
    mapping: BuyerStripeCustomerAccountMapping,
  ): Promise<BuyerStripeCustomerAccountMapping> {
    return mapPrismaBuyerStripeCustomerAccountMappingToDomain(
      await this.prisma.buyerStripeCustomerAccountMapping.update({
        where: { id: mapping.id },
        data: {
          stripeCustomerId: mapping.stripeCustomerId,
          identifyId: mapping.identifyId,
        },
      }),
    ) as BuyerStripeCustomerAccountMapping;
  }

  async remove(id: string): Promise<BuyerStripeCustomerAccountMapping> {
    return mapPrismaBuyerStripeCustomerAccountMappingToDomain(
      await this.prisma.buyerStripeCustomerAccountMapping.delete({
        where: { id },
      }),
    ) as BuyerStripeCustomerAccountMapping;
  }
}

export function mapPrismaBuyerStripeCustomerAccountMappingToDomain(
  prismaMapping?: PrismaBuyerStripeCustomerAccountMapping | null,
): BuyerStripeCustomerAccountMapping | null {
  if (!prismaMapping) return null;
  return new BuyerStripeCustomerAccountMapping({
    id: prismaMapping.id,
    userId: prismaMapping.userId,
    stripeCustomerId: prismaMapping.stripeCustomerId,
    identifyId: prismaMapping.identifyId,
    createdAt: prismaMapping.createdAt,
  });
}
