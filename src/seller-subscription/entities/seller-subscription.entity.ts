/* eslint-disable prettier/prettier */
import {
  SubscriptionEventRecord,
  EventRecordType,
} from './event-record.entity';
import { IProductCode } from './vo/product.vo';
import { SubscriptionStatusType } from './vo/subscription-status.vo';

export type OptionalProperties<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

export class SellerSubscription {
  id: string;
  sellerId: string;
  nextPaymentDate: Date;
  status: SubscriptionStatusType;
  items: subscriptionItems[];
  createdAt: Date;

  eventRecords?: SubscriptionEventRecord<EventRecordType>[];
  //optional properties
  updatedAt?: Date | null;
  cancelAt?: Date | null;

  constructor(
    init: Omit<SellerSubscription, OptionalProperties<SellerSubscription>> &
      Partial<Pick<SellerSubscription, OptionalProperties<SellerSubscription>>>,
  ) {
    Object.assign(this, init);
  }
}


export type subscriptionItems = {
  quantity: number;
  category: 'LISTING_SUBSCRIPTION';
  name: IProductCode;
};


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
