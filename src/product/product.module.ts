import { Module } from '@nestjs/common';

import { ProductController } from './product.controller';
import { ProductService } from './product.services';
import { ProductRepository } from './product.repository';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ShopModule } from '../shop/shop.module';
import { SubscriptionModule } from '../seller-subscription/sellerSubscription.module';
import { StripeModule } from '../stripe/stripe.module';

import {
  CreateProductUseCase,
  SetProductOnShelfUseCase,
  UpdateProductUseCase,
  ViewProductListUseCase,
  ResetProductOnShelfUseCase,
  SellerViewProductUseCase,
  DeleteProductUseCase,
} from './use-cases/seller';

@Module({
  imports: [EventEmitterModule, ShopModule, SubscriptionModule, StripeModule],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductRepository,
    CreateProductUseCase,
    SetProductOnShelfUseCase,
    UpdateProductUseCase,
    ViewProductListUseCase,
    ResetProductOnShelfUseCase,
    SellerViewProductUseCase,
    DeleteProductUseCase,
  ],
  exports: [
    ProductService,
    ProductRepository,
    CreateProductUseCase,
    SetProductOnShelfUseCase,
    UpdateProductUseCase,
    ViewProductListUseCase,
    ResetProductOnShelfUseCase,
    SellerViewProductUseCase,
    DeleteProductUseCase,
  ],
})
export class ProductModule {}
