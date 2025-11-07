import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Cart } from '../entities/cart.entity';
import { Cart as PrismaCart, CartItem as PrismaCartItem } from '@prisma/client';

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create(cart: Cart): Promise<Cart> {
    return mapPrismaCartToDomain(
      await this.prisma.cart.create({
        data: {
          buyerId: cart.buyerId,
          isCheckout: cart.isCheckout ?? false,
          orderId: cart.orderId ?? null,
          createdAt: cart.createdAt ?? new Date(),
        },
        include: { items: true },
      }),
    ) as Cart;
  }

  async findOne(id: string): Promise<Cart | null> {
    return mapPrismaCartToDomain(
      await this.prisma.cart.findUnique({
        where: { id },
        include: { items: true },
      }),
    );
  }

  async findOneIfOwned(buyerId: string, cartId: string): Promise<Cart | null> {
    return mapPrismaCartToDomain(
      await this.prisma.cart.findUnique({
        where: { id: cartId, buyerId },
        include: { items: true },
      }),
    );
  }

  async findUncheckoutOneByUserId(buyerId: string): Promise<Cart> {
    return mapPrismaCartToDomain(
      await this.prisma.cart.findFirst({
        where: {
          buyerId,
          isCheckout: false,
        },
        include: { items: true },
      }),
    ) as Cart;
  }

  async findByBuyerId(buyerId: string): Promise<Cart[]> {
    return (
      await this.prisma.cart.findMany({
        where: { buyerId },
        include: { items: true },
      })
    ).map(mapPrismaCartToDomain) as Cart[];
  }

  async update(cart: Cart): Promise<Cart> {
    return mapPrismaCartToDomain(
      await this.prisma.cart.update({
        where: { id: cart.id },
        data: {
          isCheckout: cart.isCheckout,
          orderId: cart.orderId ?? null,
          updatedAt: new Date(),
        },
        include: { items: true },
      }),
    ) as Cart;
  }
}

export function mapPrismaCartToDomain(
  prismaCart?: (PrismaCart & { items: PrismaCartItem[] }) | null,
): Cart | null {
  if (!prismaCart) return null;

  return new Cart({
    id: prismaCart.id,
    buyerId: prismaCart.buyerId,
    isCheckout: prismaCart.isCheckout,
    orderId: prismaCart.orderId ?? undefined,
    createdAt: prismaCart.createdAt,
    updatedAt: prismaCart.updatedAt ?? undefined,
    items: prismaCart.items as Cart['items'],
  });
}
