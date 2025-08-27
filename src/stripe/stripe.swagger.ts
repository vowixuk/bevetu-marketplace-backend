import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ViewStripeSubscriptionReturnSchema } from './stripe.type';
import { AdvanceTestClockDto } from './dto/advance-test-clock.dto';

export function ApiViewStripeSubscription() {
  return applyDecorators(
    ApiOperation({
      summary: 'View Stripe subscription',
      description:
        'Retrieves the details of a Stripe subscription for the seller, including customer ID, subscription item, amount, currency, quantity, and metadata.',
      tags: ['Stripe'],
      deprecated: false,
    }),
    ApiResponse({
      status: 200,
      description: 'Stripe subscription details retrieved successfully.',
      schema: {
        example: {
          stripeCustomerId: 'cus_123456789',
          stripeSubscriptionId: 'sub_123456789',
          stripeSubscriptionItemId: 'si_123456789',
          amount: 2999,
          currency: 'usd',
          quantity: 1,
          metadata: {
            plan: 'GOLD_MONTHLY_USD',
            promoCode: 'SUMMER21',
          },
        } as ViewStripeSubscriptionReturnSchema,
      },
    }),
  );
}

export function ApiDeleteStripeCustomer() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete a Stripe customer',
      description:
        'Deletes the Stripe customer associated with the seller. ' +
        'Once deleted, all associated subscriptions and payment methods are removed.',
      tags: ['Stripe'],
      deprecated: false,
    }),
    ApiResponse({
      status: 200,
      description: 'Stripe customer successfully deleted.',
      schema: {
        example: {
          message: 'deleted',
        },
      },
    }),
  );
}

export function ApiDeleteSubscriptionInStripe() {
  return applyDecorators(
    ApiOperation({
      summary: 'Immediately delete a Stripe subscription',
      description:
        'Permanently deletes a Stripe subscription associated with the seller. ' +
        'All future billing for this subscription will be stopped immediately, ' +
        'and the subscription cannot be restored.',
      tags: ['Stripe'],
      deprecated: false,
    }),
    ApiResponse({
      status: 200,
      description: 'Stripe subscription successfully deleted.',
      schema: {
        example: {
          message: 'deleted',
        },
      },
    }),
  );
}



export function ApiAdvanceTestClock() {
  return applyDecorators(
    ApiOperation({
      summary: 'Advance the Stripe test clock',
      description:
        'Advances a Stripe test clock by a specified number of days. ' +
        'Used to simulate time-based events in testing environments.',
      tags: ['Stripe'],
      deprecated: false,
    }),
    ApiBody({
      type: AdvanceTestClockDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Test clock advanced successfully.',
      schema: {
        example: {
          testClockId: 'clock_123456789',
          advanceDay: 5,
        } as AdvanceTestClockDto,
      },
    }),
  );
}

export function ApiHealthCheck() {
  return applyDecorators(
    ApiOperation({
      summary: 'Health check for webhook status',
      description:
        'This endpoint verifies that the Stripe webhook is up and running. It checks the connectivity and listens for events.',
      tags: ['Stripe Webhook'],
      deprecated: false,
    }),

    ApiResponse({
      status: 200,
      description:
        'The webhook is successfully running and listening for events.',
      schema: {
        example: 'Webhook is listening',
      },
    }),
  );
}

export function ApiWebhookListener() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listen to Stripe webhook events',
      description:
        'This endpoint listens for incoming events from Stripe. It processes webhook notifications related to subscriptions and other events triggered by Stripe.',
      tags: ['Stripe Webhook'],
      deprecated: false,
    }),

    ApiResponse({
      status: 200,
      description:
        'The webhook is successfully running and listening for events.',
      schema: {
        example: 'Webhook is listening',
      },
    }),
  );
}
