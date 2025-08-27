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
// export function ApiChangeSeatNo() {
//   return applyDecorators(
//     ApiOperation({
//       summary: 'Change the number of seats for a subscription',
//       description:
//         'This endpoint allows you to update the seat number for a given subscription.',
//       tags: ['Seller Subscription'],
//       deprecated: false,
//     }),
//     ApiBody({
//       type: UpdateSeatNumberDto,
//       description: 'Payload for updating the subscription seat number.',
//     }),
//     ApiResponse({
//       status: 200,
//       description: 'The seat number has been successfully updated.',
//       schema: {
//         example: {
//           nextPaymentAmount: 1000, // Example of the updated next payment amount
//           nextPaymentDate: new Date(), // Example of the updated next payment date
//         } as ChangeSeatNoReturnSchema,
//       },
//     }),
//   );
// }

// export function ApiCancelSubscription() {
//   return applyDecorators(
//     ApiOperation({
//       summary: 'Cancel a subscription',
//       description: `This endpoint allows a user to cancel their subscription. The subscription will remain active until the end of the current billing cycle, after which it will be canceled.`,
//       tags: ['Seller Subscription'],
//       deprecated: false,
//     }),
//     ApiBody({
//       type: CancelSubscriptionDto,
//       description: 'Payload for delete the subscription.',
//     }),
//     ApiResponse({
//       status: 200,
//       description:
//         'The subscription has been successfully canceled and will remain active until the end of the billing cycle.',
//       schema: {
//         example: {
//           subscriptionCancelAt: new Date(),
//         } as CancelSubscriptionReturnSchema,
//       },
//     }),
//   );
// }

// export function ApiRestoreSubscription() {
//   return applyDecorators(
//     ApiOperation({
//       summary: 'Restore the cancelling subscription',
//       description:
//         'This endpoint allows you to restore the cancelling subscription.',
//       tags: ['Seller Subscription'],
//       deprecated: false,
//     }),
//     ApiBody({
//       type: RestoreSubscriptionDto,
//       description: 'Payload for restore the subscription.',
//     }),
//     ApiResponse({
//       status: 200,
//       description: 'Successfully retrieved the list of available products.',
//       schema: {
//         example: {
//           nextPaymentAmount: 1000,
//           nextPaymentDate: new Date(),
//         } as RatestoreSubscriptionReturnSchema,
//       },
//     }),
//   );
// }

// export function ApiViewAllproducts() {
//   return applyDecorators(
//     ApiOperation({
//       summary: 'Retrieve all available products (excluding test products).',
//       description: `This endpoint allows you to retrieve all available products, excluding any test products.
//         Sensitive data, such as Stripe price IDs, will be excluded from the response.`,
//       tags: ['Seller Subscription'],
//       deprecated: false,
//     }),
//     ApiResponse({
//       status: 200,
//       description: 'The seat number has been successfully updated.',
//       schema: {
//         example: {
//           data: expectedProducts(false) as Record<IProductCode, IProduct>,
//         },
//       },
//     }),
//   );
// }

// export function ApiViewAllProductsIncludingTestProducts() {
//   return applyDecorators(
//     ApiOperation({
//       summary: 'Retrieve all available products, including test products.',
//       description: `
//         This endpoint allows fetching all available products, including test products,
//         for testing purposes. Sensitive data such as Stripe price IDs will be excluded
//         in the response. This endpoint is only accessible in a test environment.
//         If used outside the test environment, a 404 error will be returned.`,
//       tags: ['Seller Subscription'],
//       deprecated: false,
//     }),
//     ApiResponse({
//       status: 200,
//       description: 'Successfully retrieved the list of available products.',
//       schema: {
//         example: {
//           data: expectedProducts(true) as Record<IProductCode, IProduct>,
//         },
//       },
//     }),
//     ApiResponse({
//       status: 404,
//       description:
//         'Endpoint accessible only in test environment. Returns 404 in production.',
//     }),
//   );
// }

