import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Order } from '../entities/order.entity';
import {
  Order as PrismaOrder,
  OrderEventRecord as PrismaOrderEventRecord,
  OrderItem as PrismaOrderItem,
  OrderAddress as PrismaOrderAddress,
} from '@prisma/client';
import { mapPrismaOrderItemToDomain } from '../repositories/order-item.repository';
import { mapPrismaOrderAddressToDomain } from './order-address.repository';
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
        orderAddress: true,
      },
    });

    return mapPrismaOrderToDomain(prismaOrder) as Order;
  }

  /**
   *  Seller side
   */
  async sellerFindAllIfOwned(
    sellerId: string,
    page: {
      skip?: number;
      take?: number;
      orderBy?: 'desc' | 'asc';
    } = {
      skip: 0,
      take: 10,
      orderBy: 'desc',
    },
  ): Promise<{ orders: Order[]; total: number }> {
    const total = await this.prisma.order.count({
      where: { sellerId },
    });
    const orders = (
      await this.prisma.order.findMany({
        where: { sellerId },
        include: { items: true, eventRecords: true },
        skip: page.skip,
        take: page.take,
        orderBy: { updatedAt: page.orderBy },
      })
    ).map(mapPrismaOrderToDomain) as Order[];
    return {
      orders,
      total,
    };
  }

  async sellerFindOneIfOwned(id: string, sellerId: string): Promise<Order> {
    return mapPrismaOrderToDomain(
      await this.prisma.order.findUnique({
        where: { id, sellerId },
        include: { items: true, eventRecords: true, orderAddress: true },
      }),
    ) as Order;
  }

  async shopFindAllIfOwned(
    shopId: string,
    sellerId: string,
    page: {
      skip?: number;
      take?: number;
      orderBy?: 'desc' | 'asc';
    } = {
      skip: 0,
      take: 10,
      orderBy: 'desc',
    },
  ): Promise<{ orders: Order[]; total: number }> {
    const total = await this.prisma.order.count({
      where: { shopId, sellerId },
    });
    const orders = (
      await this.prisma.order.findMany({
        where: { shopId, sellerId },
        include: { items: true, eventRecords: true },
        skip: page.skip,
        take: page.take,
        orderBy: { updatedAt: page.orderBy },
      })
    ).map(mapPrismaOrderToDomain) as Order[];
    return {
      orders,
      total,
    };
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

          // paymentStatus: order.paymentStatus,
          // paymentMethod: order.paymentMethod,
          orderStatus: order.orderStatus,
          attributes: order.attributes ?? {},
          remark: order.remark,
        },
        include: { items: true, eventRecords: true },
      }),
    ) as Order;
  }

  async findOne(id: string): Promise<Order> {
    return mapPrismaOrderToDomain(
      await this.prisma.order.findUnique({
        where: { id },
        include: { items: true, eventRecords: true, orderAddress: true },
      }),
    ) as Order;
  }

  async update(id: string, order: Order) {
    const prismaOrder = await this.prisma.order.update({
      where: {
        id,
      },
      data: {
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        shopId: order.shopId,
        cartId: order.cartId,
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
        orderAddress: true,
      },
    });

    return mapPrismaOrderToDomain(prismaOrder) as Order;
  }

  /**
   *  Buyer side
   */
  async buyerFindAllIfOwned(
    buyerId: string,
    page: {
      skip?: number;
      take?: number;
      orderBy?: 'desc' | 'asc';
    } = {
      skip: 0,
      take: 10,
      orderBy: 'desc',
    },
  ): Promise<{ orders: Order[]; total: number }> {
    const total = await this.prisma.order.count({
      where: { buyerId },
    });
    const orders = (
      await this.prisma.order.findMany({
        where: { buyerId },
        include: { items: true, eventRecords: true, orderAddress: true },
        skip: page.skip,
        take: page.take,
        orderBy: { updatedAt: page.orderBy },
      })
    ).map(mapPrismaOrderToDomain) as Order[];

    return {
      orders,
      total,
    };
  }
  async buyerFindOneIfOwned(id: string, buyerId: string): Promise<Order> {
    return mapPrismaOrderToDomain(
      await this.prisma.order.findUnique({
        where: { id, buyerId },
        include: {
          items: true,
          eventRecords: true,
          orderAddress: true,
        },
      }),
    ) as Order;
  }

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
}

/**
 * Map Prisma Order model to domain Order entity
 */
export function mapPrismaOrderToDomain(
  prismaOrder?:
    | (PrismaOrder & {
        items: PrismaOrderItem[] | undefined;
      } & {
        eventRecords: PrismaOrderEventRecord[] | undefined;
      })
    | (PrismaOrder & {
        items: PrismaOrderItem[] | undefined;
      } & {
        eventRecords: PrismaOrderEventRecord[] | undefined;
      } & { orderAddress: PrismaOrderAddress })
    | null,
): Order | null {
  if (!prismaOrder) return null;

  return new Order({
    id: prismaOrder.id,
    buyerId: prismaOrder.buyerId,
    sellerId: prismaOrder.sellerId,
    shopId: prismaOrder.shopId,
    cartId: prismaOrder.cartId,

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

    ...('orderAddress' in prismaOrder
      ? {
          orderAddress:
            mapPrismaOrderAddressToDomain(prismaOrder.orderAddress) ??
            undefined,
        }
      : undefined),
  });
}
