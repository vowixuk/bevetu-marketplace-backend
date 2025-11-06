import { Module } from '@nestjs/common';

import { CartController } from './cart.controller';
import { CartService } from './services/cart.service';
import { CartRepository } from './repositories/cart.repository';
import { CartItemService } from './services/cart-item.service';
import { CartItemRepository } from './repositories/cart-item.repository';
import { ProductModule } from '../product/product.module';
import { CheckItemsAvailabilityUseCase } from './use-cases/check-items-availability.useCase';

@Module({
  imports: [ProductModule],
  controllers: [CartController],
  providers: [
    CartService,
    CartRepository,
    CartItemService,
    CartItemRepository,
    CheckItemsAvailabilityUseCase,
  ],
  exports: [CartService, CartItemService, CheckItemsAvailabilityUseCase],
})
export class CartModule {}
