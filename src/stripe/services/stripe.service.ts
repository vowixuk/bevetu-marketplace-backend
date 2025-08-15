import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { TestEnvironmentGuard } from 'src/share/guards/testing-environmet.guard';
import { CreateAccountSessionDto } from 'src/seller/dto/create-account-session.dto';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2025-07-30.basil',
    });
  }

  /**
   *  Create a stripe account for user/buyer
   */
  async createStripeCustomer(
    userId: string,
    email: string,
    platform?: string,
  ): Promise<Stripe.Customer> {
    return await this.stripe.customers.create({
      email,
      metadata: {
        userId,
        ...(platform ? { platform } : {}),
      },
    });
  }

  /* (End) ----- Stripe Onboarding ----- (End) */
  /**/
  /**/
  /**/
  /**/
  /**/

  /* *********************************************************************
   *                   ----- Subscription Management -----
   * The following methods are for seller onboarding use
   * *********************************************************************/

  async createCheckoutSession(
    userId: string,
    email: string,
    stripePriceId: string,
    createCheckoutSessionDto: CreateCheckoutSessionDto,
  ): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    try {
      const customer = await this.createStripeCustomer(userId, email);
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: stripePriceId,
            quantity: createCheckoutSessionDto.seatNo,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.SUCCESS_URL}?src=payment_success`,
        cancel_url: process.env.CANCEL_URL,
        allow_promotion_codes: true,
        metadata: {
          email,
          userId,
          productCode: createCheckoutSessionDto.productCode,
          seatNo: createCheckoutSessionDto.seatNo,
          action: 'SUBSCRIPTION',
        },
        customer: customer.id,
      });

      return session;
    } catch (error) {
      this.stripeException(error);
    }
  }

  /**
   *  This function is to enroll a customer into a subscription for a given price.
   */
  async enrollSubscription(
    stripeCustomerId: string,
    priceId: string,
  ): Promise<Stripe.Response<Stripe.Subscription>> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: priceId }],
        expand: ['latest_invoice.payment_intent'],
      });

      return subscription;
    } catch (error) {
      this.stripeException(error);
    }
  }

  /**
   *  Change a subscription with proration.
   *  Immediate effect; customer is charged or credited for the difference in price.
   *
   *  @param stripeSubscriptionId - The ID of the subscription to change.
   *  @param newPriceId - The Stripe Price ID to apply.
   *  @returns The updated subscription object with proration applied.
   */
  async changeSubscriptionWithProrateEffectImmediately(
    stripeSubscriptionId: string,
    newPriceId: string,
  ): Promise<Stripe.Response<Stripe.Subscription>> {
    try {
      const subscription =
        await this.stripe.subscriptions.retrieve(stripeSubscriptionId);

      const updatedSubscription = await this.stripe.subscriptions.update(
        stripeSubscriptionId,
        {
          items: [
            {
              id: subscription.items.data[0].id,
              price: newPriceId,
            },
          ],
          proration_behavior: 'create_prorations', // immediate proration
          expand: ['latest_invoice.payment_intent'],
        },
      );

      return updatedSubscription;
    } catch (error) {
      this.stripeException(error);
    }
  }

  /**
   *  Change a subscription without proration.
   *  No immediate charge or credit; new price is applied in the next billing cycle.
   *
   *  @param stripeSubscriptionId - The ID of the subscription to change.
   *  @param newPriceId - The Stripe Price ID to apply.
   *  @returns The updated subscription object effective next cycle.
   */
  async changeSubscriptionWithoutProrateEffectNextCycle(
    stripeSubscriptionId: string,
    newPriceId: string,
  ): Promise<Stripe.Response<Stripe.Subscription>> {
    try {
      const subscription =
        await this.stripe.subscriptions.retrieve(stripeSubscriptionId);

      const updatedSubscription = await this.stripe.subscriptions.update(
        stripeSubscriptionId,
        {
          items: [
            {
              id: subscription.items.data[0].id,
              price: newPriceId,
            },
          ],
          proration_behavior: 'none', // no immediate charge or credit
          billing_cycle_anchor: 'unchanged', // change takes effect next cycle
        },
      );

      return updatedSubscription;
    } catch (error) {
      this.stripeException(error);
    }
  }

  /**
   *  This function get the proation amount to pay
   *  before user confirm the payment of adding seat number
   */
  async previewProrationAmount(
    previewProrationAmountDto: PreviewProrationAmountDto,
  ): Promise<{
    prorationDate: Date | null;
    nextPaymentDate: Date | null;
    totalRefund: number | null;
    totalCharge: number | null;
    nextPaymentQty: number | null;
    nextPaymentAmount: number | null;
  }> {
    // Step 1: Retrieve the subscription from Stripe
    const subscription = await this.stripe.subscriptions.retrieve(
      previewProrationAmountDto.stripeSubscriptionId,
    );

    // Step 2: Check if the customer ID matches the expected owner
    // This is step is to make sure update the subscription for the correct customer
    if (subscription.customer !== previewProrationAmountDto.stripeCustomerId) {
      throw new ForbiddenException(
        'This subscription does not belong to the correct owner.',
      );
    }
    const invoice = await this.stripe.invoices.retrieveUpcoming({
      customer: previewProrationAmountDto.stripeCustomerId,
      subscription: previewProrationAmountDto.stripeSubscriptionId,
      subscription_items: [
        {
          id: previewProrationAmountDto.stripeSubscriptionItemId,
          quantity: previewProrationAmountDto.newSeatNo,
        },
      ],
      subscription_proration_date: Math.floor(Date.now() / 1000),
    });

    const { data } = invoice.lines;

    const refundLines = data.filter(
      (item) =>
        item.proration === true &&
        item.amount < 0 &&
        item.type === 'invoiceitem',
    );

    const prorationChargeLines = data.filter(
      (item) =>
        item.proration === true &&
        item.amount > 0 &&
        item.type === 'invoiceitem',
    );
    const nextBillingLines = data.filter(
      (item) => item.proration === false && item.type === 'subscription',
    );

    const totalRefund =
      refundLines.reduce((sum, item) => sum + item.amount, 0) / 100;
    const totalCharge =
      prorationChargeLines.reduce((sum, item) => sum + item.amount, 0) / 100;
    return {
      prorationDate:
        new Date(invoice.subscription_proration_date * 1000) ?? null,
      nextPaymentDate: new Date(invoice.next_payment_attempt * 1000) ?? null,
      totalRefund: totalRefund ?? null,
      totalCharge: totalCharge ?? null,
      nextPaymentQty: nextBillingLines[0].quantity ?? null,
      nextPaymentAmount: nextBillingLines[0].amount / 100,
    };
  }

  async addMetadataToSubscription(
    stripeSubscriptionId,
    newMetadata: {
      [key: string]: string;
    },
  ): Promise<Stripe.Response<Stripe.Subscription>> {
    try {
      return await this.stripe.subscriptions.update(stripeSubscriptionId, {
        metadata: newMetadata,
      });
    } catch (error) {
      this.stripeException(error);
    }
  }

  async removeMetadataFromSubscription(
    stripeSubscriptionId,
    keyToRemove: string,
  ): Promise<Stripe.Response<Stripe.Subscription>> {
    try {
      const metadataUpdate = { [keyToRemove]: null };
      return await this.stripe.subscriptions.update(stripeSubscriptionId, {
        metadata: metadataUpdate,
      });
    } catch (error) {
      this.stripeException(error);
    }
  }

  /**
   *  This function is the set the Stripe subscription's
   *  end date to the end of the current billing period
   */
  async cancelSubscription(
    stripeSubscriptionId: string,
    stripeCustomerId: string,
  ): Promise<Stripe.Response<Stripe.Subscription>> {
    const subscription =
      await this.stripe.subscriptions.retrieve(stripeSubscriptionId);

    // Step 2: Check if the customer ID matches the expected owner
    if (subscription.customer !== stripeCustomerId) {
      throw new ForbiddenException(
        'This subscription does not belong to the correct owner.',
      );
    }
    try {
      return await this.stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    } catch (error) {
      this.stripeException(error);
    }
  }

  /**
   *  This function is to restore the "cancel status" when the subscription is
   *  pending to be cancelled in next billing cycle
   */
  async restoreCancellingSubsctipion(
    stripeSubscriptionId: string,
    stripeCustomerId: string,
  ) {
    const subscription =
      await this.stripe.subscriptions.retrieve(stripeSubscriptionId);

    if (subscription.customer !== stripeCustomerId) {
      throw new ForbiddenException(
        'This subscription does not belong to the correct owner.',
      );
    }
    try {
      return await this.stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: false,
      });
    } catch (error) {
      this.stripeException(error);
    }
  }

  /**
   * This function cancels a Stripe subscription immediately.
   *
   * It terminates the subscription at once, regardless of the
   * remaining time in the billing cycle. The customer will no
   * longer be billed, and access to subscription benefits will
   * end immediately.
   *
   */
  async cancelSubscriptionImmediately(
    stripeSubscriptionId: string,
  ): Promise<Stripe.Response<Stripe.Subscription>> {
    try {
      return await this.stripe.subscriptions.cancel(stripeSubscriptionId);
    } catch (error) {
      this.stripeException(error);
    }
  }

  // async getNextPaymentDetails(
  //   stripeCustomerId: string,
  // ): Promise<{ nextPaymentDate: Date; nextPaymentAmount: number }> {
  //   try {
  //     const upcomingInvoice = await this.stripe.invoices.retrieveUpcoming({
  //       customer: stripeCustomerId,
  //     });

  //     const nextPaymentDate = new Date(upcomingInvoice.created * 1000); // Convert timestamp to Date object
  //     const nextPaymentAmount = upcomingInvoice.amount_due / 100; // Amount is in cents, convert to dollars
  //     return {
  //       nextPaymentDate: nextPaymentDate,
  //       nextPaymentAmount: nextPaymentAmount,
  //     };
  //   } catch (error) {
  //     this.stripeException(error);
  //   }
  // }
  /* (End) ----- Subscription Management ----- (End) */
  /**/
  /**/
  /**/
  /**/
  /**/
  /* *********************************************************************
   *                   ----- Webhook  -----
   * The following methods are for seller onboarding use
   * *********************************************************************/
  // Method to construct the event from the raw body and signature
  constructWebhookEvent(
    buf: Buffer,
    sig: string,
    webhookSecret: string,
  ): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (error) {
      console.log(error, '<< error');
      this.stripeException(error);
    }
  }
  /* (End) ----- Webhook ----- (End) */
  /**/
  /**/
  /**/
  /**/
  /**/
  /**/
  /**/
  /**/
  /**/
  /**/
  /* *********************************************************************
   *                   ----- Stripe Onboarding -----
   * The following methods are for seller onboarding use
   * *********************************************************************/
  /**
   *  Create a connected account for sellers
   */
  async createAccount(country: string) {
    try {
      const account = await this.stripe.accounts.create({
        controller: {
          stripe_dashboard: {
            type: 'none',
          },
          fees: {
            payer: 'application',
          },
          losses: {
            payments: 'application',
          },
          requirement_collection: 'application',
        },
        capabilities: {
          card_payments: {
            requested: true,
          },
          transfers: { requested: true },
        },
        country,
      });

      return account;
    } catch (error: any) {
      console.error('Error creating Stripe account:', error);
      throw new InternalServerErrorException('Failed to create Stripe account');
    }
  }
  /**
   * Checks if a seller is fully onboarded
   */
  async checkIsSellerFullyOnBoarded(sellerAccountId: string): Promise<boolean> {
    const account = await this.stripe.accounts.retrieve(sellerAccountId);

    if (!account.requirements) {
      throw new InternalServerErrorException(
        'Unable to fetch data from Stripe',
      );
    }

    const isFullyOnboarded =
      account.requirements.currently_due?.length === 0 &&
      account.requirements.past_due?.length === 0 &&
      account.requirements.disabled_reason === null;

    return isFullyOnboarded;
  }
  /** (End) ----- Stripe Onboarding ----- (End)*/
  /**/
  /**/
  /**/
  /**/
  /**/
  /**/
  /**/
  /**/
  /**/
  /* *********************************************************************
   *                   ----- Stripe Connect UI -----
   * The following methods request Embeded UI components from Stripe Connect,
   * primarily for displaying the Stripe Seller Dashboard.
   *
   * After add/remove the functions below, remember to update the key list
   * /src/stripe/entities/stripe-connect-ui-session-keys.vo.ts
   *
   * Make sure each route below is protected with
   * @UseGuards(seller) to restrict access to authorized sellers only.
   * *********************************************************************/

  /**
   * Onboarding
   * Stripe Docs:
   * https://docs.stripe.com/connect/onboarding/quickstart?lang=node&connect-onboarding-surface=embedded&connect-dashboard-type=none&connect-economic-model=buy-rate&connect-loss-liability-owner=platform&connect-charge-type=destination#init-stripe
   */
  async createOnBoardSession(createAccountSessionDto: CreateAccountSessionDto) {
    const accountSession = await this.stripe.accountSessions.create({
      account: createAccountSessionDto.accountId,
      components: {
        account_onboarding: { enabled: true },
      },
    });

    return { client_secret: accountSession.client_secret };
  }

  /**
   * Account Management
   * Stripe Docs:
   * https://docs.stripe.com/connect/supported-embedded-components/account-management
   */
  async createAccountManagementSession(
    createAccountSessionDto: CreateAccountSessionDto,
  ) {
    const accountSession = await this.stripe.accountSessions.create({
      account: createAccountSessionDto.accountId,
      components: {
        account_management: {
          enabled: true,
          features: {
            external_account_collection: true,
          },
        },
      },
    });

    return { client_secret: accountSession.client_secret };
  }

  /**
   * Notification Banner
   * Stripe Docs:
   * https://docs.stripe.com/connect/supported-embedded-components/notification-banner
   */
  async createNotificationBannerSession(
    createAccountSessionDto: CreateAccountSessionDto,
  ) {
    const accountSession = await this.stripe.accountSessions.create({
      account: createAccountSessionDto.accountId,
      components: {
        notification_banner: {
          enabled: true,
          features: {
            external_account_collection: true,
          },
        },
      },
    });

    return { client_secret: accountSession.client_secret };
  }

  /**
   * Payment Details
   */
  async createPaymentDetailsSession(
    createAccountSessionDto: CreateAccountSessionDto,
  ) {
    const accountSession = await this.stripe.accountSessions.create({
      account: createAccountSessionDto.accountId,
      components: {
        payment_details: {
          enabled: true,
          features: {
            refund_management: true,
            dispute_management: true,
            capture_payments: true,
            destination_on_behalf_of_charge_management: true,
          },
        },
      },
    });
    return { client_secret: accountSession.client_secret };
  }
  /**
   * Payment Disputes
   * Stripe Docs:
   * https://stripe.com/docs/connect/supported-embedded-components/payment-disputes
   */
  async createPaymentDisputesSession(
    createAccountSessionDto: CreateAccountSessionDto,
  ) {
    const accountSession = await this.stripe.accountSessions.create({
      account: createAccountSessionDto.accountId,
      components: {
        payment_disputes: {
          enabled: true,
          features: {
            refund_management: true,
            dispute_management: true,
            destination_on_behalf_of_charge_management: false,
          },
        },
      },
    });

    return { client_secret: accountSession.client_secret };
  }

  /**
   * Disputes List
   * Stripe Docs:
   * https://stripe.com/docs/connect/supported-embedded-components/disputes-list
   */
  async createDisputesListSession(
    createAccountSessionDto: CreateAccountSessionDto,
  ) {
    const accountSession = await this.stripe.accountSessions.create({
      account: createAccountSessionDto.accountId,
      components: {
        disputes_list: {
          enabled: true,
          features: {
            refund_management: true,
            dispute_management: true,
            capture_payments: true,
            destination_on_behalf_of_charge_management: false,
          },
        },
      },
    });

    return { client_secret: accountSession.client_secret };
  }

  /**
   * Payouts
   * Stripe Docs:
   * https://stripe.com/docs/connect/supported-embedded-components/payouts
   */
  async createPayoutsSession(createAccountSessionDto: CreateAccountSessionDto) {
    const accountSession = await this.stripe.accountSessions.create({
      account: createAccountSessionDto.accountId,
      components: {
        payouts: {
          enabled: true,
          features: {
            instant_payouts: true,
            standard_payouts: true,
            edit_payout_schedule: true,
            external_account_collection: true,
          },
        },
      },
    });

    return { client_secret: accountSession.client_secret };
  }

  /**
   * Payouts List
   * Stripe Docs:
   * https://stripe.com/docs/connect/supported-embedded-components/payouts-list
   */
  async createPayoutsListSession(
    createAccountSessionDto: CreateAccountSessionDto,
  ) {
    const accountSession = await this.stripe.accountSessions.create({
      account: createAccountSessionDto.accountId,
      components: {
        payouts_list: {
          enabled: true,
        },
      },
    });

    return { client_secret: accountSession.client_secret };
  }

  /**
   * Balances
   * Stripe Docs:
   * https://stripe.com/docs/connect/supported-embedded-components/balances
   */
  async createBalancesSession(
    createAccountSessionDto: CreateAccountSessionDto,
  ) {
    const accountSession = await this.stripe.accountSessions.create({
      account: createAccountSessionDto.accountId,
      components: {
        balances: {
          enabled: true,
          features: {
            instant_payouts: true,
            standard_payouts: true,
            edit_payout_schedule: true,
            external_account_collection: true,
          },
        },
      },
    });

    return { client_secret: accountSession.client_secret };
  }
  /** (End) ----- Stripe Connect UI -----  (End)*/
  /**/
  /**/
  /**/
  /**/
  /**/
  /**/
  /**/
  /**/
  /**/

  /* *********************************************************************
   *                        ----- Testing use -----
   * The following methods are intended exclusively for testing purposes.
   *
   * They are specifically designed to modify datafor testing scenarios
   * and to clean up test data generated during end-to-end (e2e) testing.
   *
   * !!! THESE ROUTES MUST NEVER BE USED IN A PRODUCTION ENVIRONMENT !!!
   *
   * Ensure that each route below is secured with
   * @UseGuards(TestEnvironmentGuard) to restrict access.
   * **********************************************************************/

  @UseGuards(TestEnvironmentGuard)
  async createTestClock(): Promise<
    Stripe.Response<Stripe.TestHelpers.TestClock>
  > {
    return await this.stripe.testHelpers.testClocks.create({
      frozen_time: Math.floor(Date.now() / 1000),
    });
  }
  /**
   * @caution Testing Only. Do not use in production
   * @purpose create `Stripe Customer` record Stripe
   */
  @UseGuards(TestEnvironmentGuard)
  async createStripeCustomerWithTestClock(
    userId: string,
    email: string,
  ): Promise<Stripe.Customer> {
    /*
     * A test clock is added when creating a user in the testing environment.
     * This allows us to simulate and verify if webhook events related to
     * payments are triggered when the billing cycle is reached.
     */
    const testClock = await this.createTestClock().catch(() => null);
    return await this.stripe.customers.create({
      email,
      metadata: {
        userId,
      },
      ...(testClock ? { test_clock: testClock.id } : {}),
    });
  }
  /** (End) ----- Testing use ----- (End)*/
  /**/
  /**/
  /**/
  /**/
  /**/
  /**/
  /**/
  /**/
  /**/
  /**/

  /**
   *  This function update seat/user no with proration.
   *  This is used when user want to add more seats.
   *  For reduction of seat number, use `updateSeatNoWithoutProration`.
   */
  // async updateSeatNoWithProration(
  //   updateSeatNumberDto: UpdateSeatNumberDto,
  // ): Promise<Stripe.Subscription> {
  //   const {
  //     stripeSubscriptionId,
  //     stripeSubscriptionItemId,
  //     newSeatNo,
  //     stripeCustomerId,
  //   } = updateSeatNumberDto;
  //   try {
  //     // Step 1: Retrieve the subscription from Stripe
  //     const subscription =
  //       await this.stripe.subscriptions.retrieve(stripeSubscriptionId);

  //     // Step 2: Check if the customer ID matches the expected owner
  //     // This is step is to make sure update the subscription for the correct customer
  //     if (subscription.customer !== stripeCustomerId) {
  //       throw new ForbiddenException(
  //         'This subscription does not belong to the correct owner.',
  //       );
  //     }
  //     return await this.stripe.subscriptions.update(stripeSubscriptionId, {
  //       items: [
  //         {
  //           id: stripeSubscriptionItemId,
  //           quantity: newSeatNo,
  //         },
  //       ],
  //       proration_behavior: 'always_invoice',
  //       cancel_at_period_end: false,
  //     });
  //   } catch (error) {
  //     this.stripeException(error);
  //   }
  // }

  /**
   *  This function update seat/user no without proration.
   *  This is used when user want to reduce seats
   *  No proration if using this update method.
   *  So that the update will only be effective in next billing cycyle
   *  For additon of seat number, use "updateSeatNoWithProration".
   */
  // async updateSeatNoWithoutProration(
  //   updateSeatNumberDto: UpdateSeatNumberDto,
  // ): Promise<Stripe.Subscription> {
  //   const {
  //     stripeSubscriptionId,
  //     stripeSubscriptionItemId,
  //     newSeatNo,
  //     stripeCustomerId,
  //   } = updateSeatNumberDto;
  //   try {
  //     // Step 1: Retrieve the subscription from Stripe
  //     const subscription =
  //       await this.stripe.subscriptions.retrieve(stripeSubscriptionId);

  //     // Step 2: Check if the customer ID matches the expected owner
  //     if (subscription.customer !== stripeCustomerId) {
  //       throw new ForbiddenException(
  //         'This subscription does not belong to the correct owner.',
  //       );
  //     }
  //     return await this.stripe.subscriptions.update(stripeSubscriptionId, {
  //       items: [
  //         {
  //           id: stripeSubscriptionItemId,
  //           quantity: newSeatNo,
  //         },
  //       ],
  //       proration_behavior: 'none',
  //       billing_cycle_anchor: 'unchanged',
  //       cancel_at_period_end: false,
  //     });
  //   } catch (error) {
  //     this.stripeException(error);
  //   }
  // }

  /**
   *  This method is to find and set the default payment method of customer
   *  It is important as we can charge the customer automatically
   *  without directing them to payment page again
   */
  // private async findCustomerPaymentMethod(
  //   stripeCustomerId: string,
  // ): Promise<string> {
  //   // Get the payment method from customers object
  //   const customer = await this.stripe.customers.retrieve(stripeCustomerId);

  //   let paymentMethodId: string | null = null;

  //   // Check if the customer is not deleted and has invoice_settings
  //   if (customer && !('deleted' in customer)) {
  //     paymentMethodId =
  //       (customer.invoice_settings?.default_payment_method as string) || null;
  //   }

  //   // if payment method not set, fetch from "paymentMethod"
  //   if (!paymentMethodId) {
  //     const paymentMethods = await this.stripe.paymentMethods.list({
  //       customer: stripeCustomerId as string,
  //       type: 'card',
  //     });

  //     if (paymentMethods.data.length === 0) {
  //       throw new Error('No payment method found for customer');
  //     }

  //     paymentMethodId = paymentMethods.data[0].id;

  //     // set this payment method as the default for future charges
  //     // so we don't need to use "paymentMethodId" to fetch it next time.
  //     await this.stripe.customers.update(stripeCustomerId, {
  //       invoice_settings: {
  //         default_payment_method: paymentMethodId,
  //       },
  //     });
  //   }

  //   return paymentMethodId;
  // }

  // async findStripeCustomerBillingDetails(
  //   stripeCustomerId: string,
  // ): Promise<IBillingDetails> {
  //   /**
  //    * Get the current subscription
  //    * There's only one active subscription
  //    */
  //   const subscriptions = await this.stripe.subscriptions.list({
  //     customer: stripeCustomerId,
  //     status: 'active',
  //     limit: 1,
  //   });

  //   if (subscriptions.data.length === 0) {
  //     throw new NotFoundException('No subscription found');
  //   }

  //   /**
  //    * Get the Invoice of the current subscription data
  //    */
  //   const invoices = await this.stripe.invoices.list({
  //     subscription: subscriptions.data[0].id,
  //   });
  //   if (invoices.data.length == 0) {
  //     throw new NotFoundException('No Invoices Found');
  //   }

  //   /**
  //    * Get the paymentIntentice of the currentInvoice
  //    */
  //   const currentInvoice = invoices.data[0];
  //   const paymentIntent = await this.stripe.paymentIntents.retrieve(
  //     currentInvoice.payment_intent as string,
  //   );

  //   /**
  //    *  Get the payment method
  //    */
  //   const paymentMethod = await this.stripe.paymentMethods.retrieve(
  //     paymentIntent.payment_method as string,
  //   );

  //   if (paymentMethod.type !== 'card') {
  //     throw new BadRequestException('Not p[ay by card');
  //   }
  //   const card = paymentMethod.card;
  //   const billingDetails = paymentMethod.billing_details;

  //   /**
  //    * Get the Customer data
  //    */
  //   const getCustomer = await this.stripe.customers.retrieve(stripeCustomerId);
  //   if (getCustomer.deleted) {
  //     throw new BadRequestException('The customer has been deleted');
  //   }

  //   const customer = getCustomer as Stripe.Customer;
  //   const billiongDetails: IBillingDetails = {
  //     email: customer.email,
  //     billingAddress: {
  //       city: billingDetails.address.city || null,
  //       country: billingDetails.address.country || null,
  //       line1: billingDetails.address.line1 || null,
  //       line2: billingDetails.address.line2 || null,
  //       postal_code: billingDetails.address.postal_code || null,
  //       state: billingDetails.address.state || null,
  //     },
  //     billingPersonalDetails: {
  //       email: billingDetails.email || null,
  //       name: billingDetails.name || null,
  //       phone: billingDetails.phone || null,
  //     },
  //     card: {
  //       brand: card.brand,
  //       exp_month: card.exp_month,
  //       exp_year: card.exp_year,
  //       last4: card.last4,
  //     },
  //   };
  //   return billiongDetails;
  // }

  private stripeException(error: any): never {
    if (error instanceof Stripe.errors.StripeCardError) {
      // Payment issues like fraud or declined cards
      throw new HttpException(
        `Payment error: ${error.message}`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    } else if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      // Invalid request or incorrect parameters
      throw new HttpException(
        `Invalid request: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    } else if (error instanceof Stripe.errors.StripeConnectionError) {
      // Network issues between your server and Stripe
      throw new HttpException(
        `Connection error: ${error.message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else if (error instanceof Stripe.errors.StripeAPIError) {
      // Errors on Stripe's side
      throw new HttpException(
        `API error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else if (error instanceof Stripe.errors.StripeAuthenticationError) {
      // Invalid API keys or authentication issues
      throw new HttpException(
        `Authentication error: ${error.message}`,
        HttpStatus.UNAUTHORIZED,
      );
    } else if (error instanceof Stripe.errors.StripeIdempotencyError) {
      // Idempotency key issues
      throw new HttpException(
        `Idempotency error: ${error.message}`,
        HttpStatus.CONFLICT,
      );
    } else if (error instanceof Stripe.errors.StripePermissionError) {
      // Permissions issues with the API key
      throw new HttpException(
        `Permission error: ${error.message}`,
        HttpStatus.FORBIDDEN,
      );
    } else if (error instanceof Stripe.errors.StripeRateLimitError) {
      // Too many API calls
      throw new HttpException(
        `Rate limit error: ${error.message}`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    } else if (
      error instanceof Stripe.errors.StripeSignatureVerificationError
    ) {
      // Webhook signature verification failed
      throw new HttpException(
        `Signature verification error: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    } else {
      // Unknown error
      throw new HttpException(
        `Unknown error: ${JSON.stringify(error) || 'An unknown error occurred'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
