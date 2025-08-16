import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

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
