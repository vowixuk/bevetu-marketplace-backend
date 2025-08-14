import {
  Injectable,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { TestEnvironmentGuard } from 'src/guards/testing-environmet.guard';
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
}
