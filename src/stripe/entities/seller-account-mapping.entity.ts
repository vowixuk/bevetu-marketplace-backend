type OptionalProperties<T> = {
  [K in keyof T]: undefined extends T[K] ? K : never;
}[keyof T];

/**
 *  This file defines the mapping between seller account IDs in Bevetu and Stripe.
 *
 *  ⚠️ Note: This maps **SELLER accounts** in Bevetu to **SELLER accounts** in Stripe.
 *  It does NOT map customer accounts in Stripe.
 *
 *  For customer accounts in Stripe, see `SellerSubscriptionMapping`,
 *  which stores the subscription records for each seller’s listings.
 *  The Stripe customer ID for a seller’s subscription can be found there.
 */
export class SellerStripeAccountMapping {
  id: string;
  sellerId: string;
  userId: string;
  stripeAccountId: string;
  identifyId: string;
  createdAt: Date;

  constructor(
    init: Omit<
      SellerStripeAccountMapping,
      OptionalProperties<SellerStripeAccountMapping>
    > &
      Partial<
        Pick<
          SellerStripeAccountMapping,
          OptionalProperties<SellerStripeAccountMapping>
        >
      >,
  ) {
    Object.assign(this, init);
  }
}
