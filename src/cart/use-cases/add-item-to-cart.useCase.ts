import { ProductService } from '../../product/product.services';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Cart } from '../entities/cart.entity';

import { AddItemToCartDto } from '../dto/add-item-to-cart.dto';
import { CartItemService } from '../services/cart-item.service';
import { CreateCartItemDto } from '../dto/create-cart-item.dto';
import { CartService } from '../services/cart.service';

@Injectable()
export class AddItemToCartUseCase {
  constructor(
    private productService: ProductService,
    private cartItemService: CartItemService,
    private cartService: CartService,
  ) {}

  async execute(buyerId: string, dto: AddItemToCartDto): Promise<Cart> {
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

    await this.cartItemService.createIfOwned(
      buyerId,
      Object.assign(new CreateCartItemDto(), {
        shopId: product.shopId,
        cartId: dto.cartId,
        productId: product.id,
        productName: product.name,
        quantity: dto.quantity,
        price: product.price,
        available: true,
      }),
    );

    return (await this.cartService.findOneIfOwned(buyerId, dto.cartId)) as Cart;
  }
}