// export function ApiViewUserActiveSubscription() {
//   return applyDecorators(
//     ApiOperation({
//       summary:
//         'View the user’s current active subscription , including subscriptions marked for cancellation.',
//       description:
//         'This endpoint retrieves the active subscription of the authenticated user. It includes subscriptions that are currently active (`status = ACTIVE`) and those scheduled for cancellation (`status = PENDING_CANCEL`) but not yet expired.',
//       tags: ['Seller Subscription'],
//       deprecated: false,
//     }),
//     ApiResponse({
//       status: 200,
//       description: '',
//       schema: {
//         example: {
//           id: 'cm5wt0zuh0006qamox337pwev',
//           userId: 'cm5wt0kig0000qamo507tw5q3',
//           productCode: 'BVT_MONTHLY_GBP',
//           seatNo: 30,
//           nextPaymentDate: new Date(),
//           status: 'ACTIVE',
//           createdAt: new Date(),
//           eventRecords: [
//             {
//               id: 'cm5wthau1000aqat720861iab',
//               subscriptionId: 'cm5wthats0006qat71jhrd5yj',
//               createdAt: new Date(),
//               type: 'CREATE',
//               metadata: {
//                 productCode: 'BVT_MONTHLY_GBP',
//                 productMode: 'Monthly',
//                 productName: 'Bevetu Monthly Subscription (GBP)',
//               },
//             },
//             {
//               id: 'cm5wthau3000cqat7vjtwwgrr',
//               subscriptionId: 'cm5wthats0006qat71jhrd5yj',
//               createdAt: new Date(),
//               type: 'PAYMENT',
//               metadata: {
//                 amount: 80,
//                 seatNo: 10,
//                 currency: 'GBP',
//                 productMode: 'Monthly',
//                 nextPaymentDate: '2025-02-14T18:38:59.000Z',
//               },
//             },
//             {
//               id: 'cm5wthdr4000eqat7qkzv03d7',
//               subscriptionId: 'cm5wthats0006qat71jhrd5yj',
//               createdAt: new Date(),
//               type: 'SEAT_AMEND',
//               metadata: {
//                 amount: 240,
//                 newSeatNo: 30,
//                 effevtiveDate: '2025-01-14T18:39:19.264Z',
//                 previousSeatNo: 10,
//                 nextPaymentDate: '2025-02-14T18:38:59.000Z',
//               },
//             },
//             {
//               id: 'cm5wthdr7000gqat708la7jhs',
//               subscriptionId: 'cm5wthats0006qat71jhrd5yj',
//               createdAt: new Date(),
//               type: 'SEAT_AMEND_COMPLETE',
//               metadata: { newSeatNo: 30, previousSeatNo: 10 },
//             },
//           ],
//           updatedAt: new Date(),
//           cancelAt: null,
//         } as ViewUserActiveSubscriptionReturnSchema,
//       },
//     }),

//     ApiResponse({
//       status: 404,
//       description: 'No active subscription found for the user.',
//       schema: {
//         example: { message: 'Active subscription not found' },
//       },
//     }),
//   );
// }

