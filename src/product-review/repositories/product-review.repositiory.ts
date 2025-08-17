import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ProductReview } from '../entities/product-review.entity';
import {
  ProductReview as PrismaProductReview,
  ProductReviewReply as PrismaProductReviewReply,
} from '@prisma/client';

@Injectable()
export class ProductReviewRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create(review: ProductReview): Promise<ProductReview> {
    return mapPrismaProductReviewToDomain(
      await this.prisma.productReview.create({
        data: {
          productId: review.productId,
          userId: review.userId,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          isVerifiedPurchase: review.isVerifiedPurchase ?? false,
          helpfulCount: review.helpfulCount ?? 0,
          reported: review.reported ?? false,
          createdAt: review.createdAt ?? new Date(),
        },
        include: { reply: true },
      }),
    ) as ProductReview;
  }

  async findOne(id: string): Promise<ProductReview | null> {
    return mapPrismaProductReviewToDomain(
      await this.prisma.productReview.findUnique({ where: { id } }),
    );
  }

  async findByProductId(productId: string): Promise<ProductReview[]> {
    const reviews = await this.prisma.productReview.findMany({
      where: { productId },
      include: { reply: true },
    });
    return reviews.map(mapPrismaProductReviewToDomain) as ProductReview[];
  }

  async findByUserId(userId: string): Promise<ProductReview[]> {
    const reviews = await this.prisma.productReview.findMany({
      where: { userId },
      include: { reply: true },
    });
    return reviews.map(mapPrismaProductReviewToDomain) as ProductReview[];
  }

  async update(review: ProductReview): Promise<ProductReview> {
    return mapPrismaProductReviewToDomain(
      await this.prisma.productReview.update({
        where: { id: review.id },
        include: { reply: true },
        data: {
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          isVerifiedPurchase: review.isVerifiedPurchase,
          helpfulCount: review.helpfulCount,
          reported: review.reported,
          updatedAt: new Date(),
        },
      }),
    ) as ProductReview;
  }

  async remove(id: string): Promise<ProductReview> {
    return mapPrismaProductReviewToDomain(
      await this.prisma.productReview.delete({ where: { id } }),
    ) as ProductReview;
  }
}

/**
 * Map Prisma ProductReview model to domain ProductReview entity.
 */
export function mapPrismaProductReviewToDomain(
  prismaReview?:
    | (PrismaProductReview & {
        reply?: PrismaProductReviewReply | null;
      })
    | null,
): ProductReview | null {
  if (!prismaReview) return null;

  return new ProductReview({
    id: prismaReview.id,
    productId: prismaReview.productId,
    userId: prismaReview.userId,
    rating: prismaReview.rating,
    title: prismaReview.title,
    comment: prismaReview.comment ?? undefined,
    isVerifiedPurchase: prismaReview.isVerifiedPurchase,
    helpfulCount: prismaReview.helpfulCount,
    reported: prismaReview.reported,
    createdAt: prismaReview.createdAt,
    updatedAt: prismaReview.updatedAt,
    productReviewReply: prismaReview.reply ?? undefined,
  });
}
