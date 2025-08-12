import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class CreateSellerConnectAccountDto {
  @ApiProperty({
    description:
      'The country code of the seller’s connect account (ISO 3166-1 alpha-2).',
    example: 'US',
    pattern: '^[A-Z]{2}$',
  })
  @IsString()
  @Matches(/^[A-Z]{2}$/, {
    message: 'Country must be a 2-letter ISO country code (uppercase).',
  })
  country: string;

  @ApiProperty({
    description:
      'The default currency for the seller’s connect account (ISO 4217).',
    example: 'USD',
    pattern: '^[A-Z]{3}$',
  })
  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message:
      'Default currency must be a 3-letter ISO currency code (uppercase).',
  })
  defaultCurrency: string;
}
