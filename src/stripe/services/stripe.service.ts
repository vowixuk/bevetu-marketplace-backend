import {
  Injectable,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { TestEnvironmentGuard } from 'src/guards/testing-environmet.guard';
import { CreateAccountSessionDto } from 'src/seller/dto/create-account-session.dto';
import Stripe from 'stripe';

/**
 * https://docs.stripe.com/connect/onboarding/quickstart?lang=node&connect-onboarding-surface=embedded&connect-dashboard-type=none&connect-economic-model=buy-rate&connect-loss-liability-owner=platform&connect-charge-type=destination#init-stripe
 */

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2025-07-30.basil',
    });
  }

  /**
   * Embed the seller account to the marketpplace.
   * This session create an embedded component in the bevetu marketplace frontend seller
   */
  async createAccountSession(createAccountSessionDto: CreateAccountSessionDto) {
    try {
      const accountSession = await this.stripe.accountSessions.create({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        account: createAccountSessionDto.accountId,
        components: {
          account_onboarding: { enabled: true },
        },
      });

      return { client_secret: accountSession.client_secret };
    } catch (error) {
      console.error('Stripe API error:', error);
      throw new InternalServerErrorException(
        'Failed to create Stripe account session',
      );
    }
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
}
