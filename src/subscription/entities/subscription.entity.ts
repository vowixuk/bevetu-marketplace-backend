import { EventRecord, EventRecordType } from './event-record.entity';
import { IProductCode } from './product.vo';

export type OptionalProperties<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

export type SubscriptionStatusType =
  /**
   * The subscription is still effective
   */
  | 'ACTIVE'

  /**
   * The subscription is cancelling. Subscription will be effective untill the end of the subscription period
   */
  | 'CANCELLING'

  /**
   * The subscription is completely cancelled. Subscription is not effective anymore
   */
  | 'CANCELLED'

  /**
   * Billing Error. Subscription is not effective untill payment is made.
   */
  | 'PAYMENT_FAILED'

  /**
   * Free Trial expired. The Subscription in not effective
   */
  | 'FREE_TRIAL_EXPIRED';

export class Subscription {
  id: string;
  userId: string;
  productCode: IProductCode;
  nextPaymentDate: Date;
  status: SubscriptionStatusType;
  createdAt: Date;

  //optional properties
  eventRecords?: EventRecord<EventRecordType>[] | null;
  updatedAt?: Date | null;
  cancelAt?: Date | null;

  constructor(
    init: Omit<Subscription, OptionalProperties<Subscription>> &
      Partial<Pick<Subscription, OptionalProperties<Subscription>>>,
  ) {
    Object.assign(this, init);
  }
}




// const tiers = [
//   'BRONZE',
//   'SILVER',
//   'GOLD',
//   'PLATINUM',
//   'DIAMOND',
//   'ENTERPRISE',
// ] as const;
// const modes = ['MONTHLY', 'ANNUAL'] as const;
// const currencies = ['GBP', 'USD', 'HKD'] as const;

// async function ensureProducts() {
//   for (const tier of tiers) {
//     for (const mode of modes) {
//       for (const currency of currencies) {
//         const code = `${tier}_${mode}_${currency}`;
//         const envPriceIdKey = `${code}_STRIPE_PRICE_ID`;
//         const envPriceKey = `${code}_PRICE`;

//         // Skip if price ID already exists
//         if (process.env[envPriceIdKey]) {
//           console.log(
//             `${code} already exists with priceId ${process.env[envPriceIdKey]}`,
//           );
//           continue;
//         }

//         const priceAmount = Number(process.env[envPriceKey]);
//         if (!priceAmount) {
//           console.warn(`Price not set in .env for ${code}, skipping creation`);
//           continue;
//         }

//         // Create Stripe Product
//         const product = await stripe.products.create({
//           name: `${tier} ${mode.toLowerCase()} ${currency}`,
//           description: `${tier} plan - ${mode.toLowerCase()} billing - ${currency}`,
//         });

//         // Create Stripe Price
//         const price = await stripe.prices.create({
//           product: product.id,
//           unit_amount: priceAmount * 100, // smallest currency unit
//           currency: currency.toLowerCase(),
//           recurring: { interval: mode.toLowerCase() as 'month' | 'year' },
//         });

//         console.log(
//           `Created ${code}: productId=${product.id}, priceId=${price.id}`,
//         );
//         // Optional: you could update your .env file here automatically
//       }
//     }
//   }
// }
