import { Module } from '@nestjs/common';

import { ProductController } from './product.controller';
import { ProductService } from './product.services';
import { ProductRepository } from './product.repository';
import { CreateProductUseCase } from './use-cases/seller/create-product.useCase';
import { SetProductOnShelfUseCase } from './use-cases/seller/set-product-on-shelf.useCase';
import { UpdateProductUseCase } from './use-cases/seller/update-product.useCase';
import { ViewProductListUseCase } from './use-cases/seller/view-product-list.useCase';

@Module({
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductRepository,
    CreateProductUseCase,
    SetProductOnShelfUseCase,
    UpdateProductUseCase,
    ViewProductListUseCase,
  ],
  exports: [
    ProductService,
    CreateProductUseCase,
    SetProductOnShelfUseCase,
    UpdateProductUseCase,
    ViewProductListUseCase,
  ],
})
export class ProductModule {}
