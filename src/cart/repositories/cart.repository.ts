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
          userId: cart.userId,
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

  async findByUserId(userId: string): Promise<Cart[]> {
    return (
      await this.prisma.cart.findMany({
        where: { userId },
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

  async remove(id: string): Promise<Cart> {
    return mapPrismaCartToDomain(
      await this.prisma.cart.delete({
        where: { id },
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
    userId: prismaCart.userId,
    isCheckout: prismaCart.isCheckout,
    orderId: prismaCart.orderId ?? undefined,
    createdAt: prismaCart.createdAt,
    updatedAt: prismaCart.updatedAt ?? undefined,
    items: prismaCart.items as Cart['items'], // Load items separately or via service
  });
}
