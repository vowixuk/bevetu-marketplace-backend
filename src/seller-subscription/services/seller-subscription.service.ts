/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SellerSubscriptionRepository } from '../repositories/seller-subscription.repository';
import { SellerSubscription } from '../entities/seller-subscription.entity';
import { CreateSellerSubscriptionDto } from '../dto/create-seller-subscription.dto';
import { UpdateSellerSubscriptionDto } from '../dto/update-seller-subscription.dto';
import { IProductCode, Products } from '../entities/vo/product.vo';
import { StripeService } from '../../stripe/services/stripe.service';
import { CreateCheckoutSessionDto } from '../../stripe/dto/create-checkout-session.dto';
import { CompleteSellerListingSubscriptionEnrollmentDto } from '../dto/complete-seller-listing-subscription-enrollment.dto';
import { SellerSubscriptionMappingService } from '../../stripe/services/seller-subscription-mapping.service';
import { CreateSellerSubscriptionMappingDto } from '../../stripe/dto/create-seller-subscrption-mapping.dto';
import { SubscriptionEventRecordRepository } from '../repositories/event-record.repository';
import { CreateSubscriptionEventRecordDto } from '../dto/create-subscription-event-record.dto';
import { SubscriptionEventRecordService } from './event-record.service';

@Injectable()
export class SellerSubscriptionService {
  constructor(
    private readonly subscriptionRepository: SellerSubscriptionRepository,
    private readonly sellerSubscriptionMappingService: SellerSubscriptionMappingService,
    private readonly subscriptionEventRecordService: SubscriptionEventRecordService,
    private readonly stripeService: StripeService,
  ) {}

  async create(
    sellerId: string,
    createDto: CreateSellerSubscriptionDto,
  ): Promise<SellerSubscription> {
    return this.subscriptionRepository.create(
      new SellerSubscription({
        id: '',
        sellerId,
        status: createDto.status,
        items: createDto.items,
        nextPaymentDate: createDto.nextPaymentDate,
        createdAt: new Date(),
      }),
    );
  }

  async findAllBySellerId(sellerId: string): Promise<SellerSubscription[]> {
    const subscriptions =
      await this.subscriptionRepository.findAllBySellerId(sellerId);

    if (subscriptions.length === 0) {
      return [];
    }

    return subscriptions;
  }

  async findOne(
    sellerId: string,
    subscriptionId: string,
  ): Promise<SellerSubscription> {
    const subscription =
      await this.subscriptionRepository.findOne(subscriptionId);

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.sellerId !== sellerId) {
      throw new ForbiddenException(
        'Subscription does not belong to this seller',
      );
    }

