import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean } from 'class-validator';

export class SetProductOnShelfDto {
  @ApiProperty({
    description:
      'Set to true if the product should be on shelf, false to hide it',
    example: true,
  })
  @IsBoolean({ message: 'isOnShelf must be a boolean' })
  @IsNotEmpty()
  isOnShelf: boolean;
}
