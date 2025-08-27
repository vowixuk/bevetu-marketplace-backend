import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdvanceTestClockDto {
  @ApiProperty({
    description: 'The ID of the Stripe test clock to advance.',
    example: 'clock_123456789',
  })
  @IsString()
  @IsNotEmpty()
  testClockId: string;

  @ApiProperty({
    description: 'The number of days to advance the test clock.',
    example: 5,
    minimum: 1,
  })
  @IsNumber()
  @Min(1, { message: 'advanceDay must be at least 1' })
  advanceDay: number;
}
