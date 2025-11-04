import { ProductService } from 'src/product/product.services';
import { CartItemService } from '../services/cart-item.service';
import { CartService } from '../services/cart.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { Product } from 'src/product/entities/product.entity';

@Injectable()
export class CheckItemsAvailability {
  constructor(
    private productService: ProductService,
    private cartItemService: CartItemService,
    private cartService: CartService,
  ) {}

  async execute(buyerId: string, cartId: string) {
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
      cart.items.map((item) => [item.productId, item.id]),
    );

    const products = await this.productService.findByIds(
      Object.keys(productIdItemIdMapping),
    );

    for (const product of products) {
      const { isAvailable, reason } = this.checkProductAvailability(product);

      if (!isAvailable) {
        await this.cartItemService.updateIfOwned(
          buyerId,
          productIdItemIdMapping[product.id],
          Object.assign(new UpdateCartItemDto(), {
            available: false,
            unavailableReason: reason,
          }),
        );
      }
    }
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
