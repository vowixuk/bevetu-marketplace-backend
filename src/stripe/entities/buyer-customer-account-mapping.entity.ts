type OptionalProperties<T> = {
  [K in keyof T]: undefined extends T[K] ? K : never;
}[keyof T];

export class BuyerStripeCustomerAccountMapping {
  id: string;
  buyerId: string;
  stripeCustomerId: string;
  identifyId: string;
  createdAt: Date;

  constructor(
    init: Omit<
      BuyerStripeCustomerAccountMapping,
      OptionalProperties<BuyerStripeCustomerAccountMapping>
    > &
      Partial<
        Pick<
          BuyerStripeCustomerAccountMapping,
          OptionalProperties<BuyerStripeCustomerAccountMapping>
        >
      >,
  ) {
    Object.assign(this, init);
  }
}
