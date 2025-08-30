/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// import { Controller, Get, Post, RawBodyRequest, Req } from '@nestjs/common';
// import { StripeService } from './services/stripe.service';
// import { SubscriptionUseCase } from '../subscription/services/subscription.useCase';
// import { StripewebhookReturnAfterSubscriptionPaymentDto } from './dto/stripe-webhook-return-after-subscription-payment.dto';
// import { ApiTags } from '@nestjs/swagger';
// import { StripeCacheService } from './cache/stripe.cache-service';
// import { StripewebhookReturnAfterSubscriptionCyclePaymentDto } from './dto/stripe-webhook-return-after-subscription-cycle-payment.dto';
// import { StripewebhookReturnAfterDeleteSubscriptionDto } from './dto/stripe-webhook-return-after-delete-subscription.dto';
// import { ApiHealthCheck, ApiWebhookListener } from './stripe.swagger';

import { SellerSubscriptionService } from './../seller-subscription/services/seller-subscription.service';
import { StripeService } from './services/stripe.service';
import { StripeCacheService } from './cache/stripe.cache-service';
import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiHealthCheck, ApiWebhookListener } from './stripe.swagger';
import type { RawBodyRequest } from '@nestjs/common';
import { CompleteSellerListingSubscriptionEnrollmentDto } from 'src/seller-subscription/dto';

@ApiTags('Stripe Webhook (For Stripe use only)')
@Controller({ path: 'stripe-webhook', version: '1' })
export class StripeWebhook {
  constructor(
    private readonly stripeService: StripeService,
    private readonly subscriptionService: SellerSubscriptionService,
    private readonly stripeCacheService: StripeCacheService,
  ) {}

  @Get()
  @ApiHealthCheck()
  healthCheck() {
    return 'Webhook is listening';
  }

