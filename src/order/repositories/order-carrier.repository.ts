import { OrderCarrier } from '../entities/order-carrier.entity';
import { OrderCarrier as PrismaOrderCarrier } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class OrderCarrierRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create(orderCarrier: OrderCarrier): Promise<OrderCarrier> {
    return mapPrismaOrderCarrierToDomain(
      await this.prisma.orderCarrier.create({
        data: {
          orderId: orderCarrier.orderId,
          carrierName: orderCarrier.carrierName,
          serviceType: orderCarrier.serviceType,
          trackingNumber: orderCarrier.trackingNumber,
          trackingUrl: orderCarrier.trackingUrl,
          shippedAt: orderCarrier.shippedAt,
          estimatedDelivery: orderCarrier.estimatedDelivery,
          deliveredAt: orderCarrier.deliveredAt,
          remark: orderCarrier.remark,
        },
      }),
    ) as OrderCarrier;
  }

  async fineOneIfShopOwned(id: string, shopId: string): Promise<OrderCarrier> {
    return mapPrismaOrderCarrierToDomain(
      await this.prisma.orderCarrier.findUnique({
        where: {
          id,
          order: {
            shopId: shopId,
          },
        },
      }),
    ) as OrderCarrier;
  }

  async updateIfShopOwned(
    id: string,
    shopId: string,
    orderCarrier: OrderCarrier,
  ): Promise<OrderCarrier> {
    return mapPrismaOrderCarrierToDomain(
      await this.prisma.orderCarrier.update({
        where: {
          id: orderCarrier.id,
          orderId: orderCarrier.orderId,
          order: {
            shopId,
          },
        },
        data: {
          carrierName: orderCarrier.carrierName,
          serviceType: orderCarrier.serviceType,
          trackingNumber: orderCarrier.trackingNumber,
          trackingUrl: orderCarrier.trackingUrl,
          shippedAt: orderCarrier.shippedAt,
          estimatedDelivery: orderCarrier.estimatedDelivery,
          deliveredAt: orderCarrier.deliveredAt,
          remark: orderCarrier.remark,
        },
      }),
    ) as OrderCarrier;
  }

  //   async sellerUpdateIfOwned(
  //     sellerId: string,
  //     orderCarrier: OrderCarrier,
  //   ): Promise<OrderCarrier> {
  //     return mapPrismaOrderCarrierToDomain(
  //       await this.prisma.orderCarrier.update({
  //         where: {
  //           id: orderCarrier.id,
  //           order: {
  //             sellerId,
  //           },
  //         },
  //         data: {
  //           orderId: orderCarrier.orderId,
  //           carrierName: orderCarrier.carrierName,
  //           serviceType: orderCarrier.serviceType,
  //           trackingNumber: orderCarrier.trackingNumber,
  //           trackingUrl: orderCarrier.trackingUrl,
  //           shippedAt: orderCarrier.shippedAt,
  //           estimatedDelivery: orderCarrier.estimatedDelivery,
  //           deliveredAt: orderCarrier.deliveredAt,
  //           remark: orderCarrier.remark,
  //         },
  //       }),
  //     ) as OrderCarrier;
  //   }
  // }
}
function mapPrismaOrderCarrierToDomain(
  prismaCarrier?: PrismaOrderCarrier | null,
): OrderCarrier | null {
  if (!prismaCarrier) return null;

  return new OrderCarrier({
    id: prismaCarrier.id,
    orderId: prismaCarrier.orderId,
    carrierName: prismaCarrier.carrierName,
    serviceType: prismaCarrier.serviceType ?? undefined,
    trackingNumber: prismaCarrier.trackingNumber ?? undefined,
    trackingUrl: prismaCarrier.trackingUrl ?? undefined,
    shippedAt: prismaCarrier.shippedAt ?? undefined,
    estimatedDelivery: prismaCarrier.estimatedDelivery ?? undefined,
    deliveredAt: prismaCarrier.deliveredAt ?? undefined,
    remark: prismaCarrier.remark ?? undefined,
    createdAt: prismaCarrier.createdAt,
    updatedAt: prismaCarrier.updatedAt,
  });
}