// export function ApiViewUserRecentSubscription() {
//   return applyDecorators(
//     ApiOperation({
//       summary: 'View the user’s recent subscription',
//       description:
//         'This endpoint retrieves the recent subscription of the authenticated user regardless of its status',
//       tags: ['Seller Subscription'],
//       deprecated: false,
//     }),
//     ApiResponse({
//       status: 200,
//       description: '',
//       schema: {
//         example: {
//           id: 'cm5wt0zuh0006qamox337pwev',
//           userId: 'cm5wt0kig0000qamo507tw5q3',
//           productCode: 'BVT_MONTHLY_GBP',
//           seatNo: 30,
//           nextPaymentDate: new Date(),
//           status: 'ACTIVE',
//           createdAt: new Date(),
//           eventRecords: [
//             {
//               id: 'cm5wthau1000aqat720861iab',
//               subscriptionId: 'cm5wthats0006qat71jhrd5yj',
//               createdAt: new Date(),
//               type: 'CREATE',
//               metadata: {
//                 productCode: 'BVT_MONTHLY_GBP',
//                 productMode: 'Monthly',
//                 productName: 'Bevetu Monthly Subscription (GBP)',
//               },
//             },
//             {
//               id: 'cm5wthau3000cqat7vjtwwgrr',
//               subscriptionId: 'cm5wthats0006qat71jhrd5yj',
//               createdAt: new Date(),
//               type: 'PAYMENT',
//               metadata: {
//                 amount: 80,
//                 seatNo: 10,
//                 currency: 'GBP',
//                 productMode: 'Monthly',
//                 nextPaymentDate: '2025-02-14T18:38:59.000Z',
//               },
//             },
//             {
//               id: 'cm5wthdr4000eqat7qkzv03d7',
//               subscriptionId: 'cm5wthats0006qat71jhrd5yj',
//               createdAt: new Date(),
//               type: 'SEAT_AMEND',
//               metadata: {
//                 amount: 240,
//                 newSeatNo: 30,
//                 effevtiveDate: '2025-01-14T18:39:19.264Z',
//                 previousSeatNo: 10,
//                 nextPaymentDate: '2025-02-14T18:38:59.000Z',
//               },
//             },
//             {
//               id: 'cm5wthdr7000gqat708la7jhs',
//               subscriptionId: 'cm5wthats0006qat71jhrd5yj',
//               createdAt: new Date(),
//               type: 'SEAT_AMEND_COMPLETE',
//               metadata: { newSeatNo: 30, previousSeatNo: 10 },
//             },
//           ],
//           updatedAt: new Date(),
//           cancelAt: null,
//         } as ViewUserActiveSubscriptionReturnSchema,
//       },
//     }),

//     ApiResponse({
//       status: 404,
//       description: 'No active subscription found for the user.',
//       schema: {
//         example: { message: 'Active subscription not found' },
//       },
//     }),
//   );
// }

// export function ApiViewUserAllSubscriptions() {
//   return applyDecorators(
//     ApiOperation({
//       summary: 'View all subscriptions of the user',
//       description:
//         'This endpoint retrieves all subscriptions associated with the authenticated user, including: `ACTIVE`,`CANCELLING`,`CANCELLED`,`PAYMENT_FAILED`,`FREE_TRIAL_EXPIRED`',
//       tags: ['Seller Subscription'],
//       deprecated: false,
//     }),
//     ApiResponse({
//       status: 200,
//       description: '',
//       schema: {
//         example: [
//           {
//             id: 'cm5wt0zuh0006qamox337pwev',
//             userId: 'cm5wt0kig0000qamo507tw5q3',
//             productCode: 'BVT_MONTHLY_GBP',
//             seatNo: 30,
//             nextPaymentDate: '2025-01-20T00:00:00Z',
//             status: 'ACTIVE',
//             createdAt: '2024-12-20T00:00:00Z',
//             eventRecords: [
//               {
//                 id: 'cm5wthau1000aqat720861iab',
//                 subscriptionId: 'cm5wthats0006qat71jhrd5yj',
//                 createdAt: new Date(),
//                 type: 'CREATE',
//                 metadata: {
//                   productCode: 'BVT_MONTHLY_GBP',
//                   productMode: 'Monthly',
//                   productName: 'Bevetu Monthly Subscription (GBP)',
//                 },
//               },
//             ],
//             updatedAt: '2025-01-13T00:00:00Z',
//             cancelAt: null,
//           },
//           {
//             id: 'cm5wt1abc0007qamox445yzwx',
//             userId: 'cm5wt0kig0000qamo507tw5q3',
//             productCode: 'BVT_YEARLY_GBP',
//             seatNo: 50,
//             nextPaymentDate: '2024-12-31T00:00:00Z',
//             status: 'CANCELLED',
//             createdAt: '2023-12-31T00:00:00Z',
//             eventRecords: [],
//             updatedAt: '2024-12-01T00:00:00Z',
//             cancelAt: '2024-12-01T00:00:00Z',
//           },
//         ] as unknown as ViewUserAllSubscriptionsReturnSchema[],
//       },
//     }),
//     ApiResponse({
//       status: 404,
//       description: 'No subscriptions found for the user.',
//       schema: {
//         example: { message: 'Subscription not found' },
//       },
//     }),
//   );
// }

