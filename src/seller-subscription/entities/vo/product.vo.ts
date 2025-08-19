export interface IFeature {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface IProduct {
  name: string;
  code: IProductCode;
  description: string;
  features: IFeature[];
  price: number;
  currency: 'USD' | 'GBP' | 'HKD';
  mode: 'ANNUAL' | 'MONTHLY';
  stripePriceId: string;
  /**
   * display in production
   */
  display: boolean;
  listingNo: number;
}

/** Listing Plan code */
export type IProductCode =
  | 'BRONZE_MONTHLY_HKD'
  | 'BRONZE_MONTHLY_USD'
  | 'BRONZE_MONTHLY_GBP'
  | 'SILVER_MONTHLY_HKD'
  | 'SILVER_MONTHLY_USD'
  | 'SILVER_MONTHLY_GBP'
  | 'GOLD_MONTHLY_HKD'
  | 'GOLD_MONTHLY_USD'
  | 'GOLD_MONTHLY_GBP'
  | 'PLATINUM_MONTHLY_HKD'
  | 'PLATINUM_MONTHLY_USD'
  | 'PLATINUM_MONTHLY_GBP'
  | 'DIAMOND_MONTHLY_HKD'
  | 'DIAMOND_MONTHLY_USD'
  | 'DIAMOND_MONTHLY_GBP'
  | 'ENTERPRISE_MONTHLY_HKD'
  | 'ENTERPRISE_MONTHLY_USD'
  | 'ENTERPRISE_MONTHLY_GBP';
// | 'BRONZE_ANNUAL_HKD'
// | 'BRONZE_ANNUAL_USD'
// | 'BRONZE_ANNUAL_GBP'
// | 'SILVER_ANNUAL_HKD'
// | 'SILVER_ANNUAL_USD'
// | 'SILVER_ANNUAL_GBP'
// | 'GOLD_ANNUAL_HKD'
// | 'GOLD_ANNUAL_USD'
// | 'GOLD_ANNUAL_GBP'
// | 'PLATINUM_ANNUAL_HKD'
// | 'PLATINUM_ANNUAL_USD'
// | 'PLATINUM_ANNUAL_GBP'
// | 'DIAMOND_ANNUAL_HKD'
// | 'DIAMOND_ANNUAL_USD'
// | 'DIAMOND_ANNUAL_GBP'
// | 'ENTERPRISE_ANNUAL_HKD'
// | 'ENTERPRISE_ANNUAL_USD'
// | 'ENTERPRISE_ANNUAL_GBP';

export const Products: Record<IProductCode, IProduct> = (() => {
  const obj = {} as Record<IProductCode, IProduct>;

  const tiers = [
    'BRONZE',
    'SILVER',
    'GOLD',
    'PLATINUM',
    'DIAMOND',
    'ENTERPRISE',
  ] as const;
  const modes = ['MONTHLY'] as const;
  const currencies = ['GBP', 'USD', 'HKD'] as const;

  tiers.forEach((tier) => {
    modes.forEach((mode) => {
      currencies.forEach((currency) => {
        const code = `${tier}_${mode}_${currency}` as IProductCode;

        // Get price from env variables
        const priceEnv = process.env[`${code}_PRICE`];
        const stripeId = process.env[`${code}_STRIPE_PRICE_ID`] || '';
        const listingNoEnv = process.env[`${tier}_LISTING_NO`] || '';

        if (!priceEnv) {
          console.warn(`Price not found for ${code} in .env`);
        }

        obj[code] = {
          name: `${tier} ${mode.toLowerCase()} ${currency}`,
          code,
          description: `${tier} plan - ${mode.toLowerCase()} billing - ${currency}`,
          features: [],
          price: priceEnv ? Number(priceEnv) : 0,
          currency,
          mode: mode as 'MONTHLY' | 'ANNUAL',
          stripePriceId: stripeId,
          display: true,
          listingNo: listingNoEnv ? Number(listingNoEnv) : 0,
        };
      });
    });
  });

  return obj;
})();