    return subscription;
  }

  async update(
    sellerId: string,
    subscriptionId: string,
    updateDto: UpdateSellerSubscriptionDto,
  ): Promise<SellerSubscription> {
    const subscription = await this.findOne(sellerId, subscriptionId);

    return this.subscriptionRepository.update({
      ...subscription,
      ...updateDto,
    });
  }

  async remove(
    sellerId: string,
    subscriptionId: string,
  ): Promise<SellerSubscription> {
    await this.findOne(sellerId, subscriptionId);
    return this.subscriptionRepository.remove(subscriptionId);
  }

  async getListingSubscriptionPaymentLink(
    userId: string,
    bevetuSellerId: string,
    stripeCustomerIdOfSeller: string, // not seller's account id. seller , just like buyer, has its own stripe custimer id
    email: string,
    productCode: IProductCode,
    promotionCode?: null,
  ): Promise<string> {
    // Step 1 - Check if the user already has an active subscription
    const subscriptions = await this.findAllBySellerId(bevetuSellerId);
    const hasActiveSubscription = subscriptions.some(
      (sub) => sub.status === 'ACTIVE',
    );
    if (hasActiveSubscription) {
      throw new ForbiddenException('Seller already has an active subscription');
    }

    // Step 2 - Get Paymentlink
    const stripePriceId = Products[productCode].stripePriceId;
    const session = await this.stripeService.createCheckoutSession(
      stripeCustomerIdOfSeller,
      Object.assign(new CreateCheckoutSessionDto(), {
        stripePriceId,
        mode: 'subscription',
        quantity: 1,
        success_url: process.env.LISTING_SUBSCRIPTION_SUCCESS_URL,
        cancel_url: process.env.LISTING_SUBSCRIPTION_CANCEL_URL,
        ...(promotionCode ? { promotionCode: promotionCode } : {}),
        metadata: {
          email,
          userId,
          bevetuSellerId,
          platform: process.env.PLATFORM || 'NA',
          productCode,
          quantity: 1,
          action: 'SELLER_LISTENING_SUBSCRIPTION_ENROLLMENT',
        },
      }),
    );

    if (!session.url) {
      throw new InternalServerErrorException('Unable to generate payment link');
    }

    return session.url;
  }

  /* *************************************************
   *          ----- Stripe Webhook -----
   *   Methods below are triggered by Stripe webhook
   * *************************************************/
  /**
   *  @event 'checkout.session.completed'
   *  @condition session.metadata.action === 'SELLER_LISTENING_SUBSCRIPTION_ENROLLMENT'
   *  @description Trigered by Stripe webhook after user complete the payment on payment link
   */
  async completeSellerListingSubscriptionEnrollment(
    completeSellerListingSubscriptionEnrollmentDto: CompleteSellerListingSubscriptionEnrollmentDto,
  ): Promise<string> {
    const {
      stripeCustomerId,
      stripeSubscriptionId,
      stripeSubscriptionItemId,
      userId,
      sellerId,
      productCode,
      amount,
      currency,
      quantity,
    } = completeSellerListingSubscriptionEnrollmentDto;

    const product = Products[productCode];

    const { nextPaymentAmount, nextPaymentDate } =
      await this.stripeService.getNextPaymentDetails(
        stripeCustomerId,
        stripeSubscriptionId,
      );

    // Step 1 - Create seller subsctipion record in bevetu database
    const { id: bevetuSubscriptionId } = await this.create(
      sellerId,
      Object.assign(new CreateSellerSubscriptionDto(), {
        nextPaymentDate: nextPaymentDate,
        status: 'ACTIVE',
        items: {
          quantity: 1,
          category: 'LISTING_SUBSCRIPTION',
          name: productCode,
        },
      }),
    );

    // Step 2 - Create seller mapping record. Mapping the  subsctipion data of Stripe and self dataabse
    await this.sellerSubscriptionMappingService.create(
      userId,
      Object.assign(new CreateSellerSubscriptionMappingDto(), {
        bevetuSubscriptionId,
        identifyId: stripeCustomerId,
        stripeCustomerId: stripeCustomerId,
        stripeSubscriptionId: stripeSubscriptionId,
        stripeSubscriptionItems: [
          {
            stripItemId: stripeSubscriptionItemId,
            quantity: 1,
            category: 'LISTING_SUBSCRIPTION',
            name: productCode,
          },
        ],
      }),
    );

    // Step 3a - Create event record
    await this.subscriptionEventRecordService.create(
      bevetuSubscriptionId,
      Object.assign(new CreateSubscriptionEventRecordDto(), {
        type: 'CREATE',
        metadata: {
          productCode: productCode,
          productName: product.name,
          productMode: product.mode,
        },
      }),
    );

    // Step 3b - Create event record
    await this.subscriptionEventRecordService.create(
      bevetuSubscriptionId,
      Object.assign(new CreateSubscriptionEventRecordDto(), {
        type: 'PAYMENT',
        metadata: {
          amount,
          currency,
          productCode,
          quantity,
          nextPaymentDate,
          nextPaymentAmount,
        },
      }),
    );

    // Step 3c - Create event record
    await this.subscriptionEventRecordService.create(
      bevetuSubscriptionId,
      Object.assign(new CreateSubscriptionEventRecordDto(), {
        type: 'PAYMENT_SUCCESS',
        metadata: {
          productCode,
          paidAt: new Date(),
          paidAmount: amount,
          nextPaymentDate,
          nextPaymentAmount,
        },
      }),
    );

    // Step 4 - Add the bevetu's subscription id record in Stripe.
    await this.stripeService.addMetadataToSubscription(stripeSubscriptionId, {
      bevetuSubscriptionId,
    });

    return bevetuSubscriptionId;
  }

  // /**
  //  *  @event 'invoice.payment_succeeded'
  //  *  @condition paymentSucceededReason === 'subscription_cycle'
  //  *  @description Trigered when subscription is charged successfully in the new billing cycle
  //  */
  // async invoicePaymentSuccessded(
  //   stripewebhookReturnAfterSubscriptionCyclePaymentDto: StripewebhookReturnAfterSubscriptionCyclePaymentDto,
  // ): Promise<string> {
  //   const { userId, bevetuSubscriptionId, paidAt, paidAmount } =
  //     stripewebhookReturnAfterSubscriptionCyclePaymentDto;

  //   // Always set the status as active if payment is received
  //   await this.subscriptionService.update(
  //     userId,
  //     bevetuSubscriptionId,
  //     Object.assign(new UpdateSubscriptionDto(), {
  //       status: 'ACTIVE',
  //     }),
  //   );
  //   await this.eventRecordService.create(
  //     Object.assign(new CreateEventRecordDto(), {
  //       subscriptionId: bevetuSubscriptionId,
  //       type: 'PAYMENT_SUCCESS',
  //       metadata: {
  //         paidAt,
  //         paidAmount,
  //       },
  //     }),
  //   );

  //   return 'payment successed';
  // }

  // /**
  //  *  @event 'invoice.payment_failed'
  //  *  @condition paymentSucceededReason === 'subscription_cycle'
  //  *  @description Trigered when subscription is charged successfully in the new billing cycle
  //  */
  // async invoicePaymentFailed(
  //   stripewebhookReturnAfterSubscriptionCyclePaymentDto: StripewebhookReturnAfterSubscriptionCyclePaymentDto,
  // ): Promise<string> {
  //   const { bevetuSubscriptionId, userId } =
  //     stripewebhookReturnAfterSubscriptionCyclePaymentDto;
  //   await this.subscriptionService.update(
  //     userId,
  //     bevetuSubscriptionId,
  //     Object.assign(new UpdateSubscriptionDto(), {
  //       status: 'PAYMENT_FAILED',
  //     }),
  //   );

  //   await this.eventRecordService.create(
  //     Object.assign(new CreateEventRecordDto(), {
  //       subscriptionId: bevetuSubscriptionId,
  //       type: 'PAYMENT_FAIL',
  //       metadata: {
  //         error: 'Payment Failed',
  //       },
  //     }),
  //   );
  //   return 'payment failed';
  // }
}
