import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FindAllProfilesByShippingIdDto {
  @ApiProperty({
    description:
      'The unique identifier of the seller shipping to fetch profiles for.',
    example: 'ship_123456789',
  })
  @IsString({ message: 'shippingId must be a string' })
  shippingId: string;
}
