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
import { IProduct, IProductCode, Products } from '../entities/vo/product.vo';
import { StripeService } from '../../stripe/services/stripe.service';
import { CreateCheckoutSessionDto } from '../../stripe/dto/create-checkout-session.dto';
import { CompleteSellerListingSubscriptionEnrollmentDto } from '../dto/complete-seller-listing-subscription-enrollment.dto';
import { SellerSubscriptionMappingService } from '../../stripe/services/seller-subscription-mapping.service';
import { CreateSellerSubscriptionMappingDto } from '../../stripe/dto/create-seller-subscrption-mapping.dto';
import { SubscriptionEventRecordRepository } from '../repositories/event-record.repository';
import { CreateSubscriptionEventRecordDto } from '../dto/create-subscription-event-record.dto';
import { SubscriptionEventRecordService } from './event-record.service';
import { PreviewProrationAmountDto } from '../../stripe/dto/preview-proation-amount.dto';
import {
  SellerSubscriptionMapping,
  StripeSubscriptionItems,
} from 'src/stripe/entities/seller-subscription-mapping.entity';
import Stripe from 'stripe';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SellerSubscriptionService {
  constructor(
    private readonly subscriptionRepository: SellerSubscriptionRepository,
    private readonly sellerSubscriptionMappingService: SellerSubscriptionMappingService,
    private readonly subscriptionEventRecordService: SubscriptionEventRecordService,
    private readonly stripeService: StripeService,
    private eventEmitter: EventEmitter2,
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

  /**
   * Guard function to ensure that a seller has at least one valid subscription.
   *
   * This function fetches all subscriptions associated with the given sellerId,
   * then checks if there is at least one subscription with a status of 'ACTIVE' or 'CANCELLING'.
   *
   * If no valid subscription is found, it throws a ForbiddenException, preventing
   * further actions by the seller.
   *
   * @param sellerId - The ID of the seller to check subscriptions for
   * @throws ForbiddenException - if the seller has no valid subscription
   */
  async validSubscriptionGuard(sellerId: string) {
    const subnscriptions = await this.findAllBySellerId(sellerId);
    const validSubscription = subnscriptions.find(
      (sub) => sub.status === 'ACTIVE' || sub.status === 'CANCELLING',
    );
    if (!validSubscription) {
      throw new ForbiddenException('No valid Subscription');
    }

    return validSubscription;
  }
  /**
   * Generate a payment link when a listing plan is selected.
   * Each seller can have only one subscription.
   * If a subscription record already exists (active or inactive),
   * the seller is **not allowed** to access this function again.
   * In such cases, the seller should use "update", "reactivate", or "restore"
   * to modify the subscription instead of going through the payment link page again.
   */
  async getListingSubscriptionPaymentLink(
    userId: string,
    sellerId: string,
    stripeCustomerId: string, // not seller's account id. seller , just like buyer, has its own stripe custimer id
    email: string,
    productCode: IProductCode,
    promotionCode?: null,
  ): Promise<string> {
    // Step 1 - Check if the user already has valid subscription record
    const subscriptions = await this.findAllBySellerId(sellerId);
    const validSubscriptions = subscriptions.filter(
      (sub) =>
        sub.status === 'ACTIVE' ||
        sub.status === 'CANCELLING' ||
        sub.status === 'PAYMENT_FAILED',
    );

    if (validSubscriptions.length > 0) {
      throw new ForbiddenException('Seller already has an valid subscription');
    }

    // Step 2 - Get Paymentlink
    const stripePriceId = Products[productCode].stripePriceId;
    const session = await this.stripeService.createCheckoutSession(
      stripeCustomerId,
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
          bevetuSellerId: sellerId,
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

  /**
   * Validates that a subscription can be updated to a new product.
   * Ensures the subscription exists and that the new product uses the same currency
   * as the current product. Throws an error if the current product code is missing
   * or if the currency does not match.
   */
  async subscriptionUpdateGuard(
    sellerId: string,
    bevetuSubscriptionId: string,
    newProductCode: IProductCode,
  ): Promise<{
    subscription: SellerSubscription;
    currentProduct: IProduct;
    newProduct: IProduct;
    mode: 'UPGRADE' | 'DOWNGRADE';
    subscriptionMapping: SellerSubscriptionMapping;
    stripeSubscriptionItem: StripeSubscriptionItems;
  }> {
    const subscription = await this.findOne(sellerId, bevetuSubscriptionId);

    const currentProductCode = subscription.items.find(
      (item) => item.productCode,
    );
    if (!currentProductCode?.productCode) {
      throw new InternalServerErrorException("Current product's code missing");
    }

    const currentProduct = Products[currentProductCode.productCode];
    const newProduct = Products[newProductCode];

    if (currentProduct.currency !== newProduct.currency) {
      throw new ForbiddenException(
        'The updated product must use the same currency as the existing one.',
      );
    }

    const subscriptionMapping =
      await this.sellerSubscriptionMappingService.findByBevetuSubscriptionId(
        sellerId,
        bevetuSubscriptionId,
      );

    const stripeSubscriptionItem =
      subscriptionMapping.stripeSubscriptionItems.find(
        (item) => item.category == 'LISTING_SUBSCRIPTION',
      );

    if (!stripeSubscriptionItem) {
      throw new ForbiddenException('Subscription Item details not found');
    }

    const mode =
      newProduct.price - currentProduct.price >= 0 ? 'UPGRADE' : 'DOWNGRADE';

    return {
      subscription,
      currentProduct,
      newProduct,
      mode,
      subscriptionMapping,
      stripeSubscriptionItem,
    };
  }

  async previewProrationAmount(
    sellerId: string,
    bevetuSubscriptionId: string,
    newProductCode: IProductCode,
  ) {
    const { newProduct, subscriptionMapping, stripeSubscriptionItem } =
      await this.subscriptionUpdateGuard(
        sellerId,
        bevetuSubscriptionId,
        newProductCode,
      );

    return await this.stripeService.previewProrationAmount(
      Object.assign(new PreviewProrationAmountDto(), {
        stripeCustomerId: subscriptionMapping.stripeCustomerId,
        stripeSubscriptionId: subscriptionMapping.stripeSubscriptionId,
        stripeSubscriptionItemId: stripeSubscriptionItem.stripItemId,
        newPriceId: newProduct.stripePriceId,
      }),
    );
  }

  async findCurrentSubscriptionAndMapping(
    sellerId: string,
    bevetuSubscriptionId: string,
  ): Promise<{
    subscription: SellerSubscription;
    subscriptionMapping: SellerSubscriptionMapping;
    currentProduct: IProduct;
  }> {
    const subscription = await this.findOne(sellerId, bevetuSubscriptionId);
    const subscriptionMapping =
      await this.sellerSubscriptionMappingService.findByBevetuSubscriptionId(
        sellerId,
        bevetuSubscriptionId,
      );
    const currentProductCode = subscription.items.find(
      (item) => item.productCode,
    );
    if (!currentProductCode?.productCode) {
      throw new InternalServerErrorException("Current product's code missing");
    }

    const currentProduct = Products[currentProductCode.productCode];

    return {
      subscription,
      subscriptionMapping,
      currentProduct,
    };
  }

  /**
   * The SellerSubscriptionMapping contains the Stripe subscription item ID (e.g., si_xxxasdxx)
   * for a listing subscription.
   *
   * After updating the subscription, this Stripe subscription item ID may change.
   * This function updates the mapping record by finding the corresponding listing item
   * and replacing the old Stripe subscription item ID with the new one.
   *
   * Note: Each subscription mapping corresponds to exactly one LISTING_SUBSCRIPTION.
   */
  async amendMappingStripeSubscriotionItemsIdForListingItemAfterSubscriptionUpdate(
    subscriptionMapping: SellerSubscriptionMapping,
    newStripeSubscriptionItemId: string,
    newProductCode: IProductCode,
  ) {
    // Update the new item id in mapping record in database
    // 1. Reshape the mapping items:
    const currentItems = subscriptionMapping.stripeSubscriptionItems;
    const newItems = currentItems.map((item) => {
      if (item.category !== 'LISTING_SUBSCRIPTION') {
        return item;
      } else {
        const data = {
          stripItemId: newStripeSubscriptionItemId,
          productCode: newProductCode,
        };
        return {
          ...item,
          ...data,
        };
      }
    });
    // 3.2. update the mapping record
    await this.sellerSubscriptionMappingService.update(
      subscriptionMapping.sellerId,
      subscriptionMapping.id,
      { stripeSubscriptionItems: newItems },
    );
  }

  async amendSellerSubscriotionItemsProductCodeForListingItemAfterSubscriptionUpdate(
    sellerSubscription: SellerSubscription,
    newProductCode: IProductCode,
  ) {
    // Update the new item id in mapping record in database
    // 1. Reshape the mapping items:
    const currentItems = sellerSubscription.items;
    const newItems = currentItems.map((item) => {
      if (item.category !== 'LISTING_SUBSCRIPTION') {
        return item;
      } else {
        const data = {
          productCode: newProductCode,
        };
        return {
          ...item,
          ...data,
        };
      }
    });
    // 3.2. update the mapping record
    await this.update(sellerSubscription.sellerId, sellerSubscription.id, {
      items: newItems,
    });
  }

  async upgradeListingSubscription(
    sellerId: string,
    bevetuSubscriptionId: string,
    newProductCode: IProductCode,
  ) {
    const {
      currentProduct,
      newProduct,
      mode,
      subscriptionMapping,
      subscription,
      stripeSubscriptionItem,
    } = await this.subscriptionUpdateGuard(
      sellerId,
      bevetuSubscriptionId,
      newProductCode,
    );

    // Step 1 - get how much is charged for proration
    const proationReview = await this.previewProrationAmount(
      sellerId,
      bevetuSubscriptionId,
      newProductCode,
    );

    // Step 2 - Update stripe details and charge
    const upgradeSubscription =
      await this.stripeService.changeSubscriptionWithoutProrateEffectNextCycle(
        subscriptionMapping.stripeSubscriptionId,
        stripeSubscriptionItem.stripItemId,
        newProduct.stripePriceId,
      );

    // Step 4 - update the new subscription code id subscription record
    await this.amendSellerSubscriotionItemsProductCodeForListingItemAfterSubscriptionUpdate(
      subscription,
      newProductCode,
    );
    // Step 5 - update the new subscription items id in Mapper
    const newStripeSubscriptionItemId = upgradeSubscription.items.data[0].id;
    await this.amendMappingStripeSubscriotionItemsIdForListingItemAfterSubscriptionUpdate(
      subscriptionMapping,
      newStripeSubscriptionItemId,
      newProductCode,
    );

    // Step 6 - update event records
    await this.subscriptionEventRecordService.create(
      bevetuSubscriptionId,
      Object.assign(new CreateSubscriptionEventRecordDto(), {
        type: 'UPDATE',
        metadata: {
          from: currentProduct.code,
          to: newProductCode,
          proration: true,
        },
      }),
    );

    await this.subscriptionEventRecordService.create(
      bevetuSubscriptionId,
      Object.assign(new CreateSubscriptionEventRecordDto(), {
        type: 'REFUND',
        metadata: {
          refundReason: 'Proration Refund',
          amount: proationReview.totalRefund,
        },
      }),
    );

    await this.subscriptionEventRecordService.create(
      bevetuSubscriptionId,
      Object.assign(new CreateSubscriptionEventRecordDto(), {
        type: 'PAYMENT_SUCCESS',
        metadata: {
          productCode: newProductCode,
          paidAt: new Date(),
          paidAmount: proationReview.totalCharge,
          nextPaymentDate: proationReview.nextPaymentPeriod?.start,
          nextPaymentAmount: proationReview.nextPaymentAmount,
        },
      }),
    );
    return upgradeSubscription;
  }

  async downgradeListingSubscription(
    sellerId: string,
    bevetuSubscriptionId: string,
    newProductCode: IProductCode,
  ) {
    const {
      subscription,
      currentProduct,
      newProduct,
      subscriptionMapping,
      stripeSubscriptionItem,
    } = await this.subscriptionUpdateGuard(
      sellerId,
      bevetuSubscriptionId,
      newProductCode,
    );

    const downgadeSubscription =
      await this.stripeService.changeSubscriptionWithoutProrateEffectNextCycle(
        subscriptionMapping.stripeSubscriptionId,
        stripeSubscriptionItem.stripItemId,
        newProduct.stripePriceId,
      );

    await this.subscriptionEventRecordService.create(
      bevetuSubscriptionId,
      Object.assign(new CreateSubscriptionEventRecordDto(), {
        type: 'PENDING_UPDATE',
        metadata: {
          from: currentProduct.code,
          to: newProductCode,
          update_at: subscription.nextPaymentDate,
        },
      }),
    );

    // Step 4 - Add the bevetu's subscription id record in Stripe.
    const pendingUpdateMetadata = {
      sellerId,
      bevetuSubscriptionId,
      currentProductCode: currentProduct.code,
      newProductCode,
    };
    await this.stripeService.addMetadataToSubscription(
      subscriptionMapping.stripeSubscriptionId,
      {
        pending_update: JSON.stringify(pendingUpdateMetadata),
      },
    );

    return downgadeSubscription;
  }

  /*
   * The is called by user to cancel their active  subscription
   * It is `cancelling` since the subnscription will not be cancelled immediately
   * It will be completed cancelled in next billing cycle
   */
  async cancellingSubscription(
    sellerId: string,
    bevetuSubscriptionId: string,
    cancelReason: string,
    immedateCancel?: boolean,
  ): Promise<{ subscriptionCancelAt: Date }> {
    const { subscription, subscriptionMapping, currentProduct } =
      await this.findCurrentSubscriptionAndMapping(
        sellerId,
        bevetuSubscriptionId,
      );

    // set Cancelling in Stripe
    const stripeSubscription = await this.stripeService.cancelSubscription(
      subscriptionMapping.stripeSubscriptionId,
      subscriptionMapping.stripeCustomerId,
    );

    const cancelAt = stripeSubscription.cancel_at
      ? new Date(stripeSubscription.cancel_at * 1000)
      : subscription.nextPaymentDate;

    // set Cancelling in subscription record
    await this.update(
      sellerId,
      bevetuSubscriptionId,
      Object.assign(new UpdateSellerSubscriptionDto(), {
        status: 'CANCELLING',
        cancelAt,
      }),
    );

    // Create event record
    await this.subscriptionEventRecordService.create(
      bevetuSubscriptionId,
      Object.assign(new CreateSubscriptionEventRecordDto(), {
        type: 'PENDING_CANCEL',
        metadata: {
          productCode: currentProduct.code,
          cancelReason,
          cancelAt,
        },
      }),
    );

    const pendingcancelMetadata = {
      sellerId,
      bevetuSubscriptionId,
      ...(immedateCancel && { immedateCancel: true }),
    };
    await this.stripeService.addMetadataToSubscription(
      subscriptionMapping.stripeSubscriptionId,
      {
        pending_cancel: JSON.stringify(pendingcancelMetadata),
      },
    );

    return {
      subscriptionCancelAt: cancelAt,
    };
  }

  /**
   *  This is triggered by user to restrore the `cancelling` subscription
   */
  async restoreSubscription(
    sellerId: string,
    bevetuSubscriptionId: string,
  ): Promise<{ nextPaymentDate: Date; nextPaymentAmount: number }> {
    const { subscription, subscriptionMapping, currentProduct } =
      await this.findCurrentSubscriptionAndMapping(
        sellerId,
        bevetuSubscriptionId,
      );

    await this.stripeService.restoreCancellingSubsctipion(
      subscriptionMapping.stripeCustomerId,
      subscriptionMapping.stripeSubscriptionId,
    );

    const { nextPaymentDate, nextPaymentAmount } =
      await this.stripeService.getNextPaymentDetails(
        subscriptionMapping.stripeCustomerId,
        subscriptionMapping.stripeSubscriptionId,
      );

    await this.update(
      sellerId,
      bevetuSubscriptionId,
      Object.assign(new UpdateSellerSubscriptionDto(), {
        status: 'ACTIVE',
        cancelAt: null,
        nextPaymentAmount: nextPaymentDate,
      }),
    );

    // Create event record
    await this.subscriptionEventRecordService.create(
      bevetuSubscriptionId,
      Object.assign(new CreateSubscriptionEventRecordDto(), {
        type: 'RESTORE',
        metadata: {
          productCode: currentProduct.code,
        },
      }),
    );

    await this.stripeService.removeMetadataFromSubscription(
      subscriptionMapping.stripeSubscriptionId,
      'pending_update',
    );

    return { nextPaymentDate, nextPaymentAmount };
  }

  /**
   * @purpose 1) Set the subscription in stripe as `cancel` immediately.
   * Wehbook event 'customer.subscription.deleted' will be triggered.
   * 2) clear the testing subscription in Stripe
   */
  async cancelSubscriptionInStripeImmediately(
    sellerId: string,
    bevetuSubscriptionId: string,
  ): Promise<string> {
    const { subscriptionMapping } =
      await this.findCurrentSubscriptionAndMapping(
        sellerId,
        bevetuSubscriptionId,
      );

    await this.cancellingSubscription(
      sellerId,
      bevetuSubscriptionId,
      'Request to cancel immediately',
      true,
    );

    // When the subscription is cancelled. it will triggered the webhook
    // Then the rest of the procedure will be done by "completeCancelListeningSubscription"
    await this.stripeService.cancelSubscriptionImmediately(
      subscriptionMapping.stripeSubscriptionId,
    );

    return 'Immediately Cancel Triggered';
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
        items: [
          {
            quantity: 1,
            category: 'LISTING_SUBSCRIPTION',
            productCode: productCode,
          },
        ],
      }),
    );

    // Step 2 - Create seller mapping record. Mapping the  subsctipion data of Stripe and self dataabse
    await this.sellerSubscriptionMappingService.create(
      sellerId,
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
            productCode: productCode,
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
      platform: process.env.PLATFORM ?? 'MARKETPLACE',
    });

    return bevetuSubscriptionId;
  }

  /**
   *  @event 'subscritpion update pending'
   *  @condition session.metadata.pending_update exist
   *  @description Trigered by Stripe webhook after user complete the downgrade of subscription
   */
  async completeUpdateListingSubscription(
    sellerId: string,
    bevetuSubscriptionId: string,
    newProductCode: IProductCode,
    newStripeSubscriptionItemId: string,
  ) {
    const { subscription, currentProduct, subscriptionMapping } =
      await this.subscriptionUpdateGuard(
        sellerId,
        bevetuSubscriptionId,
        newProductCode,
      );

    // Step 4 - update the new subscription code id subscription record
    await this.amendSellerSubscriotionItemsProductCodeForListingItemAfterSubscriptionUpdate(
      subscription,
      newProductCode,
    );
    // Step 5 - update the new subscription items id in Mapper
    await this.amendMappingStripeSubscriotionItemsIdForListingItemAfterSubscriptionUpdate(
      subscriptionMapping,
      newStripeSubscriptionItemId,
      newProductCode,
    );

    // Step 6 - update event records
    await this.subscriptionEventRecordService.create(
      bevetuSubscriptionId,
      Object.assign(new CreateSubscriptionEventRecordDto(), {
        type: 'UPDATE',
        metadata: {
          from: currentProduct.code,
          to: newProductCode,
          proration: false,
        },
      }),
    );

    // Step 7 - Remove the "pending_update" metadata in stripe
    await this.stripeService.removeMetadataFromSubscription(
      subscriptionMapping.stripeSubscriptionId,
      'pending_update',
    );

    // Step 8 - Trigger reset the on shelf product function
    const isRegistered = this.eventEmitter.emit(
      'product.usecase.resetProductOnShelfUseCase.event',
      sellerId,
    );
    return isRegistered;
  }

  /**
   *  @event 'customer.subscription.deleted'
   *  @condition paymentSucceededReason === 'subscription_cycle'
   *  @description Trigered when subscription is cancelled in stripe
   *  @example use has cancel_at date is reached.
   *
   *  Updated 25 Jun 2025:
   *  After deleting the subscription in stripe, user will be enrolled in free trial automatically
   *  all the pet account will be inactivated
   */
  async completeCancelListingSubscription(
    sellerId: string,
    bevetuSubscriptionId: string,
    immedateCancel?: boolean,
  ): Promise<string> {
    const { currentProduct, subscriptionMapping } =
      await this.findCurrentSubscriptionAndMapping(
        sellerId,
        bevetuSubscriptionId,
      );

    /** Update current subscription status to "CANCELLED" */
    await this.update(
      sellerId,
      bevetuSubscriptionId,
      Object.assign(new UpdateSellerSubscriptionDto(), {
        status: 'CANCELLED',
        cancelAt: new Date(),
      }),
    );
    /** Add one more event record "CANCELLED" */
    // Create event record
    await this.subscriptionEventRecordService.create(
      bevetuSubscriptionId,
      Object.assign(new CreateSubscriptionEventRecordDto(), {
        type: 'CANCELLED',
        metadata: {
          productCode: currentProduct.code,
        },
      }),
    );

    // If it is immedately cancel. the subscription in stripped has been already removed.
    // remove meta will be error
    if (!immedateCancel) {
      await this.stripeService.removeMetadataFromSubscription(
        subscriptionMapping.stripeSubscriptionId,
        'pending_cancel',
      );
    }
    // here need to trigger sub/pub to deactivate all listing

    return 'Subscription Cancelled';
  }

  /**
   *  @event 'invoice.payment_succeeded'
   *  @condition paymentSucceededReason === 'subscription_cycle'
   *  @description Trigered when subscription is charged successfully in the new billing cycle
   */
  async invoicePaymentSuccessded(
    sellerId: string,
    bevetuSubscriptionId: string,
    payment: {
      paidAmount: number;
      nextPaymentDate: Date;
      nextPaymentAmount: number;
    },
  ): Promise<string> {
    const { currentProduct } = await this.findCurrentSubscriptionAndMapping(
      sellerId,
      bevetuSubscriptionId,
    );
    // Always set the status as active if payment is received
    await this.update(
      sellerId,
      bevetuSubscriptionId,
      Object.assign(new UpdateSellerSubscriptionDto(), {
        status: 'ACTIVE',
        nextPaymentDate: payment.nextPaymentDate,
        cancelAt: null,
      }),
    );

    // Create event record
    await this.subscriptionEventRecordService.create(
      bevetuSubscriptionId,
      Object.assign(new CreateSubscriptionEventRecordDto(), {
        type: 'PAYMENT_SUCCESS',
        metadata: {
          productCode: currentProduct.code,
          paidAt: new Date(),
          paidAmount: payment.nextPaymentAmount,
          nextPaymentDate: payment.nextPaymentDate,
          nextPaymentAmount: payment.nextPaymentAmount,
        },
      }),
    );

    return 'payment successed';
  }

  /**
   *  @event 'invoice.payment_failed'
   *  @condition paymentSucceededReason === 'subscription_cycle'
   *  @description Trigered when subscription is charged successfully in the new billing cycle
   */
  async invoicePaymentFailed(
    sellerId: string,
    bevetuSubscriptionId: string,
    failReason: string,
  ): Promise<string> {
    const { currentProduct } = await this.findCurrentSubscriptionAndMapping(
      sellerId,
      bevetuSubscriptionId,
    );

    // Always set the status as active if payment is received
    await this.update(
      sellerId,
      bevetuSubscriptionId,
      Object.assign(new UpdateSellerSubscriptionDto(), {
        status: 'PAYMENT_FAILED',
        cancelAt: null,
      }),
    );

    // Create event record
    await this.subscriptionEventRecordService.create(
      bevetuSubscriptionId,
      Object.assign(new CreateSubscriptionEventRecordDto(), {
        type: 'PAYMENT_FAILED',
        metadata: {
          productCode: currentProduct.code,
          failReason:
            failReason ?? 'Payment failed. Please verify your card details.',
        },
      }),
    );

    return 'payment failed';
  }
}