// export function ApiEnrollFreeTrial() {
//   return applyDecorators(
//     ApiOperation({
//       summary: 'Enroll free trial subscription',
//       description: 'Enroll a user in a free trial subscription.',
//       tags: ['Seller Subscription'],
//       deprecated: false,
//     }),
//     ApiResponse({
//       status: 200,
//       description:
//         'Returns the details of the enrolled free trial subscription.',
//       schema: {
//         example: {
//           id: 'ffff-fasdfasfjas-fasdfasdf', // Example free trial ID
//           freeTrialExpiryDate: '2025-12-31T23:59:59.999Z', // ISO date format
//         } as unknown as EnrollFreeTrialReturnSchema,
//       },
//     }),
//   );
// }

// export function ApiUpdate() {
//   return applyDecorators(
//     ApiOperation({
//       summary: 'Update subscription data (Test Use Only !)',
//       description:
//         'This endpoint is for testing purposes only. Do not use in production.',
//       tags: ['Seller Subscription'],
//       deprecated: false,
//     }),
//     ApiBody({
//       type: UpdateSubscriptionDto,
//       description: 'Payload for updating the subscription.',
//     }),
//     ApiParam({
//       name: 'subscriptionId', // Ensure it's properly named (if that's the case)
//       type: String,
//       description: 'The ID of the subscription to be updated',
//     }),
//     ApiResponse({
//       status: 200,
//       description: '',
//       schema: {
//         example: {
//           message: 'updated',
//         },
//       },
//     }),
//   );
// }

// export function ApiViewPreviewProration() {
//   return applyDecorators(
//     ApiOperation({
//       summary:
//         'View the amount the user needs to pay before confirming the update to the pet account number',
//       description:
//         'This endpoint provides a proration preview based on the new seat number.',
//       tags: ['Seller Subscription'],
//       deprecated: false,
//     }),
//     ApiQuery({
//       type: PreviewProrationAmountDto,
//       description: 'The new number of seats for the subscription.',
//     }),
//     ApiResponse({
//       status: 200,
//       description: 'Proration amount preview returned successfully.',
//       schema: {
//         example: {
//           prorationDate: '2025 - 6 - 24, T15: 5, 30.000: Z,',
//           nextPaymentDate: '2025 - 7 - 22, T22: 2, 29.000: Z,',
//           totalRefund: -2034,
//           totalCharge: 8135,
//           nextPaymentQty: 8,
//           nextPaymentAmount: 8640,
//         } as unknown as PreviewProrationReturnSchema,
//       },
//     }),
//   );
// }

// export function ApiDeleteSubscriptionInStripe() {
//   return applyDecorators(
//     ApiOperation({
//       summary: 'Delete a subscription in Stripe  (Test Use Only !)',
//       description: `This endpoint is intended for testing purposes only and must not be used in production.
//         \n - Immediately removes the testing subscription from Stripe.
//         \n - Triggers the Stripe webhook event: 'customer.subscription.deleted'.
//         \n - The associated subscription record in the Bevetu database will NOT be deleted.`,
//       tags: ['Seller Subscription'],
//       deprecated: false,
//     }),
//     ApiParam({
//       name: 'subscriptionId',
//       type: String,
//       description:
//         'The ID of the subscription (in Bevetu Database) to be updated',
//     }),
//     ApiResponse({
//       status: 200,
//       description: '',
//       schema: {
//         example: {
//           message: 'deleted',
//         },
//       },
//     }),
//   );
// }

// export function ApiViewStripeSubscription() {
//   return applyDecorators(
//     ApiOperation({
//       summary: 'View subscription data in Stripe (Test Use Only !)',
//       description: `Fetch subscription details directly from Stripe to verify changes made to the subscription.
//       \n - Use this to confirm whether subscription-related actions (e.g., updating seat number) are reflected in Stripe.
//       \n - For example, after triggering the "change seat number" function, call this endpoint to check if Stripe reflects the updated seat number.`,
//       tags: ['Seller Subscription'],
//       deprecated: false,
//     }),
//     ApiParam({
//       name: 'subscriptionId',
//       type: String,
//       description:
//         'The ID of the subscription (Bevetu Subscription ID, not the Stripe Subscription ID) to fetch from Stripe.',
//     }),
//     ApiResponse({
//       status: 200,
//       description: 'Successfully retrieved subscription details from Stripe.',
//       schema: {
//         example: stripeSubscriptionDummyReturn,
//       },
//     }),
//   );
// }

