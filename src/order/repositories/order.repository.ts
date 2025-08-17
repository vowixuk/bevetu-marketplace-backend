import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Order } from '../entities/order.entity';
import {
  Order as PrismaOrder,
  OrderPaymentStatus as PrismaOrderPaymentStatus,
  OrderStatus as PrismaOrderStatus,
  OrderEventRecord as PrismaOrderEventRecord,
  OrderItem as PrismaOrderItem,
} from '@prisma/client';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create(order: Order): Promise<Order> {
    return mapPrismaOrderToDomain(
      await this.prisma.order.create({
        data: {
          buyerId: order.buyerId,
          shopId: order.shopId,
          totalAmount: order.totalAmount,
          currency: order.currency,
          paymentStatus: order.paymentStatus as PrismaOrderPaymentStatus,
          paymentMethod: order.paymentMethod,
          orderStatus: order.orderStatus as PrismaOrderStatus,
          createdAt: order.createdAt ?? new Date(),
          items: {
            create: order.items.map((item) => ({
              productId: item.productId,
              varientId: item.varientId,
              productName: item.productName,
              quantity: item.quantity,
              price: item.price,
              refundedQuantity: item.refundedQuantity ?? 0,
              refundedAmount: item.refundedAmount ?? 0,
              refundStatus: item.refundStatus ?? 'NONE',
              createdAt: item.createdAt ?? new Date(),
            })),
          },
          eventRecords: {
            create: order.eventRecords.map((record) => ({
              type: record.type,
              metadata: record.metadata ?? {},
              createdAt: record.createdAt ?? new Date(),
            })),
          },
        },
        include: {
          items: true,
          eventRecords: true,
        },
      }),
    ) as Order;
  }

  async findAll(): Promise<Order[]> {
    return (
      await this.prisma.order.findMany({
        include: { items: true, eventRecords: true },
      })
    ).map(mapPrismaOrderToDomain) as Order[];
  }

  async findOne(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, eventRecords: true },
    });
    return mapPrismaOrderToDomain(order);
  }

  async findByBuyerId(buyerId: string): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { buyerId },
      include: { items: true, eventRecords: true },
    });
    return orders.map(mapPrismaOrderToDomain) as Order[];
  }

  async update(order: Order): Promise<Order> {
    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: order.paymentStatus as PrismaOrderPaymentStatus,
        orderStatus: order.orderStatus as PrismaOrderStatus,
        totalAmount: order.totalAmount,
        currency: order.currency,
        paymentMethod: order.paymentMethod,
        updatedAt: new Date(),
      },
      include: { items: true, eventRecords: true },
    });

    return mapPrismaOrderToDomain(updated) as Order;
  }

  async remove(id: string): Promise<Order> {
    const deleted = await this.prisma.order.delete({
      where: { id },
      include: { items: true, eventRecords: true },
    });
    return mapPrismaOrderToDomain(deleted) as Order;
  }
}

/**
 * Map Prisma Order model to domain Order entity
 */
export function mapPrismaOrderToDomain(
  prismaOrder?:
    | (PrismaOrder & {
        eventRecords: PrismaOrderEventRecord[];
        items: PrismaOrderItem[];
      })
    | null,
): Order | null {
  if (!prismaOrder) return null;

  return new Order({
    id: prismaOrder.id,
    buyerId: prismaOrder.buyerId,
    shopId: prismaOrder.shopId,
    totalAmount: prismaOrder.totalAmount,
    currency: prismaOrder.currency,
    paymentStatus: prismaOrder.paymentStatus as Order['paymentStatus'],
    paymentMethod: prismaOrder.paymentMethod,
    orderStatus: prismaOrder.orderStatus as Order['orderStatus'],
    createdAt: prismaOrder.createdAt,
    updatedAt: prismaOrder.updatedAt,
    items: (prismaOrder.items as Order['items']) ?? [],
    eventRecords: (prismaOrder.eventRecords as Order['eventRecords']) ?? [],
  });
}
