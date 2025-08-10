type OptionalProperties<T> = {
  [K in keyof T]: undefined extends T[K] ? K : never;
}[keyof T];

export class BuyerStripeAccountMapping {
  id: string;
  userId: string;
  stripeCustomerId: string;
  identifyId: string;
  createdAt: Date;

  constructor(
    init: Omit<
      BuyerStripeAccountMapping,
      OptionalProperties<BuyerStripeAccountMapping>
    > &
      Partial<
        Pick<
          BuyerStripeAccountMapping,
          OptionalProperties<BuyerStripeAccountMapping>
        >
      >,
  ) {
    Object.assign(this, init);
  }
}