// export function ApiDeleteStripeCustomer() {
//   return applyDecorators(
//     ApiOperation({
//       summary: 'Delete Stripe Customer (Test Use Only !)',
//       description:
//         'This endpoint deletes a Stripe customer after testing. It should only be used in non-production environments.',
//       tags: ['Seller Subscription'],
//       deprecated: false,
//     }),
//     ApiParam({
//       name: 'subscriptionId',
//       type: String,
//       description:
//         'The ID of the subscription (Bevetu Subscription ID, not the Stripe Subscription ID) used to identify the associated Stripe customer.',
//     }),
//     ApiResponse({
//       status: 204,
//       description: 'Successfully deleted the Stripe customer.',
//     }),
//   );
// }

// export function ApiAdvanceTestClock() {
//   return applyDecorators(
//     ApiOperation({
//       summary: 'Advance the Stripe Test Clock (Test Use Only !)',
//       description:
//         'This endpoint advances the Stripe test clock attached to a customer. It is intended for triggering webhook events in testing environments only and should not be used in production.',
//       tags: ['Seller Subscription'],
//       deprecated: false,
//     }),
//     ApiParam({
//       name: 'testClockId',
//       type: String,
//       description: 'The ID of the test clock to advance.',
//     }),
//     ApiBody({
//       type: Number,
//       description: 'The number of days to advance the test clock.',
//     }),
//     ApiResponse({
//       status: 204,
//       description: 'The test clock was successfully advanced.',
//     }),
//   );
// }

// function expectedProducts(
//   showTestProduct: boolean,
// ): Record<IProductCode, IProduct> {
//   const products = {
//     BVT_FREE_TRIAL: {
//       name: 'Bevetu Free Trial (USD)',
//       code: 'BVT_FREE_TRIAL',
//       description: 'An free subscription plan',
//       features: AllFeatures,
//       price: 0,
//       currency: 'USD',
//       mode: 'Monthly',
//     },
//     BVT_ANNUAL_USD: {
//       name: 'Bevetu Annual Subscription (USD)',
//       code: 'BVT_ANNUAL_USD',
//       description: 'An annual subscription plan billed in USD.',
//       features: AllFeatures,
//       price: Number(process.env.ANNUAL_SUBSCRIPTION_USD),
//       currency: 'USD',
//       mode: 'Annual',
//     },
//     BVT_MONTHLY_USD: {
//       name: 'Bevetu Monthly Subscription (USD)',
//       code: 'BVT_MONTHLY_USD',
//       description: 'A monthly subscription plan billed in USD.',
//       features: AllFeatures,
//       price: Number(process.env.MONTHLY_SUBSCRIPTION_USD),
//       currency: 'USD',
//       mode: 'Monthly',
//     },
//     BVT_ANNUAL_GBP: {
//       name: 'Bevetu Annual Subscription (GBP)',
//       code: 'BVT_ANNUAL_GBP',
//       description: 'An annual subscription plan billed in GBP.',
//       features: AllFeatures,
//       price: Number(process.env.ANNUAL_SUBSCRIPTION_GBP),
//       currency: 'GBP',
//       mode: 'Annual',
//     },
//     BVT_MONTHLY_GBP: {
//       name: 'Bevetu Monthly Subscription (GBP)',
//       code: 'BVT_MONTHLY_GBP',
//       description: 'A monthly subscription plan billed in GBP.',
//       features: AllFeatures,
//       price: Number(process.env.MONTHLY_SUBSCRIPTION_GBP),
//       currency: 'GBP',
//       mode: 'Monthly',
//     },
//     BVT_ANNUAL_HKD: {
//       name: 'Bevetu Annual Subscription (HKD)',
//       code: 'BVT_ANNUAL_HKD',
//       description: 'An annual subscription plan billed in HKD.',
//       features: AllFeatures,
//       price: Number(process.env.ANNUAL_SUBSCRIPTION_HKD),
//       currency: 'HKD',
//       mode: 'Annual',
//     },
//     BVT_MONTHLY_HKD: {
//       name: 'Bevetu Monthly Subscription (HKD)',
//       code: 'BVT_MONTHLY_HKD',
//       description: 'A monthly subscription plan billed in HKD.',
//       features: AllFeatures,
//       price: Number(process.env.MONTHLY_SUBSCRIPTION_HKD),
//       currency: 'HKD',
//       mode: 'Monthly',
//     },
//     BVT_MONTHLY_TESTING: {
//       name: 'Bevetu Monthly Subscription (Testing))',
//       code: 'BVT_MONTHLY_TESTING',
//       description: 'A monthly testing subscription plan billed in HKD.',
//       features: AllFeatures,
//       price: Number(process.env.MONTHLY_SUBSCRIPTION_TESTIN_HKD),
//       currency: 'HKD',
//       mode: 'Monthly',
//     },
//     BVT_ANNUAL_TESTING: {
//       name: 'Bevetu Annual Subscription (Testing))',
//       code: 'BVT_ANNUAL_TESTING',
//       description: 'A annual testing subscription plan billed in HKD.',
//       features: AllFeatures,
//       price: Number(process.env.ANNUAL_SUBSCRIPTION_TESTIN_HKD),
//       currency: 'HKD',
//       mode: 'Annual',
//     },
//   };

