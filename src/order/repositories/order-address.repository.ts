import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

import { OrderAddress as PrismaOrderAddress } from '@prisma/client';
import { OrderAddress } from '../entities/order-address';

@Injectable()
export class OrderAddressRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create(orderAddress: OrderAddress): Promise<OrderAddress> {
    return mapPrismaOrderAddressToDomain(
      await this.prisma.orderAddress.create({
        data: {
          buyerId: orderAddress.buyerId,
          orderId: orderAddress.orderId,
          fullName: orderAddress.fullName,
          phoneNumber: orderAddress.phoneNumber,
          line1: orderAddress.line1,
          line2: orderAddress.line2,
          city: orderAddress.city,
          state: orderAddress.state,
          postalCode: orderAddress.postalCode,
          country: orderAddress.country,
        },
      }),
    ) as OrderAddress;
  }
}

export function mapPrismaOrderAddressToDomain(
  prismaAddress?: PrismaOrderAddress | null,
): OrderAddress | null {
  if (!prismaAddress) return null;

  return new OrderAddress({
    id: prismaAddress.id,
    orderId: prismaAddress.orderId ?? '',
    buyerId: prismaAddress.buyerId,
    fullName: prismaAddress.fullName,
    ...(prismaAddress.phoneNumber
      ? { phoneNumber: prismaAddress.phoneNumber }
      : undefined),
    line1: prismaAddress.line1,
    ...(prismaAddress.line2 ? { line2: prismaAddress.line2 } : undefined),
    city: prismaAddress.city,
    ...(prismaAddress.state ? { state: prismaAddress.state } : undefined),
    postalCode: prismaAddress.postalCode,
    country: prismaAddress.country,
  });
}
