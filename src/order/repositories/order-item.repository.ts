import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { OrderItem } from '../entities/order-item.entity';
import {
  OrderItem as PrismaOrderItem,
  OrderRefundStatus as PrismaOrderRefundStatus,
} from '@prisma/client';

@Injectable()
export class OrderItemRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create(item: OrderItem): Promise<OrderItem> {
    return mapPrismaOrderItemToDomain(
      await this.prisma.orderItem.create({
        data: {
          orderId: item.orderId,
          shopId: item.shopId,
          productId: item.productId,
          varientId: item.varientId ?? undefined,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,

          shippingFee: item.shippingFee,
          discount: item.discount,

          refundedQuantity: item.refundedQuantity,
          refundedAmount: item.refundedAmount,
          refundStatus: item.refundStatus as PrismaOrderRefundStatus,
          attributes: item.attributes ?? {},
          remark: item.remark,
        },
      }),
    ) as OrderItem;
  }

  async createMany(items: OrderItem[]): Promise<boolean> {
    if (!items.length) return false;

    await this.prisma.orderItem.createMany({
      data: items.map((item) => ({
        orderId: item.orderId,
        shopId: item.shopId,
        productId: item.productId,
        varientId: item.varientId ?? undefined,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,

        shippingFee: item.shippingFee,
        discount: item.discount,

        refundedQuantity: item.refundedQuantity,
        refundedAmount: item.refundedAmount,
        refundStatus: item.refundStatus as PrismaOrderRefundStatus,
        attributes: item.attributes ?? {},
        remark: item.remark,
      })),
      skipDuplicates: false,
    });

    return true;
  }

  // async sellerFindOneIfOwned(
  //   id: string,
  //   sellerId: string,
  // ): Promise<OrderItem | null> {
  //   return mapPrismaOrderItemToDomain(
  //     await this.prisma.orderItem.findUnique({
  //       where: {
  //         id,
  //         order: {
  //           sellerId,
  //         },
  //       },
  //     }),
  //   );
  // }

  //   async sellerUpdateIfOwned(
  //     id: string,
  //     sellerId: string,
  //     item: OrderItem,
  //   ): Promise<OrderItem> {
  //     return mapPrismaOrderItemToDomain(
  //       await this.prisma.orderItem.update({
  //         where: {
  //           id,
  //           order: {
  //             sellerId,
  //           },
  //         },
  //         data: {
  //           // orderId: item.orderId,
  //           // shopId: item.shopId,
  //           // productId: item.productId,
  //           // varientId: item.varientId ?? undefined,
  //           // productName: item.productName,
  //           // quantity: item.quantity,
  //           // price: item.price,

  //           // shippingFee: item.shippingFee,
  //           // discount: item.discount,

  //           refundedQuantity: item.refundedQuantity,
  //           refundedAmount: item.refundedAmount,
  //           refundStatus: item.refundStatus as PrismaOrderRefundStatus,
  //           attributes: item.attributes ?? {},
  //           remark: item.remark,
  //         },
  //       }),
  //     ) as OrderItem;
  //   }
}

/**
 * Map Prisma model to  entity
 */
export function mapPrismaOrderItemToDomain(
  prismaItem?: PrismaOrderItem | null,
): OrderItem | null {
  if (!prismaItem) return null;

  return new OrderItem({
    id: prismaItem.id,
    orderId: prismaItem.orderId,
    shopId: prismaItem.shopId,
    productId: prismaItem.productId,
    varientId: prismaItem.varientId ?? undefined,
    productName: prismaItem.productName,
    quantity: prismaItem.quantity,
    price: prismaItem.price,
    shippingFee: prismaItem.shippingFee,
    discount: prismaItem.discount,
    refundedQuantity: prismaItem.refundedQuantity ?? undefined,
    refundedAmount: prismaItem.refundedAmount ?? undefined,
    refundStatus:
      (prismaItem.refundStatus as OrderItem['refundStatus']) ?? undefined,
    attributes: (prismaItem.attributes as OrderItem['attributes']) ?? undefined,
    remark: (prismaItem.remark as OrderItem['remark']) ?? undefined,
    createdAt: prismaItem.createdAt,
    updatedAt: prismaItem.updatedAt,
  });
}
