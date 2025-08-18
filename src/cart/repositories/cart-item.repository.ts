import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CartItem } from '../entities/cart-item.entity';
import { CartItem as PrismaCartItem } from '@prisma/client';

@Injectable()
export class CartItemRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async createItem(item: CartItem): Promise<CartItem> {
    return mapPrismaCartItemToDomain(
      await this.prisma.cartItem.create({
        data: {
          cartId: item.cartId,
          shopId: item.shopId,
          productId: item.productId,
          varientId: item.varientId,
          quantity: item.quantity,
          price: item.price,
        },
      }),
    ) as CartItem;
  }

  async findItemsByCartId(cartId: string): Promise<CartItem[]> {
    return (await this.prisma.cartItem.findMany({ where: { cartId } })).map(
      mapPrismaCartItemToDomain,
    ) as CartItem[];
  }

  async updateItem(item: CartItem): Promise<CartItem> {
    return mapPrismaCartItemToDomain(
      await this.prisma.cartItem.update({
        where: { id: item.id },
        data: {
          quantity: item.quantity,
          price: item.price,
        },
      }),
    ) as CartItem;
  }

  async removeItem(id: string): Promise<CartItem> {
    return mapPrismaCartItemToDomain(
      await this.prisma.cartItem.delete({ where: { id } }),
    ) as CartItem;
  }
}

export function mapPrismaCartItemToDomain(
  prismaItem?: PrismaCartItem | null,
): CartItem | null {
  if (!prismaItem) return null;

  return new CartItem({
    id: prismaItem.id,
    shopId: prismaItem.shopId,
    cartId: prismaItem.cartId,
    productId: prismaItem.productId,
    varientId: prismaItem.varientId,
    quantity: prismaItem.quantity,
    price: prismaItem.price,
  });
}
