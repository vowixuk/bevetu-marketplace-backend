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
          productId: item.productId,
          varientId: item.varientId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          refundedQuantity: item.refundedQuantity ?? 0,
          refundedAmount: item.refundedAmount ?? 0,
          refundStatus:
            (item.refundStatus as PrismaOrderRefundStatus) ?? 'NONE',
          createdAt: item.createdAt ?? new Date(),
        },
      }),
    ) as OrderItem;
  }

  async findOne(id: string): Promise<OrderItem | null> {
    return mapPrismaOrderItemToDomain(
      await this.prisma.orderItem.findUnique({ where: { id } }),
    );
  }

  async findByOrderId(orderId: string): Promise<OrderItem[]> {
    return (await this.prisma.orderItem.findMany({ where: { orderId } })).map(
      mapPrismaOrderItemToDomain,
    ) as OrderItem[];
  }

  async update(item: OrderItem): Promise<OrderItem> {
    return mapPrismaOrderItemToDomain(
      await this.prisma.orderItem.update({
        where: { id: item.id },
        data: {
          productId: item.productId,
          varientId: item.varientId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          refundedQuantity: item.refundedQuantity,
          refundedAmount: item.refundedAmount,
          refundStatus: item.refundStatus as PrismaOrderRefundStatus,
          updatedAt: new Date(),
        },
      }),
    ) as OrderItem;
  }

  async remove(id: string): Promise<OrderItem> {
    return mapPrismaOrderItemToDomain(
      await this.prisma.orderItem.delete({ where: { id } }),
    ) as OrderItem;
  }
}

/**
 * Map Prisma OrderItem model to domain OrderItem entity
 */
export function mapPrismaOrderItemToDomain(
  prismaItem?: PrismaOrderItem | null,
): OrderItem | null {
  if (!prismaItem) return null;

  return new OrderItem({
    id: prismaItem.id,
    orderId: prismaItem.orderId,
    productId: prismaItem.productId,
    varientId: prismaItem.varientId,
    productName: prismaItem.productName,
    quantity: prismaItem.quantity,
    price: prismaItem.price,
    refundedQuantity: prismaItem.refundedQuantity,
    refundedAmount: prismaItem.refundedAmount,
    refundStatus: prismaItem.refundStatus as OrderItem['refundStatus'],
    createdAt: prismaItem.createdAt,
    updatedAt: prismaItem.updatedAt ?? undefined,
  });
}
