import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductReviewService } from './services/product-review.service';

@Controller('product-review')
export class ProductReviewController {
  constructor(private readonly productReviewService: ProductReviewService) {}

  // @Post()
  // create(@Body() createProductReviewDto: CreateProductReviewDto) {
  //   return this.productReviewService.create(createProductReviewDto);
  // }

  // @Get()
  // findAll() {
  //   return this.productReviewService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.productReviewService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateProductReviewDto: UpdateProductReviewDto) {
  //   return this.productReviewService.update(+id, updateProductReviewDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.productReviewService.remove(+id);
  // }
}
