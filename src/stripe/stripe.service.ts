import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
  async createAccountSession(account: any) {
    try {
      const accountSession = await this.stripe.accountSessions.create({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        account: account,
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
}
