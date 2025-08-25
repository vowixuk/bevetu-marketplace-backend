import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { SellerShipping } from '../entities/seller-shipping.entity';
import { SellerShipping as PrismaSellerShipping, Prisma } from '@prisma/client';

@Injectable()
export class SellerShippingRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create(shipping: SellerShipping): Promise<SellerShipping> {
    const prismaShipping = await this.prisma.sellerShipping.create({
      data: {
        shopId: shipping.shopId,
        sellerId: shipping.sellerId,
        freeShippingOption: shipping.freeShippingOption
          ? shipping.freeShippingOption
          : null,
        createdAt: new Date(),
      } as unknown as Prisma.SellerShippingProfileUncheckedCreateInput,
    });

    return mapPrismaSellerShippingToDomain(prismaShipping) as SellerShipping;
  }

  async findOne(id: string): Promise<SellerShipping | null> {
    const shipping = await this.prisma.sellerShipping.findUnique({
      where: { id },
      include: { shippingProfiles: true },
    });
    return mapPrismaSellerShippingToDomain(shipping);
  }

  async findBySellerId(sellerId: string): Promise<SellerShipping | null> {
    const shipping = await this.prisma.sellerShipping.findFirst({
      where: { sellerId },
    });
    return mapPrismaSellerShippingToDomain(shipping);
  }

  async update(shipping: SellerShipping): Promise<SellerShipping> {
    const prismaShipping = await this.prisma.sellerShipping.update({
      where: { id: shipping.id },
      data: {
        shopId: shipping.shopId,
        sellerId: shipping.sellerId,
        freeShippingOption: shipping.freeShippingOption
          ? shipping.freeShippingOption
          : Prisma.JsonNull,
        updatedAt: new Date(),
      },
    });

    return mapPrismaSellerShippingToDomain(prismaShipping) as SellerShipping;
  }

  async remove(id: string): Promise<SellerShipping> {
    const prismaShipping = await this.prisma.sellerShipping.delete({
      where: { id },
    });
    return mapPrismaSellerShippingToDomain(prismaShipping) as SellerShipping;
  }
}

export function mapPrismaSellerShippingToDomain(
  prismaShipping?: PrismaSellerShipping | null,
): SellerShipping | null {
  if (!prismaShipping) return null;

  return new SellerShipping({
    id: prismaShipping.id,
    shopId: prismaShipping.shopId,
    sellerId: prismaShipping.sellerId,
    freeShippingOption: prismaShipping.freeShippingOption
      ? (prismaShipping.freeShippingOption as SellerShipping['freeShippingOption'])
      : null,
    createdAt: prismaShipping.createdAt,
    updatedAt: prismaShipping.updatedAt ?? undefined,
  });
}
