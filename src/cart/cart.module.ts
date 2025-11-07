import { Module } from '@nestjs/common';

import { CartController } from './cart.controller';
import { CartService } from './services/cart.service';
import { CartRepository } from './repositories/cart.repository';
import { CartItemService } from './services/cart-item.service';
import { CartItemRepository } from './repositories/cart-item.repository';
import { ProductModule } from '../product/product.module';
import { CheckItemsAvailabilityUseCase } from './use-cases/check-items-availability.useCase';
import { CalculateShippingFeeUseCase } from './use-cases/calculate-shipping-fee.useCase';
import { AddItemToCartUseCase } from './use-cases/add-item-to-cart.useCase';
import { UpdateItemQtyInCartUseCase } from './use-cases/update-item-qty-in-cart.useCase';

@Module({
  imports: [ProductModule],
  controllers: [CartController],
  providers: [
    CartService,
    CartRepository,
    CartItemService,
    CartItemRepository,
    CheckItemsAvailabilityUseCase,
    CalculateShippingFeeUseCase,
    AddItemToCartUseCase,
    UpdateItemQtyInCartUseCase,
  ],
  exports: [
    CartService,
    CartItemService,
    CheckItemsAvailabilityUseCase,
    CalculateShippingFeeUseCase,
    AddItemToCartUseCase,
    UpdateItemQtyInCartUseCase,
  ],
})
export class CartModule {}
