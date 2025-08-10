import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Shop } from './entities/shop.entity';
import { Shop as PrismaShop } from '@prisma/client';

@Injectable()
export class ShopRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create(shop: Shop): Promise<Shop | null> {
    return mapPrismaShopToDomain(
      await this.prisma.shop.create({
        data: {
          sellerId: shop.sellerId,
          name: shop.name,
          description: shop.description,
          country: shop.country,
          shopUrl: shop.shopUrl,
          attributes: shop.attributes,
          ...(shop.website ? { website: shop.website } : {}),
          createdAt: shop.createdAt ?? new Date(),
        },
      }),
    );
  }

  async findAllBySellerId(sellerId: string): Promise<Shop[]> {
    const shops = await this.prisma.shop.findMany({
      where: { sellerId },
    });
    return shops.map(mapPrismaShopToDomain) as Shop[];
  }

  async findOne(id: string): Promise<Shop | null> {
    return mapPrismaShopToDomain(
      await this.prisma.shop.findUnique({
        where: { id },
      }),
    );
  }

  async update(shop: Shop): Promise<Shop | null> {
    return mapPrismaShopToDomain(
      await this.prisma.shop.update({
        where: { id: shop.id },
        data: {
          name: shop.name,
          description: shop.description,
          country: shop.country,
          shopUrl: shop.shopUrl,
          attributes: shop.attributes,
          website: shop.website ?? null,
          updatedAt: new Date(),
          deletedAt: shop.deletedAt ?? null,
        },
      }),
    );
  }

  async remove(id: string): Promise<Shop | null> {
    return mapPrismaShopToDomain(
      await this.prisma.shop.delete({
        where: { id },
      }),
    );
  }
}

/**
 * Map Prisma shop model to domain Shop entity.
 * Keeps Prisma types locked in the repository layer.
 */
export function mapPrismaShopToDomain(
  prismaShop?: PrismaShop | null,
): Shop | null {
  if (!prismaShop) {
    return null;
  }
  return new Shop({
    id: prismaShop.id,
    sellerId: prismaShop.sellerId,
    name: prismaShop.name,
    description: prismaShop.description,
    country: prismaShop.country,
    shopUrl: prismaShop.shopUrl,
    website: prismaShop.website ?? undefined,
    attributes: prismaShop.attributes as Record<string, any>,
    createdAt: prismaShop.createdAt,
    updatedAt: prismaShop.updatedAt ?? undefined,
    deletedAt: prismaShop.deletedAt ?? undefined,
  });
}