//   if (!showTestProduct) {
//     delete products.BVT_MONTHLY_TESTING;
//     delete products.BVT_ANNUAL_TESTING;
//   }
//   //@ts-expect-error
//   return products;
// }

// //@ts-ignore
// const stripeSubscriptionDummyReturn: Stripe.Response<Stripe.Subscription> = {
//   id: 'sub_1Qk5L3DPdZkLrKKc77gBM6H',
//   object: 'subscription',
//   application: null,
//   application_fee_percent: null,
//   automatic_tax: {
//     enabled: false,
//     disabled_reason: 'requires_location_inputs',
//     liability: undefined,
//   },
//   billing_cycle_anchor: 1672464000, // Timestamp of when the billing cycle starts
//   billing_thresholds: null,
//   cancel_at: null,
//   cancel_at_period_end: false,
//   canceled_at: null,
//   collection_method: 'charge_automatically', // or 'send_invoice'
//   created: 1672464000,
//   current_period_end: 1675056000, // Timestamp of when the current billing period ends
//   current_period_start: 1672464000, // Timestamp of when the current billing period starts
//   customer: 'cus_Mm47s35HABZ9V7', // Customer ID
//   days_until_due: null,
//   default_payment_method: null,
//   default_source: null,
//   default_tax_rates: [],
//   description: null,
//   discount: null,
//   ended_at: null,
//   items: {
//     object: 'list',
//     data: [
//       {
//         id: 'si_Mn28y8ASDLf92Y',
//         object: 'subscription_item',
//         billing_thresholds: null,
//         created: 1672464000,
//         metadata: {},
//         price: {
//           id: 'price_1L0WTQDPdZkLrKKcGu6bA5g5',
//           object: 'price',
//           active: true,
//           billing_scheme: 'per_unit',
//           created: 1672464000,
//           currency: 'usd',
//           metadata: {},
//           nickname: null,
//           product: 'prod_Mm2F4SGPlj1sDa',
//           recurring: {
//             aggregate_usage: null,
//             interval: 'month',
//             interval_count: 1,
//             usage_type: 'licensed',
//             meter: '',
//             trial_period_days: 0,
//           },
//           tax_behavior: 'inclusive',
//           type: 'recurring',
//           unit_amount: 2000,
//           custom_unit_amount: undefined,
//           livemode: false,
//           lookup_key: '',
//           tiers_mode: 'graduated',
//           transform_quantity: undefined,
//           unit_amount_decimal: '',
//         },
//         quantity: 1,
//         subscription: 'sub_1Qk5L3DPdZkLrKKc77gBM6H',
//         tax_rates: [],
//         discounts: [],
//         plan: undefined,
//       },
//     ],
//     has_more: false,
//     url: '/v1/subscription_items?subscription=sub_1Qk5L3DPdZkLrKKc77gBM6H',
//   },
//   latest_invoice: 'in_1N1WJBDPdZkLrKKc4x4oVwRp', // ID of the latest invoice
//   livemode: false,
//   metadata: {
//     test_key: 'test_value',
//   },
//   next_pending_invoice_item_invoice: null,
//   on_behalf_of: null,
//   pause_collection: null,
//   payment_settings: {
//     payment_method_options: null,
//     payment_method_types: null,
//     save_default_payment_method: 'on_subscription',
//   },
//   pending_invoice_item_interval: null,
//   pending_setup_intent: null,
//   pending_update: null,
//   schedule: null,
//   start_date: 1672464000, // When the subscription started
//   status: 'active', // Possible values: 'active', 'past_due', 'canceled', 'incomplete', etc.
//   transfer_data: null,
//   trial_end: null,
//   trial_start: null,
// };

