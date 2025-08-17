import { Module } from '@nestjs/common';
import { ProductReviewService } from './services/product-review.service';
import { ProductReviewController } from './product-review.controller';

@Module({
  controllers: [ProductReviewController],
  providers: [ProductReviewService],
})
export class ProductReviewModule {}
