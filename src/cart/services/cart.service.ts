import { Injectable, NotFoundException } from '@nestjs/common';
import { CartRepository } from '../repositories/cart.repository';
import { CartItemService } from './cart-item.service';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly cartItemService: CartItemService,
  ) {}

  /**
   * Create a new cart
   */
  async create(userId: string): Promise<Cart> {
    const cart = new Cart({
      id: '', // let Prisma generate UUID
      userId,
      isCheckout: false,
      items: [],
      createdAt: new Date(),
    });

    return this.cartRepository.create(cart);
  }

  /**
   * Add an item to the cart
   */
  async addItem(cartId: string, item: Omit<CartItem, 'id'>): Promise<Cart> {
    // Ensure the cart exists
    const cart = await this.cartRepository.findOne(cartId);
    if (!cart) throw new NotFoundException('Cart not found');

    await this.cartItemService.create(cartId, item);

    return this.cartRepository.findOne(cartId) as Promise<Cart>;
  }

  /**
   * Get cart by ID
   */
  async findOne(cartId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne(cartId);
    if (!cart) throw new NotFoundException('Cart not found');
    return cart;
  }

  /**
   * Checkout the cart
   */
  async checkout(cartId: string, orderId: string): Promise<Cart> {
    const cart = await this.findOne(cartId);
    cart.isCheckout = true;
    cart.orderId = orderId;
    return this.cartRepository.update(cart);
  }

  /**
   * Remove an item from the cart
   */
  async removeItem(cartId: string, itemId: string): Promise<Cart> {
    await this.cartItemService.remove(itemId, cartId);

    // Reload cart with updated items
    return this.cartRepository.findOne(cartId) as Promise<Cart>;
  }
}
