import { Module } from '@nestjs/common';

import { ProductSellerController } from './controllers/product.seller.controller';
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
import { ProductController } from './controllers/product.controller';

@Module({
  imports: [EventEmitterModule, ShopModule, SubscriptionModule, StripeModule],
  controllers: [ProductSellerController, ProductController],
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
