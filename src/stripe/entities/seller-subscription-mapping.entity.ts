import { IProductCode } from '../../sellerSubscription/entities/vo/product.vo';

export type OptionalProperties<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];
/**
 * Maps a seller's subscription ID in Bevetu to their subscription ID in Stripe.
 * It also include seller's stripe customer account.
 * ⚠️ Note: This does NOT map to the seller’s Stripe account.
 * For seller account mapping, see `SellerStripeAccountMapping`.
 */
export class SellerSubscriptionMapping {
  id: string;
  /* bevetu data */
  sellerId: string;
  bevetuSubscriptionId: string;

  /* mapping key */
  // This is a must-have property inorder to link
  // the bevetu account data to the third party account
  // Normally it will be the account ID  (e.g. stripeCustomerId)of the third party
  identifyId: string;

  /* third party customer data */
  // these can be changed if no longer using stripe for payment.
  // eg: paypalCustomerId.. etc
  // We can adopt the same `SubscriptionMapping` structure for integration
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripeSubscriptionItems: StripeSubscriptionItems[]; // it can have more then one item  under the same subscription

  createdAt: Date;

  constructor(
    init: Omit<
      SellerSubscriptionMapping,
      OptionalProperties<SellerSubscriptionMapping>
    > &
      Partial<
        Pick<
          SellerSubscriptionMapping,
          OptionalProperties<SellerSubscriptionMapping>
        >
      >,
  ) {
    Object.assign(this, init);
  }
}

export type StripeSubscriptionItems = {
  stripItemId: string;
  quantity: number;
  category: 'LISTING_PLAN';
  name: IProductCode;
};
