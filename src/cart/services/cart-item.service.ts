import { Injectable } from '@nestjs/common';
import { CartItemRepository } from '../repositories/cart-item.repository';
import { CartItem } from '../entities/cart-item.entity';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CreateCartItemDto } from '../dto/create-cart-item.dto';

@Injectable()
export class CartItemService {
  constructor(private readonly cartItemRepository: CartItemRepository) {}

  async findByCartIdIfOwned(
    buyerId: string,
    cartId: string,
  ): Promise<CartItem[]> {
    return await this.cartItemRepository.findByCartIdIfOwned(buyerId, cartId);
  }

  async findOneIfOwned(
    buyerId: string,
    cartItemId: string,
  ): Promise<CartItem | null> {
    return await this.cartItemRepository.findOneIfOwned(buyerId, cartItemId);
  }

  async updateIfOwned(
    buyerId: string,
    cartItemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartItem | null> {
    const item = await this.findOneIfOwned(buyerId, cartItemId);
    if (item) {
      const cartItem = new CartItem({
        ...item,
        ...dto,
      });
      return await this.cartItemRepository.updateIfOwned(buyerId, cartItem);
    }
    return null;
  }

  /**
   * Create a new cart item
   * Make sure the cart belongs to this user before create cart item!
   */
  async createIfOwned(
    buyerId: string,
    dto: CreateCartItemDto,
  ): Promise<CartItem> {
    const cartItem = new CartItem({
      id: '',
      ...dto,
    });
    return this.cartItemRepository.createIfOwned(buyerId, cartItem);
  }

  /**
   * Remove a cart item
   */
  async removeIfOwned(
    buyerId: string,
    cartId: string,
    itemId: string,
  ): Promise<CartItem> {
    return this.cartItemRepository.removeIfOwned(buyerId, cartId, itemId);
  }
}
