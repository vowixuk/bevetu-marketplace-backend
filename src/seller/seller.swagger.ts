import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CreateSellerConnectAccountDto } from './dto/create-seller-connected-account.dto';
import { CreateAccountSchema, CreateAccountSessionSchema } from './seller.type';
import { CreateAccountSessionDto } from './dto/create-account-session.dto';

export function ApiCreateSellerAccount() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create Seller Account',
      description: 'Create seller acocount in Stripe and in Bevetu',
      tags: ['Seller'],
      deprecated: false,
    }),
    ApiBody({
      type: CreateSellerConnectAccountDto,
    }),
    ApiResponse({
      status: 201,
      description: 'Seller account uccessfully created.',
      schema: {
        example: {
          stripeAccountId: 'act_afasdfj71299123',
        } as CreateAccountSchema,
      },
    }),
  );
}

export function ApiCreateAccountSession() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create Seller Account Session for extracting UI from Stripe',
      description:
        'Generates a Stripe seller onboarding session for frontend integration.',
      tags: ['Seller'],
      deprecated: false,
    }),
    ApiBody({
      type: CreateAccountSessionDto,
      description:
        'Payload containing the account ID to create the session for.',
    }),
    ApiResponse({
      status: 200,
      description: 'Stripe client secret for the seller account session.',
      schema: {
        example: {
          client_secret: 'aasdfsdfasdfas_afasdfj71299123',
        } as CreateAccountSessionSchema,
      },
    }),
  );
}

export function ApiViewSellerStripeAccountId() {
  return applyDecorators(
    ApiOperation({
      summary: 'View Seller Stripe Account Id',
      description: 'View Seller Stripe Account Id',
      tags: ['Seller'],
      deprecated: false,
    }),
    ApiBody({
      type: CreateSellerConnectAccountDto,
    }),
    ApiResponse({
      status: 200,
      description: '',
      schema: {
        example: {
          stripeAccountId: 'act_afasdfj71299123',
        } as CreateAccountSchema,
      },
    }),
  );
}

export function ApiCheckIsSellerFullyOnBoarded() {
  return applyDecorators(
    ApiOperation({
      summary: 'Check if seller has completed Stripe onboarding',
      description:
        'Verifies whether the seller’s Stripe Connected Account has satisfied all currently required onboarding requirements, has no overdue items, and is fully enabled to process charges and payouts.',
      tags: ['Seller'],
      deprecated: false,
    }),
    ApiResponse({
      status: 200,
      description:
        'Returns true if the seller is fully onboarded and enabled; otherwise returns false.',
      schema: {
        example: true,
      },
    }),
  );
}
