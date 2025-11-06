import { ProductService } from 'src/product/product.services';
import { CartItemService } from '../services/cart-item.service';
import { CartService } from '../services/cart.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from 'src/product/entities/product.entity';
import { CartItem } from '../entities/cart-item.entity';
import { Cart } from '../entities/cart.entity';

@Injectable()
export class CheckItemsAvailabilityUseCase {
  constructor(
    private productService: ProductService,
    private cartItemService: CartItemService,
    private cartService: CartService,
  ) {}

  async execute(buyerId: string, cartId: string): Promise<Cart> {
    /* Step 1 – Retrieve all items in the cart */
    const cart = await this.cartService.findOneIfOwned(buyerId, cartId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    /*
     * Step 2 – Validate each cart item against the product data:
     *   - Remove items that are out of stock or no longer available for sale
     */

    const productIdItemIdMapping = Object.fromEntries(
      cart.items.map((item) => [item.productId, item]),
    );

    const products = await this.productService.findByIds(
      Object.keys(productIdItemIdMapping),
    );

    const cartItemsToUpdate: CartItem[] = [];

    for (const product of products) {
      const { isAvailable, reason } = this.checkProductAvailability(product);

      let updateRequired = false;
      const cartItem = productIdItemIdMapping[product.id];

      // Update the status of cart item
      if (!isAvailable) {
        cartItem.available = false;
        cartItem.unavailableReason = reason;
        updateRequired = true;
      }

      // Update the name and price
      if (
        product.name !== cartItem.productName ||
        product.price !== cartItem.price
      ) {
        cartItem.productName = product.name;
        cartItem.price = product.price;
        updateRequired = true;
      }

      if (updateRequired) {
        cartItemsToUpdate.push(cartItem);
      }
    }

    if (cartItemsToUpdate.length > 0) {
      await this.cartItemService.updateMany(cartItemsToUpdate);
    }

    return (await this.cartService.findOneIfOwned(buyerId, cartId)) as Cart;
  }

  checkProductAvailability(product: Product): {
    isAvailable: boolean;
    reason?: string;
  } {
    try {
      if (!product.isApproved)
        return { isAvailable: false, reason: 'Product offshelf' };
      if (!product.onShelf)
        return { isAvailable: false, reason: 'Product offshelf' };
      if (product.stock === 0)
        return { isAvailable: false, reason: 'Out of stock' };

      return { isAvailable: true };
    } catch {
      return { isAvailable: false, reason: 'Product not found' };
    }
  }
}
