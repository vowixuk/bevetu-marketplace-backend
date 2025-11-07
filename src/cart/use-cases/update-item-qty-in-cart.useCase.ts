import { ProductService } from '../../product/product.services';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Cart } from '../entities/cart.entity';

import { CartItemService } from '../services/cart-item.service';

import { CartService } from '../services/cart.service';
import { UpdateItemQtyInCartDto } from '../dto/update-item-qty-in-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';

@Injectable()
export class UpdateItemQtyInCartUseCase {
  constructor(
    private productService: ProductService,
    private cartItemService: CartItemService,
    private cartService: CartService,
  ) {}

  async execute(buyerId: string, dto: UpdateItemQtyInCartDto): Promise<Cart> {
    const product = await this.productService.findOneValidForDisplay(
      dto.productId,
    );
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    if (dto.quantity > product.stock) {
      throw new BadRequestException(
        `Requested quantity (${dto.quantity}) exceeds available stock (${product.stock}).`,
      );
    }

    await this.cartItemService.updateIfOwned(
      buyerId,
      dto.cartItemId,
      Object.assign(new UpdateCartItemDto(), {
        shopId: product.shopId,
        quantity: dto.quantity,
      }),
    );

    return (await this.cartService.findOneIfOwned(buyerId, dto.cartId)) as Cart;
  }
}
