import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { OrderItem } from '../entities/order-item.entity';
import { OrderItem as PrismaOrderItem } from '@prisma/client';

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
          refundStatus: item.refundStatus,
          attributes: item.attributes ?? {},
          remark: item.remark,
        },
      }),
    ) as OrderItem;
  }
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
    refundedQuantity: prismaItem.refundedQuantity ?? 0,
    refundedAmount: prismaItem.refundedAmount ?? 0,
    refundStatus: prismaItem.refundStatus as OrderItem['refundStatus'],
    attributes: (prismaItem.attributes as OrderItem['attributes']) ?? undefined,
    remark: (prismaItem.remark as OrderItem['remark']) ?? undefined,
    createdAt: prismaItem.createdAt,
    updatedAt: prismaItem.updatedAt,
  });
}
