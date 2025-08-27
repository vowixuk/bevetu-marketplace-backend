import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ProductCode } from './type';

export class CreatelistingSubscriptionPaymentLinkDto {
  @ApiProperty({
    description: 'The subscription plan code for the listing.',
    example: ProductCode.GOLD_MONTHLY_USD,
    enum: ProductCode,
  })
  @IsEnum(ProductCode, { message: 'Invalid product code' })
  productCode: ProductCode;

  @ApiProperty({
    description: 'Optional promotion code for applying discounts.',
    example: 'SUMMER2025',
    required: false,
  })
  @IsString()
  @IsOptional()
  promotionCode?: string;
}
