import { Injectable, NotFoundException } from '@nestjs/common';
import { CartRepository } from '../repositories/cart.repository';
import { CartItemService } from './cart-item.service';
import { Cart } from '../entities/cart.entity';
import { ProductService } from '../../product/product.services';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly cartItemService: CartItemService,
    private readonly productService: ProductService,
  ) {}

  /**
   * Create a new cart
   */
  async create(buyerId: string): Promise<Cart> {
    const cart = new Cart({
      id: '',
      buyerId,
      isCheckout: false,
      items: [],
      createdAt: new Date(),
    });
    return this.cartRepository.create(cart);
  }

  /**
   * Find the active (unchecked-out) cart for the user;
   * create one if none exists.
   */
  async findOrCreateUncheckoutCart(buyerId: string): Promise<Cart> {
    const cart = await this.cartRepository.findUncheckoutOneByUserId(buyerId);
    if (!cart) {
      return await this.create(buyerId);
    }
    return cart;
  }

  /**
   * Get cart by ID
   */
  async findOneIfOwned(buyerId: string, cartId: string): Promise<Cart | null> {
    const cart = await this.cartRepository.findOneIfOwned(buyerId, cartId);
    return cart;
  }

  /**
   * Checkout the cart
   */
  async setCheckoutDone(
    buyerId: string,
    cartId: string,
    orderId?: string,
  ): Promise<Cart> {
    const cart = await this.findOneIfOwned(buyerId, cartId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    cart.isCheckout = true;
    cart.orderId = orderId ?? undefined;
    return this.cartRepository.update(cart);
  }
}
