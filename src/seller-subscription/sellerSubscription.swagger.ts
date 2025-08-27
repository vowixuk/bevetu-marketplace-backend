import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CreatelistingSubscriptionPaymentLinkDto } from './dto/create-listing-subscription-payment-link.dto';
import {
  CancelListingSubscriptionReturnSchema,
  CreatelistingSubscriptionPaymentLinkReturnSchema,
  DowngradeListingSubscriptionReturnSchema,
  PreviewProrationAmountkReturnSchema,
  RestoreListingSubscriptionReturnSchema,
  UpdateListingSubscriptionReturnSchema,
  ViewUserActiveSubscriptionReturnSchema,
} from './sellerSubscription.types';
import { PreviewProrationAmountDto } from './dto/preview-proration-amount.dto';
import { UpgradeListingSubscriptionDto } from './dto/upgrade-listing-subscription.dto';
import { CancelListingSubscriptionDto } from './dto/cancel-listing-subscription.dto';

export function ApiCreatelistingSubscriptionPaymentLink() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create Stripe Payment Link for listing subscription',
      description:
        'Generates a Stripe payment link for initiating a payment session for subscriptions or services.',
      tags: ['Seller Subscription'],
      deprecated: false,
    }),
    ApiBody({
      type: CreatelistingSubscriptionPaymentLinkDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Stripe payment link successfully created.',
      schema: {
        example: {
          paymentLink: 'https://payment-link',
        } as CreatelistingSubscriptionPaymentLinkReturnSchema,
      },
    }),
  );
}

export function ApiViewPreviewProrationAmount() {
  return applyDecorators(
    ApiOperation({
      summary: 'Preview subscription proration amount',
      description:
        'Calculates the proration amount when upgrading a subscription plan. ' +
        'If no subscription ID is provided internally, it will be resolved automatically. ' +
        'The response includes any charges or refunds due, along with updated billing cycle details.',
      tags: ['Seller Subscription'],
      deprecated: false,
    }),
    ApiQuery({
      type: PreviewProrationAmountDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Proration preview calculated successfully.',
      schema: {
        example: {
          prorationPeriod: {
            start: '2025-08-01T00:00:00.000Z',
            end: '2025-08-15T23:59:59.999Z',
          },
          nextPaymentPeriod: {
            start: '2025-08-16T00:00:00.000Z',
            end: '2025-09-15T23:59:59.999Z',
          },
          totalRefund: 5.0,
          totalCharge: 10.0,
          nextPaymentQty: 1,
          nextPaymentAmount: 20.0,
        } as unknown as PreviewProrationAmountkReturnSchema,
      },
    }),
  );
}

export function ApiUpgradeListingSubscription() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update subscription plan for product listing',
      description:
        'Updates the seller’s current listing subscription to a new plan. ' +
        'This may result in prorated charges or refunds, and will update the next billing period accordingly.',
      tags: ['Seller Subscription'],
      deprecated: false,
    }),
    ApiBody({
      type: UpgradeListingSubscriptionDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Listing subscription successfully updated.',
      schema: {
        example: {
          message: 'Subscription updated successfully.',
          productCode: 'GOLD_MONTHLY_USD',
          paidAt: '2025-08-27T12:34:56.000Z',
          totalRefund: 5.0,
          totalCharge: 20.0,
          nextPaymentDate: '2025-09-27T00:00:00.000Z',
          nextPaymentAmount: 30.0,
        } as unknown as UpdateListingSubscriptionReturnSchema,
      },
    }),
  );
}

export function ApiDowngradeListingSubscription() {
  return applyDecorators(
    ApiOperation({
      summary: 'Downgrade subscription plan for product listing',
      description:
        'Downgrades the seller’s current listing subscription to a lower plan. ' +
        'The downgrade takes effect from the next billing cycle, updating the upcoming payment date and amount.',
      tags: ['Seller Subscription'],
      deprecated: false,
    }),
    ApiBody({
      type: UpgradeListingSubscriptionDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Listing subscription successfully downgraded.',
      schema: {
        example: {
          message: 'Subscription downgraded successfully.',
          nextPaymentDate: '2025-09-27T00:00:00.000Z',
          nextPaymentAmount: 10.0,
        } as unknown as DowngradeListingSubscriptionReturnSchema,
      },
    }),
  );
}

export function ApiCancelListingSubscription() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cancel a listing subscription',
      description:
        'Cancels the active listing subscription for a seller. ' +
        'A cancellation reason must be provided, and the subscription will be marked to end at the specified cancellation date.',
      tags: ['Seller Subscription'],
      deprecated: false,
    }),
    ApiBody({
      type: CancelListingSubscriptionDto,
    }),
    ApiResponse({
      status: 200,
      description:
        'Listing subscription successfully scheduled for cancellation.',
      schema: {
        example: {
          subscriptionCancelAt: '2025-09-27T00:00:00.000Z',
        } as unknown as CancelListingSubscriptionReturnSchema,
      },
    }),
  );
}

export function ApiRestoreSubscription() {
  return applyDecorators(
    ApiOperation({
      summary: 'Restore a cancelled subscription',
      description:
        'Restores a previously cancelled listing subscription, reactivating billing and continuing from the next payment date. ' +
        'No request body is required — this operation applies to the seller’s current subscription context.',
      tags: ['Seller Subscription'],
      deprecated: false,
    }),
    ApiResponse({
      status: 200,
      description: 'Listing subscription successfully restored.',
      schema: {
        example: {
          message: 'Subscription restored successfully',
          nextPaymentDate: '2025-09-27T00:00:00.000Z',
          nextPaymentAmount: 29.99,
        } as unknown as RestoreListingSubscriptionReturnSchema,
      },
    }),
  );
}

export function ApiViewUserActiveSubscription() {
  return applyDecorators(
    ApiOperation({
      summary: 'View active subscription for the current user',
      description:
        'Retrieves the details of the currently active subscription for the authenticated seller. ' +
        'Includes billing dates, status, items, and optional event history. ' +
        'Sensitive identifiers such as `id` and `sellerId` are omitted in the response.',
      tags: ['Seller Subscription'],
      deprecated: false,
    }),
    ApiResponse({
      status: 200,
      description: 'Active subscription details retrieved successfully.',
      schema: {
        example: {
          nextPaymentDate: '2025-09-27T00:00:00.000Z',
          status: 'active',
          items: [
            {
              productCode: 'GOLD_MONTHLY_USD',
              quantity: 1,
            },
          ],
          createdAt: '2025-06-01T12:00:00.000Z',
          updatedAt: '2025-08-15T10:30:00.000Z',
          cancelAt: null,
          eventRecords: [
            {
              type: 'UPGRADE',
              createdAt: '2025-07-01T08:00:00.000Z',
            },
          ],
        } as unknown as ViewUserActiveSubscriptionReturnSchema,
      },
    }),
  );
}
