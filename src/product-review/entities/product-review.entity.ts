import { ProductReviewReply } from '../entities/product-review-reply.entity';
import { OptionalProperties } from '../../share/types';

export class ProductReview {
  id: string;
  productId: string; // The product being reviewed
  userId: string; // Who wrote the review (customer id)

  rating: number; // Usually 1–5 stars
  title: string; // Short review title
  comment?: string; // Optional text feedback

  // Metadata
  createdAt: Date;
  updatedAt: Date;

  isVerifiedPurchase: boolean;
  helpfulCount: number;
  reported: boolean;

  // reply by seller
  productReviewReply?: ProductReviewReply;

  constructor(
    init: Omit<ProductReview, OptionalProperties<ProductReview>> &
      Partial<Pick<ProductReview, OptionalProperties<ProductReview>>>,
  ) {
    Object.assign(this, init);
  }
}
