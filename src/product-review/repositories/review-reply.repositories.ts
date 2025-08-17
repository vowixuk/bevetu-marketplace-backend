import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ProductReviewReply } from '../entities/product-review-reply.entity';
import { ProductReviewReply as PrismaProductReviewReply } from '@prisma/client';

@Injectable()
export class ProductReviewReplyRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create(reply: ProductReviewReply): Promise<ProductReviewReply> {
    return mapPrismaProductReviewReplyToDomain(
      await this.prisma.productReviewReply.create({
        data: {
          reviewId: reply.reviewId,
          sellerId: reply.sellerId,
          message: reply.message,
          createdAt: reply.createdAt ?? new Date(),
        },
      }),
    ) as ProductReviewReply;
  }

  async findOne(id: string): Promise<ProductReviewReply | null> {
    return mapPrismaProductReviewReplyToDomain(
      await this.prisma.productReviewReply.findUnique({ where: { id } }),
    );
  }

  async findByReviewId(reviewId: string): Promise<ProductReviewReply | null> {
    return mapPrismaProductReviewReplyToDomain(
      await this.prisma.productReviewReply.findUnique({ where: { reviewId } }),
    );
  }

  async update(reply: ProductReviewReply): Promise<ProductReviewReply> {
    return mapPrismaProductReviewReplyToDomain(
      await this.prisma.productReviewReply.update({
        where: { id: reply.id },
        data: {
          message: reply.message,
          updatedAt: new Date(),
        },
      }),
    ) as ProductReviewReply;
  }

  async remove(id: string): Promise<ProductReviewReply> {
    return mapPrismaProductReviewReplyToDomain(
      await this.prisma.productReviewReply.delete({ where: { id } }),
    ) as ProductReviewReply;
  }
}

/**
 * Map Prisma ProductReviewReply model to domain ProductReviewReply entity.
 */
export function mapPrismaProductReviewReplyToDomain(
  prismaReply?: PrismaProductReviewReply | null,
): ProductReviewReply | null {
  if (!prismaReply) return null;

  return new ProductReviewReply({
    id: prismaReply.id,
    reviewId: prismaReply.reviewId,
    sellerId: prismaReply.sellerId,
    message: prismaReply.message,
    createdAt: prismaReply.createdAt,
    updatedAt: prismaReply.updatedAt,
  });
}
