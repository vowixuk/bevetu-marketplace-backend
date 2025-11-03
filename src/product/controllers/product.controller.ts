import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ViewProductsDto } from '../dto';

import { ViewFilteredProductReturnSchema } from '../product.type';

import { ApiViewFilteredProducts } from '../product.swagger';

import { ProductService } from '../product.services';

@ApiTags('Product')
@Controller({ path: 'products', version: '1' })
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiViewFilteredProducts()
  async viewFilteredProducts(
    @Query() dto: ViewProductsDto,
  ): Promise<ViewFilteredProductReturnSchema> {
    return await this.productService.filterProductsForBuyerSide(dto);
  }
}
