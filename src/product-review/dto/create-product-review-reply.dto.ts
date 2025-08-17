import { IsString, IsNotEmpty } from 'class-validator';

export class CreateProductReviewReplyDto {
  @IsString()
  @IsNotEmpty()
  reviewId: string; // Which review the reply is for

  @IsString()
  @IsNotEmpty()
  sellerId: string; // Seller writing the reply

  @IsString()
  @IsNotEmpty()
  message: string; // Reply content
}
