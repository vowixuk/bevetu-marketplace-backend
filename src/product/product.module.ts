import { Module } from '@nestjs/common';

import { ProductController } from './product.controller';
import { ProductService } from './product.services';
import { ProductRepository } from './product.repository';
import { CreateProductUseCase } from './use-cases/seller/create-product.useCase';
import { SetProductOnShelfUseCase } from './use-cases/seller/set-product-on-shelf.useCase';
import { UpdateProductUseCase } from './use-cases/seller/update-product.useCase';
import { ViewProductListUseCase } from './use-cases/seller/view-product-list.useCase';
import { ResetProductOnShelfUseCase } from './use-cases/seller/reset-product-on-shelf.useCase';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ShopModule } from '../shop/shop.module';
import { SubscriptionModule } from '../seller-subscription/sellerSubscription.module';
import { StripeModule } from '../stripe/stripe.module';
import { SellerViewProductUseCase } from './use-cases/seller/seller-view-product.useCase';

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
  ],
  exports: [
    ProductService,
    CreateProductUseCase,
    SetProductOnShelfUseCase,
    UpdateProductUseCase,
    ViewProductListUseCase,
    ResetProductOnShelfUseCase,
  ],
})
export class ProductModule {}
