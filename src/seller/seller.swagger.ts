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
      summary: 'Create Seller Account Session',
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