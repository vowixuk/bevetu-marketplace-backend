import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { SellerStripeAccountMapping } from '../entities/seller-account-mapping.entity';
import { SellerStripeAccountMapping as PrismaSellerStripeAccountMapping } from '@prisma/client';

@Injectable()
export class SellerStripeAccountMappingRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create(
    mapping: SellerStripeAccountMapping,
  ): Promise<SellerStripeAccountMapping> {
    return mapPrismaSellerStripeAccountMappingToDomain(
      await this.prisma.sellerStripeAccountMapping.create({
        data: {
          sellerId: mapping.sellerId,
          userId: mapping.userId,
          stripeAccountId: mapping.stripeAccountId,
          identifyId: mapping.identifyId,
          createdAt: mapping.createdAt ?? new Date(),
        },
      }),
    ) as SellerStripeAccountMapping;
  }

  async findOne(id: string): Promise<SellerStripeAccountMapping | null> {
    return mapPrismaSellerStripeAccountMappingToDomain(
      await this.prisma.sellerStripeAccountMapping.findUnique({
        where: { id },
      }),
    );
  }

  async findOneByUserId(
    userId: string,
  ): Promise<SellerStripeAccountMapping | null> {
    return mapPrismaSellerStripeAccountMappingToDomain(
      await this.prisma.sellerStripeAccountMapping.findUnique({
        where: { userId },
      }),
    );
  }

  async findBySellerId(
    sellerId: string,
  ): Promise<SellerStripeAccountMapping[]> {
    const mappings = await this.prisma.sellerStripeAccountMapping.findMany({
      where: { sellerId },
    });
    return mappings.map(
      mapPrismaSellerStripeAccountMappingToDomain,
    ) as SellerStripeAccountMapping[];
  }

  async findByUserId(userId: string): Promise<SellerStripeAccountMapping[]> {
    const mappings = await this.prisma.sellerStripeAccountMapping.findMany({
      where: { userId },
    });
    return mappings.map(
      mapPrismaSellerStripeAccountMappingToDomain,
    ) as SellerStripeAccountMapping[];
  }

  async update(
    mapping: SellerStripeAccountMapping,
  ): Promise<SellerStripeAccountMapping> {
    return mapPrismaSellerStripeAccountMappingToDomain(
      await this.prisma.sellerStripeAccountMapping.update({
        where: { id: mapping.id },
        data: {
          stripeAccountId: mapping.stripeAccountId,
          identifyId: mapping.identifyId,
        },
      }),
    ) as SellerStripeAccountMapping;
  }

  async remove(id: string): Promise<SellerStripeAccountMapping> {
    return mapPrismaSellerStripeAccountMappingToDomain(
      await this.prisma.sellerStripeAccountMapping.delete({
        where: { id },
      }),
    ) as SellerStripeAccountMapping;
  }
}

export function mapPrismaSellerStripeAccountMappingToDomain(
  prismaMapping?: PrismaSellerStripeAccountMapping | null,
): SellerStripeAccountMapping | null {
  if (!prismaMapping) return null;
  return new SellerStripeAccountMapping({
    id: prismaMapping.id,
    userId: prismaMapping.userId,
    sellerId: prismaMapping.sellerId,
    stripeAccountId: prismaMapping.stripeAccountId,
    identifyId: prismaMapping.identifyId,
    createdAt: prismaMapping.createdAt,
  });
}
