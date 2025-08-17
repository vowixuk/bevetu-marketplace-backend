import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ProductReviewReplyRepository } from '../repositories/review-reply.repositories';
import { ProductReviewReply } from '../entities/product-review-reply.entity';
import { CreateProductReviewReplyDto } from '../dto/create-product-review-reply.dto';

@Injectable()
export class ProductReviewReplyService {
  constructor(
    private readonly productReviewReplyRepository: ProductReviewReplyRepository,
  ) {}

  async create(
    createDto: CreateProductReviewReplyDto,
  ): Promise<ProductReviewReply> {
    const reply = new ProductReviewReply({
      id: '',
      reviewId: createDto.reviewId,
      sellerId: createDto.sellerId,
      message: createDto.message,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.productReviewReplyRepository.create(reply);
  }

  async findOne(id: string): Promise<ProductReviewReply> {
    const reply = await this.productReviewReplyRepository.findOne(id);
    if (!reply) throw new NotFoundException('Reply not found');
    return reply;
  }

  async findByReviewId(reviewId: string): Promise<ProductReviewReply> {
    const reply =
      await this.productReviewReplyRepository.findByReviewId(reviewId);
    if (!reply) throw new NotFoundException('Reply not found for this review');
    return reply;
  }

  //   async update(
  //     updateDto: UpdateProductReviewReplyDto,
  //     sellerId: string,
  //   ): Promise<ProductReviewReply> {
  //     const existingReply = await this.findOne(updateDto.id);

  //     if (existingReply.sellerId !== sellerId) {
  //       throw new ForbiddenException(
  //         'You cannot update a reply that does not belong to you',
  //       );
  //     }

  //     const updatedReply = new ProductReviewReply({
  //       ...existingReply,
  //       message: updateDto.message ?? existingReply.message,
  //       updatedAt: new Date(),
  //     });

  //     return this.productReviewReplyRepository.update(updatedReply);
  //   }

  async remove(id: string, sellerId: string): Promise<ProductReviewReply> {
    const existingReply = await this.findOne(id);

    if (existingReply.sellerId !== sellerId) {
      throw new ForbiddenException(
        'You cannot delete a reply that does not belong to you',
      );
    }

    return this.productReviewReplyRepository.remove(id);
  }
}
