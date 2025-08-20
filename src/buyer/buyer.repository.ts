import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Buyer } from './entities/buyer.entity';
import { Prisma, Buyer as PrismaBuyer } from '@prisma/client';

@Injectable()
export class BuyerRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create(buyer: Buyer): Promise<Buyer> {
    return mapPrismaBuyerToDomain(
      await this.prisma.buyer.create({
        data: {
          userId: buyer.userId,
          ...(buyer.address ? buyer.address : {}),
          ...(buyer.paymentMethod ? buyer.paymentMethod : {}),
        },
      }),
    ) as Buyer;
  }

  async findAll(): Promise<Buyer[]> {
    return (await this.prisma.buyer.findMany()).map(
      mapPrismaBuyerToDomain,
    ) as Buyer[];
  }

  async findOne(id: string): Promise<Buyer | null> {
    return mapPrismaBuyerToDomain(
      await this.prisma.buyer.findUnique({ where: { id } }),
    );
  }

  async findByUserId(userId: string): Promise<Buyer | null> {
    return mapPrismaBuyerToDomain(
      await this.prisma.buyer.findUnique({ where: { userId } }),
    );
  }

  async update(buyer: Buyer): Promise<Buyer> {
    return mapPrismaBuyerToDomain(
      await this.prisma.buyer.update({
        where: { id: buyer.id },
        data: {
          ...(buyer.address !== undefined && {
            address: buyer.address as unknown as Prisma.InputJsonValue,
          }),
          ...(buyer.paymentMethod !== undefined && {
            paymentMethod:
              buyer.paymentMethod as unknown as Prisma.InputJsonValue,
          }),
        },
      }),
    ) as Buyer;
  }

  async remove(id: string): Promise<Buyer> {
    return mapPrismaBuyerToDomain(
      await this.prisma.buyer.delete({ where: { id } }),
    ) as Buyer;
  }
}

/**
 * Map Prisma Buyer model to domain Buyer entity.
 */
export function mapPrismaBuyerToDomain(
  prismaBuyer?: PrismaBuyer | null,
): Buyer | null {
  if (!prismaBuyer) return null;

  return new Buyer({
    id: prismaBuyer.id,
    userId: prismaBuyer.userId,
    ...(prismaBuyer.address
      ? { address: prismaBuyer.address as unknown as Buyer['address'] }
      : undefined),
    ...(prismaBuyer.paymentMethod
      ? {
          paymentMethod:
            prismaBuyer.paymentMethod as unknown as Buyer['paymentMethod'],
        }
      : undefined),
  });
}
