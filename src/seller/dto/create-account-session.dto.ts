import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class CreateAccountSessionDto {
  @ApiProperty({
    description: 'The unique identifier of the account.',
    example: 'acct_1GqIC8LY0qyl6XeW',
    pattern: '^[a-zA-Z0-9_]*$',
  })
  @IsString()
  @Matches(/^[a-zA-Z0-9_]*$/, { message: 'Invalid account ID format' })
  accountId: string;
}