// export function ApiUpdateOne() {
//   return applyDecorators(
//     ApiOperation({
//       summary: 'Update a specific pet',
//       description:
//         'Updates the details of a specific pet based on the provided petId and the update data in the request body.',
//       tags: ['Pet'],
//       deprecated: false,
//     }),
//     ApiParam({
//       name: 'petId',
//       type: String,
//       description: 'The unique identifier of the pet to update',
//       required: true,
//       example: '123456',
//     }),
//     ApiBody({
//       type: UpdatePetDto,
//       description: 'Data to update the pet',
//     }),
//     ApiResponse({
//       status: 200,
//       description: 'Pet updated successfully',
//       schema: {
//         example: {
//           message: 'updated',
//         } as UpdateReturnSchema,
//       },
//     }),
//     ApiResponse({
//       status: 404,
//       description: 'Pet not found',
//       schema: {
//         example: {
//           data: {
//             message: 'Pet not found',
//           },
//         },
//       },
//     }),
//     ApiResponse({
//       status: 403,
//       description: 'Forbidden: Pet does not belong to this user',
//       schema: {
//         example: {
//           data: {
//             message: 'Pet does not belong to this user',
//           },
//         },
//       },
//     }),
//   );
// }

// export function ApiDelete() {
//   return applyDecorators(
//     ApiOperation({
//       summary: 'Delete a specific pet',
//       description:
//         'Deletes a pet by its unique identifier if the user is authorized and the pet exists.',
//       tags: ['Pet'],
//       deprecated: false,
//     }),
//     ApiParam({
//       name: 'petId',
//       type: String,
//       description: 'The unique identifier of the pet to delete',
//       required: true,
//       example: '123456',
//     }),
//     ApiResponse({
//       status: 200,
//       description: 'Pet deleted successfully',
//       schema: {
//         example: {
//           message: 'deleted',
//         } as RemoveReturnSchema,
//       },
//     }),
//     ApiResponse({
//       status: 404,
//       description: 'Pet not found',
//       schema: {
//         example: {
//           data: {
//             message: 'Pet not found',
//           },
//         },
//       },
//     }),
//     ApiResponse({
//       status: 403,
//       description: 'Forbidden: Pet does not belong to this user',
//       schema: {
//         example: {
//           data: {
//             message: 'Pet does not belong to this user',
//           },
//         },
//       },
//     }),
//   );
// }

// export function ApiGetUploadPicturePresignUrl() {
//   return applyDecorators(
//     ApiOperation({
//       summary: 'Generate presigned URL for profile picture upload',
//       description:
//         'Generates a presigned URL that allows the client to upload a profile picture directly to the storage service.',
//       tags: ['Pet'],
//       deprecated: false,
//     }),
//     ApiBody({
//       type: GenerateUploadPresignedUrlDto,
//       description: 'The details required to generate the presigned URL',
//     }),
//     ApiResponse({
//       status: 200,
//       description: 'Presigned URL generated successfully',
//       schema: {
//         example: {
//           url: 'https://example.com/upload/presigned-url',
//         } as GetUploadPicturePresignUrlReturnSchema,
//       },
//     }),
//   );
// }
