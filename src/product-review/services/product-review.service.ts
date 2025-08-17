import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ProductReviewRepository } from '../repositories/product-review.repositiory';
import { ProductReview } from '../entities/product-review.entity';
import { CreateProductReviewDto } from '../dto/create-product-review.dto';
import { UpdateProductReviewDto } from '../dto/update-product-review.dto';

@Injectable()
export class ProductReviewService {
  constructor(
    private readonly productReviewRepository: ProductReviewRepository,
  ) {}

  async create(
    productId: string,
    userId: string,
    createDto: CreateProductReviewDto,
  ): Promise<ProductReview> {
    const review = new ProductReview({
      id: '',
      productId,
      userId,
      rating: createDto.rating,
      title: createDto.title,
      comment: createDto.comment,
      isVerifiedPurchase: createDto.isVerifiedPurchase ?? false,
      helpfulCount: 0,
      reported: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.productReviewRepository.create(review);
  }

  async findOne(id: string): Promise<ProductReview> {
    const review = await this.productReviewRepository.findOne(id);
    if (!review) throw new NotFoundException('Product review not found');
    return review;
  }

  async findByProductId(productId: string): Promise<ProductReview[]> {
    return this.productReviewRepository.findByProductId(productId);
  }

  async findByUserId(userId: string): Promise<ProductReview[]> {
    return this.productReviewRepository.findByUserId(userId);
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateProductReviewDto,
  ): Promise<ProductReview> {
    const existingReview = await this.findOne(id);

    if (existingReview.userId !== userId) {
      throw new ForbiddenException('You cannot update this review');
    }

    const updatedReview = new ProductReview({
      ...existingReview,
      ...updateDto,
      updatedAt: new Date(),
    });

    return this.productReviewRepository.update(updatedReview);
  }

  async remove(userId: string, id: string): Promise<ProductReview> {
    const review = await this.findOne(id);

    if (review.userId !== userId) {
      throw new ForbiddenException('You cannot delete this review');
    }

    return this.productReviewRepository.remove(id);
  }
}
