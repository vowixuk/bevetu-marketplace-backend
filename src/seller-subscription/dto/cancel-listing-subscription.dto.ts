import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CancelListingSubscriptionDto {
  @ApiProperty({
    description:
      'The reason provided by the seller for cancelling the subscription.',
    example: 'Switching to another platform',
  })
  @IsString()
  cancelReason: string;
}
