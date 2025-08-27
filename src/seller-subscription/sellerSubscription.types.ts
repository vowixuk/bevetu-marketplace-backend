// import { IProduct, IProductCode } from './entities/product.vo';
// import { Subscription } from './entities/subscription.entity';

import { SellerSubscription } from './entities/seller-subscription.entity';
import { IProductCode } from './entities/vo/product.vo';

export type CreatelistingSubscriptionPaymentLinkReturnSchema = {
  paymentLink: string;
};

export type PreviewProrationAmountkReturnSchema = {
  prorationPeriod: {
    start: Date | null;
    end: Date | null;
  } | null;
  nextPaymentPeriod: {
    start: Date | null;
    end: Date | null;
  } | null;
  totalRefund: number | null;
  totalCharge: number | null;
  nextPaymentQty: number | null;
  nextPaymentAmount: number | null;
};

export type UpdateListingSubscriptionReturnSchema = {
  message: string;
  productCode: IProductCode;
  paidAt: Date;
  totalRefund: number | null;
  totalCharge: number | null;
  nextPaymentDate: Date | null | undefined;
  nextPaymentAmount: number | null;
};

export type DowngradeListingSubscriptionReturnSchema = {
  message: string;
  nextPaymentDate: Date;
  nextPaymentAmount: number;
};

export type CancelListingSubscriptionReturnSchema = {
  subscriptionCancelAt: Date;
};

export type RestoreListingSubscriptionReturnSchema = {
  message: string;
  nextPaymentDate: Date;
  nextPaymentAmount: number;
};

export type ViewUserActiveSubscriptionReturnSchema = Omit<
  SellerSubscription,
  'id' | 'sellerId'
>;

// export type ChangeSeatNoReturnSchema = NextPaymentDetails;
// export type CancelSubscriptionReturnSchema = { subscriptionCancelAt: Date };
// export type RatestoreSubscriptionReturnSchema = NextPaymentDetails;
// export type ViewAllproductsReturnSchema = Record<
//   IProductCode,
//   Omit<IProduct, 'code' | 'stripePriceId' | 'display'>
// >;
// export type ViewAllproductsIncludingTestProductsReturnSchema = Record<
//   IProductCode,
//   Omit<IProduct, 'code' | 'stripePriceId' | 'display'>
// >;

// export type ViewUserActiveSubscriptionReturnSchema = Subscription;

// export type ViewUserAllSubscriptionsReturnSchema = Omit<
//   Subscription,
//   'userId'
// >[];
// export type ViewUserRecentSubscriptionReturnSchema = Omit<
//   Subscription,
//   'userId'
// >;
// export type EnrollFreeTrialReturnSchema = {
//   id: string;
//   freeTrialExpiryDate: Date;
// };

// export type UpdateReturnSchema = {
//   message: string;
// };

// export type PreviewProrationReturnSchema = {
//   prorationDate: Date | null;
//   nextPaymentDate: Date | null;
//   totalRefund: number | null;
//   totalCharge: number | null;
//   nextPaymentQty: number | null;
//   nextPaymentAmount: number | null;
// };

// export type NextPaymentDetails = {
//   nextPaymentDate: Date;
//   nextPaymentAmount: number;
// };
