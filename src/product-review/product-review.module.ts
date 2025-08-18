import { Module } from '@nestjs/common';
import { ProductReviewService } from './services/product-review.service';
import { ProductReviewController } from './product-review.controller';
import { ProductReviewRepository } from './repositories/product-review.repositiory';

@Module({
  controllers: [ProductReviewController],
  providers: [ProductReviewService, ProductReviewRepository],
})
export class ProductReviewModule {}
