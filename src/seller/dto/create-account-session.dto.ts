import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, Matches } from 'class-validator';
import stripeConnectUiSessionKeys from 'src/stripe/entities/stripe-connect-ui-session-keys.vo';

export type StripeSessionKeys = (typeof stripeConnectUiSessionKeys)[number];

export class CreateAccountSessionDto {
  @ApiProperty({
    description: 'The unique identifier of the account.',
    example: 'acct_1GqIC8LY0qyl6XeW',
    pattern: '^[a-zA-Z0-9_]*$',
  })
  @IsString()
  @Matches(/^[a-zA-Z0-9_]*$/, { message: 'Invalid account ID format' })
  accountId: string;

  @ApiProperty({
    description: 'The Stripe embedded session component to create.',
    example: 'createPayoutsSession',
    enum: stripeConnectUiSessionKeys,
  })
  @IsString()
  @IsIn(stripeConnectUiSessionKeys, {
    message: 'Invalid Stripe session method',
  })
  sessionMethod: StripeSessionKeys;
}
