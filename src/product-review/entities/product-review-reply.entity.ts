import { OptionalProperties } from '../../share/types';

/** Reply by seller */
export class ProductReviewReply {
  id: string;
  reviewId: string;
  sellerId: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    init: Omit<ProductReviewReply, OptionalProperties<ProductReviewReply>> &
      Partial<Pick<ProductReviewReply, OptionalProperties<ProductReviewReply>>>,
  ) {
    Object.assign(this, init);
  }
}
