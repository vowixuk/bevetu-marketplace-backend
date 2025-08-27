import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ProductCode } from './type';

export class UpgradeListingSubscriptionDto {
  @ApiProperty({
    description: 'The subscription plan code for the listing.',
    example: ProductCode.GOLD_MONTHLY_USD,
    enum: ProductCode,
  })
  @IsEnum(ProductCode, { message: 'Invalid product code' })
  productCode: ProductCode;
}
