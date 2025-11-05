import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Order } from '../entities/order.entity';
import {
  Order as PrismaOrder,
  OrderEventRecord as PrismaOrderEventRecord,
  OrderItem as PrismaOrderItem,
} from '@prisma/client';
import { mapPrismaOrderItemToDomain } from '../repositories/order-item.repository';

import { mapPrismaOrderEventRecordToDomain } from '../repositories/event-record.repository';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create(order: Order): Promise<Order> {
    const prismaOrder = await this.prisma.order.create({
      data: {
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        shopId: order.shopId,
        cartId: order.cartId,
        addressId: order.addressId,
        carrierId: order.carrierId,

        totalAmount: order.totalAmount,
        shippingFee: order.shippingFee,
        discount: order.discount,
        currency: order.currency,

        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        orderStatus: order.orderStatus,

        attributes: order.attributes ?? {},

        remark: order.remark,
      },
      include: {
        eventRecords: true,
        items: true,
      },
    });

    return mapPrismaOrderToDomain(prismaOrder) as Order;
  }

  /**
   *  Seller side
   */
  async sellerfindAllIfOwned(sellerId: string): Promise<Order[]> {
    return (
      await this.prisma.order.findMany({
        where: { sellerId },
        include: { items: true, eventRecords: true },
      })
    ).map(mapPrismaOrderToDomain) as Order[];
  }

  async sellerfindOneIfOwned(id: string, sellerId: string): Promise<Order> {
    return mapPrismaOrderToDomain(
      await this.prisma.order.findUnique({
        where: { id, sellerId },
        include: { items: true, eventRecords: true },
      }),
    ) as Order;
  }

  async shopfindAllIfOwned(shopId: string, sellerId: string): Promise<Order[]> {
    return (
      await this.prisma.order.findMany({
        where: { shopId, sellerId },
        include: { items: true, eventRecords: true },
      })
    ).map(mapPrismaOrderToDomain) as Order[];
  }

  async sellerUpdateIfOwned(
    id: string,
    sellerId: string,
    order: Order,
  ): Promise<Order> {
    return mapPrismaOrderToDomain(
      await this.prisma.order.update({
        where: { id, sellerId },
        data: {
          // buyerId: order.buyerId,
          // sellerId: order.sellerId,
          // shopId: order.shopId,
          // cartId: order.cartId,
          // addressId: order.addressId,
          carrierId: order.carrierId,

          // totalAmount: order.totalAmount,
          // shippingFee: order.shippingFee,
          // discount: order.discount,
          // currency: order.currency,

          paymentStatus: order.paymentStatus,
          // paymentMethod: order.paymentMethod,
          orderStatus: order.orderStatus,
          attributes: order.attributes ?? {},
          remark: order.remark,
        },
        include: { items: true, eventRecords: true },
      }),
    ) as Order;
  }

  /**
   *  Buyer side
   */
  async buyerfindAllIfOwned(buyerId: string): Promise<Order[]> {
    return (
      await this.prisma.order.findMany({
        where: { buyerId },
        include: { items: true, eventRecords: true },
      })
    ).map(mapPrismaOrderToDomain) as Order[];
  }
  async buyerfindOneIfOwned(id: string, buyerId: string): Promise<Order> {
    return mapPrismaOrderToDomain(
      await this.prisma.order.findUnique({
        where: { id, buyerId },
        include: { items: true, eventRecords: true },
      }),
    ) as Order;
  }

  // async findOne(id: string): Promise<Order | null> {
  //   const order = await this.prisma.order.findUnique({
  //     where: { id },
  //     include: { items: true, eventRecords: true },
  //   });
  //   return mapPrismaOrderToDomain(order);
  // }

  // async findByBuyerId(buyerId: string): Promise<Order[]> {
  //   const orders = await this.prisma.order.findMany({
  //     where: { buyerId },
  //     include: { items: true, eventRecords: true },
  //   });
  //   return orders.map(mapPrismaOrderToDomain) as Order[];
  // }

  // async update(order: Order): Promise<Order> {
  //   const updated = await this.prisma.order.update({
  //     where: { id: order.id },
  //     data: {
  //       paymentStatus: order.paymentStatus as PrismaOrderPaymentStatus,
  //       orderStatus: order.orderStatus as PrismaOrderStatus,
  //       totalAmount: order.totalAmount,
  //       currency: order.currency,
  //       paymentMethod: order.paymentMethod,
  //       updatedAt: new Date(),
  //     },
  //     include: { items: true, eventRecords: true },
  //   });

  //   return mapPrismaOrderToDomain(updated) as Order;
  // }

  // async remove(id: string): Promise<Order> {
  //   const deleted = await this.prisma.order.delete({
  //     where: { id },
  //     include: { items: true, eventRecords: true },
  //   });
  //   return mapPrismaOrderToDomain(deleted) as Order;
  // }
}

/**
 * Map Prisma Order model to domain Order entity
 */
export function mapPrismaOrderToDomain(
  prismaOrder?:
    | (PrismaOrder & { items: PrismaOrderItem[] | undefined } & {
        eventRecords: PrismaOrderEventRecord[] | undefined;
      })
    | null,
): Order | null {
  if (!prismaOrder) return null;

  return new Order({
    id: prismaOrder.id,
    buyerId: prismaOrder.buyerId,
    sellerId: prismaOrder.sellerId,
    shopId: prismaOrder.shopId,
    cartId: prismaOrder.cartId,
    addressId: prismaOrder.addressId,
    carrierId: prismaOrder.carrierId ?? undefined,
    items:
      (prismaOrder.items?.map(mapPrismaOrderItemToDomain) as Order['items']) ??
      [],
    totalAmount: prismaOrder.totalAmount,
    shippingFee: prismaOrder.shippingFee,
    discount: prismaOrder.discount,
    currency: prismaOrder.currency,
    paymentStatus: prismaOrder.paymentStatus as Order['paymentStatus'],
    paymentMethod: prismaOrder.paymentMethod,
    orderStatus: prismaOrder.orderStatus as Order['orderStatus'],
    eventRecords:
      (prismaOrder.eventRecords?.map(
        mapPrismaOrderEventRecordToDomain,
      ) as Order['eventRecords']) ?? [],
    ...(prismaOrder.remark ? { remark: prismaOrder.remark } : undefined),
    createdAt: prismaOrder.createdAt,
    updatedAt: prismaOrder.updatedAt,
  });
}
