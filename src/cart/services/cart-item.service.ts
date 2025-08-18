import { Injectable, NotFoundException } from '@nestjs/common';
import { CartItemRepository } from '../repositories/cart-item.repository';
import { CartItem } from '../entities/cart-item.entity';

@Injectable()
export class CartItemService {
  constructor(private readonly cartItemRepository: CartItemRepository) {}

  /**
   * Create a new cart item
   */
  async create(cartId: string, item: Omit<CartItem, 'id'>): Promise<CartItem> {
    const cartItem = new CartItem({
      ...item,
      id: '', // Let Prisma generate UUID
      cartId,
    });

    return this.cartItemRepository.createItem(cartItem);
  }

  /**
   * Get all items in a cart
   */
  async findByCartId(cartId: string): Promise<CartItem[]> {
    return this.cartItemRepository.findItemsByCartId(cartId);
  }

  /**
   * Update a cart item
   */
  async update(item: CartItem): Promise<CartItem> {
    const existingItem = await this.cartItemRepository.findItemsByCartId(
      item.cartId,
    );
    const foundItem = existingItem.find((i) => i.id === item.id);

    if (!foundItem) throw new NotFoundException('Cart item not found');

    // optionally merge changes if needed
    return this.cartItemRepository.updateItem(item);
  }

  /**
   * Remove a cart item
   */
  async remove(id: string, cartId: string): Promise<CartItem> {
    const existingItem =
      await this.cartItemRepository.findItemsByCartId(cartId);
    const foundItem = existingItem.find((i) => i.id === id);

    if (!foundItem) throw new NotFoundException('Cart item not found');

    return this.cartItemRepository.removeItem(id);
  }
}
