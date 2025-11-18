/**
 * To run this test solely:
 * npm run seed:stripe
 */

import 'dotenv/config';
import Stripe from 'stripe';
import { Products } from '../seller-subscription/entities/vo/product.vo';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

async function seedProducts() {
  // Create a single Stripe Product
  const stripeProduct = await stripe.products.create({
    name: 'Seller Listing Subscriptions',
    description: 'All subscription tiers for seller listings',
  });

  const tiers = [
    'BRONZE',
    'SILVER',
    'GOLD',
    'PLATINUM',
    'DIAMOND',
    'ENTERPRISE',
  ] as const;
  const tierData: Record<
    string,
    {
      listingNo: number;
      prices: Record<string, { amount: number; stripeId: string }>;
    }
  > = {};

  for (const tier of tiers) {
    // Pick any product for listingNo
    const sampleProduct = Object.values(Products).find((p) =>
      p.code.startsWith(tier),
    )!;
    tierData[tier] = { listingNo: sampleProduct.listingNo, prices: {} };

    // Create Stripe Prices for all currency/mode combinations in this tier
    const productsForTier = Object.values(Products).filter((p) =>
      p.code.startsWith(tier),
    );

    for (const product of productsForTier) {
      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id, // all prices under the same product
        unit_amount: Math.round(product.price * 100),
        currency: product.currency.toLowerCase(),
        recurring:
          product.mode === 'MONTHLY'
            ? { interval: 'month' }
            : { interval: 'year' },
      });

      tierData[tier].prices[product.currency] = {
        amount: product.price,
        stripeId: stripePrice.id,
      };
      console.log(`✅ Created price for ${product.code} -> ${stripePrice.id}`);
    }
  }

  // Print .env-style output
  console.log('\n# Stripe Product & Price Configuration');
  for (const tier in tierData) {
    console.log(`\n# ${tier}`);
    const data = tierData[tier];
    for (const currency in data.prices) {
      const { amount, stripeId } = data.prices[currency];
      console.log(`${tier}_MONTHLY_${currency}_PRICE=${amount}`);
      console.log(`${tier}_MONTHLY_${currency}_STRIPE_PRICE_ID=${stripeId}`);
    }
    console.log(`${tier}_LISTING_NO=${data.listingNo}`);
  }
}



// Run seeder
// seedProducts()
//   .then(() => console.log('✅ Stripe product seeding completed!'))
//   .catch((err) => console.error('❌ Seeding failed:', err));
