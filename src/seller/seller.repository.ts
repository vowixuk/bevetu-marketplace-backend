import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Seller, SellerStatusType } from './entities/seller.entity';
import {
  Seller as PrismaSeller,
  SellerStatus as PrismaSellerStatus,
} from '@prisma/client';

@Injectable()
export class SellerRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create(seller: Seller): Promise<Seller> {
    return mapPrismaSellerToDomain(
      await this.prisma.seller.create({
        data: {
          userId: seller.userId,
          email: seller.email,
          status: seller.status as PrismaSellerStatus,
          attributes: seller.attributes,
          createdAt: seller.createdAt ?? new Date(),
        },
      }),
    ) as Seller;
  }

  async findAll(): Promise<Seller[]> {
    return (await this.prisma.seller.findMany()).map(
      mapPrismaSellerToDomain,
    ) as Seller[];
  }

  async findOne(id: string): Promise<Seller | null> {
    return mapPrismaSellerToDomain(
      await this.prisma.seller.findUnique({ where: { id } }),
    );
  }

  async findByUserId(userId: string): Promise<Seller> {
    return mapPrismaSellerToDomain(
      await this.prisma.seller.findFirst({ where: { userId } }),
    ) as Seller;
  }

  async update(seller: Seller): Promise<Seller> {
    return mapPrismaSellerToDomain(
      await this.prisma.seller.update({
        where: { id: seller.id },
        data: {
          email: seller.email,
          status: seller.status as PrismaSellerStatus,
          attributes: seller.attributes,
          updatedAt: new Date(),
          deletedAt: seller.deletedAt ?? null,
        },
      }),
    ) as Seller;
  }

  async remove(id: string): Promise<Seller> {
    return mapPrismaSellerToDomain(
      await this.prisma.seller.delete({ where: { id } }),
    ) as Seller;
  }
}

/**
 * Map Prisma Seller model to domain Seller entity.
 */
export function mapPrismaSellerToDomain(
  prismaSeller?: PrismaSeller | null,
): Seller | null {
  if (!prismaSeller) return null;

  return new Seller({
    id: prismaSeller.id,
    userId: prismaSeller.userId,
    email: prismaSeller.email,
    status: prismaSeller.status as SellerStatusType,
    attributes: prismaSeller.attributes as Record<string, any>,
    createdAt: prismaSeller.createdAt,
    updatedAt: prismaSeller.updatedAt ?? undefined,
    deletedAt: prismaSeller.deletedAt ?? undefined,
  });
}