  @Post()
  @ApiWebhookListener()
  async webhookListener(@Req() req: RawBodyRequest<Request>) {

    if (!req.rawBody) {
      throw new BadRequestException(
        'Missing rawBody in request. Stripe webhook verification failed.',
      );
    }

    if (
      !req.headers['stripe-signature'] ||
      Array.isArray(req.headers['stripe-signature'])
    ) {
      throw new BadRequestException(
        'Missing Stripe signature. Stripe webhook verification failed.',
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new BadRequestException(
        'Missing Stripe Webhook Scret. Stripe webhook verification failed.',
      );
    }

    const sig = req.headers['stripe-signature'] as string;
    const event = this.stripeService.constructWebhookEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    const isDuplicate = await this.stripeCacheService.getEventId(event.id);

    if (isDuplicate) {
      console.log('it is deplicated');
      return {
        statusCode: 200,
        message: 'Duplicate event ignored',
      };
    }
    await this.stripeCacheService.setEventId(event.id);
    const session: any = event.data.object;

    switch (event.type) {
      case 'checkout.session.completed':
        if (session.metadata.platform !== process.env.PLATFORM) {
          return {
            statusCode: 200,
            message: `Event skipped: session is for platform ${session.metadata.platform}, not the target platform.`,
          };
        }

        if (
          session.metadata.action === 'SELLER_LISTENING_SUBSCRIPTION_ENROLLMENT'
        ) {
          console.log(
            '✅ Webhooks: Event `checkout.session.completed` for seller listing subscription action received',
          );

          console.log(session, '<< session');
          console.log(session, '<< metadata');
          await this.subscriptionService.completeSellerListingSubscriptionEnrollment(
            Object.assign(
              new CompleteSellerListingSubscriptionEnrollmentDto(),
              {
                stripeCustomerId: session.customer ?? 'NA',
                stripeSubscriptionId: session.subscription ?? 'NA',
                stripeSubscriptionItemId: null,
                userId: session.metadata.userId,
                sellerId: session.metadata.bevetuSellerId,
                productCode: session.metadata.productCode,
                amount: Number(session.amount_total) / 100,
                currency: session.currency,
                quantity: session.metadata.quantity,
                email: session.metadata.email,
              },
            ),
          );
          return { message: 'Listing Subscription Created' };
        }
        // for non - 'SELLER_LISTENING_SUBSCRIPTION_ENROLLMENT' action, break it
        break;

      case 'invoice.payment_succeeded':
        // const invoice = event.data.object;
        // const paymentSucceededReason = invoice.billing_reason;
        // const paidAt = new Date(invoice.status_transitions.paid_at * 1000);
        // const paidAmount = invoice.amount_paid;

        // if (paymentSucceededReason === 'subscription_cycle') {
        //   console.log(
        //     '✅ Webhooks: Event `invoice.payment_succeeded` for subscription_cycle received',
        //   );
        //   const { userId, bevetuSubscriptionId } =
        //     session.subscription_details.metadata;
        //   await this.subscriptionUseCase.invoicePaymentSuccessded(
        //     Object.assign(
        //       new StripewebhookReturnAfterSubscriptionCyclePaymentDto(),
        //       {
        //         bevetuSubscriptionId,
        //         userId,
        //         paidAt,
        //         paidAmount: paidAmount / 100,
        //       },
        //     ),
        //   );
        //   return {
        //     statusCode: 200,
        //     message: 'Recurring payment processed successfully',
        //   };
        // }
        break;

      case 'invoice.payment_failed':
        // const failedInvoice = event.data.object;
        // const paymentFailedReason = failedInvoice.billing_reason;
        // if (paymentFailedReason === 'subscription_cycle') {
        //   console.log(
        //     '✅ Webhooks: Event `invoice.payment_failed`  for subscription_cycle received',
        //   );
        //   const { userId, bevetuSubscriptionId } =
        //     session.subscription_details.metadata;
        //   await this.subscriptionUseCase.invoicePaymentFailed(
        //     Object.assign(
        //       new StripewebhookReturnAfterSubscriptionCyclePaymentDto(),
        //       {
        //         bevetuSubscriptionId,
        //         userId,
        //       },
        //     ),
        //   );
        //   return {
        //     statusCode: 200,
        //     message: 'Failed recurring payment handled',
        //   };
        // }
        break;

      case 'customer.subscription.deleted':
        // console.log(
        //   '✅ Webhooks: Event `customer.subscription.deleted` received',
        // );
        // const { userId, bevetuSubscriptionId } = session.metadata;

        // await this.subscriptionUseCase.softDeleteSubscription(
        //   Object.assign(new StripewebhookReturnAfterDeleteSubscriptionDto(), {
        //     bevetuSubscriptionId,
        //     userId,
        //   }),
        // );
        // return {
        //   statusCode: 200,
        //   message: 'Delete subscription handled',

        // };
        break;
      default:
        console.log('no match case');
        return { statusCode: 200, message: 'No matching case for this event' };
    }
    return { statusCode: 200, message: 'Webhook is listening' };
  }
}
// Code sample:

//   switch (event.type) {
//     case 'checkout.session.completed':
//       // Handle successful one-off payments and first subscription payments

//       if (session.metadata.action === 'ONE_OFF_PAYMENT') {
//         console.log('✅ Webhooks: Switch to One Off Payment Function');
//         return await oneOffPayment(session);

//       } else if (session.metadata.action === 'SUBSCRIPTION') {
//         console.log('✅ Webhooks: Switch to First Subscription Function');
//         return await subscriptionForFirstTime(session);

//       } else if (session.metadata.action === 'CREDITS_TOP_UP') {
//         console.log('✅ Webhooks: Switch to Credits Top Up Function');
//         return await creditsTopUp(session);
//       } else if (

//         session.metadata.action === 'SUBSCRIPTION_UPGRADE_AFTER_PAYMENT'
//       ) {
//         console.log(
//           '✅ Webhooks: Switch to Subscription Upgrade after Payment Function',
//         );
//         return await subscriptionUpgradeAfterPayment(session);

//         /**
//          *  This block handle the payment by-passed from our website */

//       } else if (session.metadata.action === 'PAYMENT_LINK') {
//         console.log('✅ Webhooks: Switch to Payment Link Handler');
//         return await paymentLinkHandler(session);
//       }
//       break;

//     case 'customer.subscription.updated':

//       if (session.metadata.action === 'SUBSCRIPTION_UPGRADE') {
//         console.log('✅ do the subscription upgrade');
//         return await subscriptionUpgrade(session);

//       } else if (session.metadata.action === 'SUBSCRIPTION_DOWNGRADE') {
//         console.log('✅ do the subscription downgrade');
//         return await subscriptionDowngrade(session);

//       } else if (session.metadata.action === 'DOWNGRADE_CANCEL') {
//         console.log('✅ do the cancel downgrade schedule');
//         return await subscriptionDowngradeCancel(session);
//       }

//       break;

//     case 'customer.subscription.deleted':

//       if (session.cancellation_details.comment == 'ACCOUNT_REMOVAL') {
//         console.log('✅ do the delete subscription for removal of account');
//         return await subscriptionDeletedForAccountRemoval(session);
//       } else if (

//         session.cancellation_details.comment ==
//         'PAYMENT_LINK_DUPLICATION_CACNCEL'
//       ) {
//         console.log(
//           '✅ do the delete subscription for payment link duplication',
//         );
//         break;
//       } else if (
//         session.cancellation_details.comment == 'INVOICE_PAYMENT_FAIL'
//       ) {
//         // invoice.payment_failed will delete the subscription. This is to bypass the signal from the webhook
//         console.log(
//           '✅ do the delete subscription for invoice payment fail ',
//         );
//         break;
//       } else {
//         console.log('✅ do the delete subscription');
//         return await subscriptionDeleted(session);
//       }

//     case 'invoice.payment_succeeded':

//       const billingReason = event.data.object.billing_reason;
//       if (billingReason === 'subscription_cycle') {
//         console.log('✅ do the recurring payments');
//         return await subscriptionCycle(session);
//       }
//       break;

//     case 'invoice.payment_failed': {

//       const billingReason = event.data.object.billing_reason;
//       if (billingReason === 'subscription_cycle') {
//         console.log('✅ do the failed recurring payments');
//         return await subscriptionCycleFailed(session);
//       }
//       break;
//     }

//     default:
//       console.log('No action required for event: ', event.type);
//       break;
//   }

//   return {
//     statusCode: 200,
//     data: {
//       received: true,
//       message: 'no matching case for this event',
//     },
//   };
// }
