import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CartItem as PrismaCartItem } from '@prisma/client';
import { CartItem } from '../entities/cart-item.entity';

@Injectable()
export class CartItemRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async findByCartIdIfOwned(
    buyerId: string,
    cartId: string,
  ): Promise<CartItem[]> {
    const items = await this.prisma.cartItem.findMany({
      where: {
        cartId,
        cart: {
          buyerId,
        },
      },
    });

    return items.map(mapPrismaCartItemToDomain) as CartItem[];
  }

  async findOneIfOwned(buyerId: string, cartItemId: string) {
    return mapPrismaCartItemToDomain(
      await this.prisma.cartItem.findUnique({
        where: {
          id: cartItemId,
          cart: {
            buyerId,
          },
        },
      }),
    );
  }

  async updateIfOwned(buyerId: string, item: CartItem): Promise<CartItem> {
    return mapPrismaCartItemToDomain(
      await this.prisma.cartItem.update({
        where: {
          id: item.id,
          cart: {
            buyerId,
          },
        },
        data: {
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          available: item.available,
          unavailableReason: item.unavailableReason,
        },
      }),
    ) as CartItem;
  }

  async updateMany(items: CartItem[]) {
    await Promise.all(
      items.map((item) =>
        this.prisma.cartItem.update({
          where: { id: item.id },
          data: {
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            available: item.available,
            unavailableReason: item.unavailableReason,
          },
        }),
      ),
    );
  }

  async createIfOwned(buyerId: string, item: CartItem): Promise<CartItem> {
    const cart = await this.prisma.cart.findUnique({
      where: {
        id: item.cartId,
      },
      select: { buyerId: true },
    });

    if (!cart || cart.buyerId !== buyerId) {
      throw new BadRequestException('Cart does not belong to this buyer');
    }
    return mapPrismaCartItemToDomain(
      await this.prisma.cartItem.create({
        data: {
          cartId: item.cartId,
          shopId: item.shopId,
          productId: item.productId,
          productName: item.productName,
          varientId: item.varientId ?? undefined,
          ...(item.unavailableReason
            ? { unavailableReason: item.unavailableReason }
            : undefined),
          quantity: item.quantity,
          price: item.price,
          available: item.available,
        },
      }),
    ) as CartItem;
  }

  async createManyIfOwned(buyerId: string, items: CartItem[]) {
    if (!items.length) return [];

    const cartIds = Array.from(new Set(items.map((i) => i.cartId)));

    const carts = await this.prisma.cart.findMany({
      where: { id: { in: cartIds } },
      select: { id: true, buyerId: true },
    });

    const ownedCartIds = carts
      .filter((c) => c.buyerId === buyerId)
      .map((c) => c.id);

    const unauthorizedCart = items.find(
      (i) => !ownedCartIds.includes(i.cartId),
    );
    if (unauthorizedCart) {
      throw new BadRequestException(
        'One or more carts do not belong to this buyer',
      );
    }

    // Bulk insert
    await this.prisma.cartItem.createMany({
      data: items.map((item) => ({
        cartId: item.cartId,
        shopId: item.shopId,
        productId: item.productId,
        productName: item.productName,
        varientId: item.varientId ?? undefined,
        unavailableReason: item.unavailableReason ?? undefined,
        quantity: item.quantity,
        price: item.price,
        available: item.available,
      })),
      skipDuplicates: false,
    });
  }

  async removeIfOwned(
    buyerId: string,
    cartId: string,
    itemId: string,
  ): Promise<CartItem> {
    return mapPrismaCartItemToDomain(
      await this.prisma.cartItem.delete({
        where: {
          id: itemId,
          cartId,
          cart: {
            buyerId,
          },
        },
      }),
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
    productName: prismaItem.productName,
    productId: prismaItem.productId,
    varientId: prismaItem.varientId ?? undefined,
    unavailableReason: prismaItem.unavailableReason ?? undefined,
    quantity: prismaItem.quantity,
    price: prismaItem.price,
    available: prismaItem.available === true ? true : false,
    ...(prismaItem.unavailableReason
      ? { unavailableReason: prismaItem.unavailableReason }
      : undefined),
  });
}
