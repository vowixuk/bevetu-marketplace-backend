import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
export class BuyerViewOneDto {
  @ApiProperty({
    description: 'Order Id',
    required: true,
    example: 'orderId-123-d-3--af-a-adfasdf',
    type: String,
  })
  @IsString()
  orderId: string;
}
