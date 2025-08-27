export type ViewStripeSubscriptionReturnSchema = {
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripeSubscriptionItemId: string;
  amount: number;
  currency: string;
  quantity: number;
  metadata: any;
};

export type DeleteStripeSubscriptionReturnSchema = {
  message: 'deleted';
};

export type DeleteStripeCustomerReturnSchema = {
  message: 'deleted';
};
