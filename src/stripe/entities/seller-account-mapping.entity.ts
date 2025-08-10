type OptionalProperties<T> = {
  [K in keyof T]: undefined extends T[K] ? K : never;
}[keyof T];

export class SellerStripeAccountMapping {
  id: string;
  sellerId: string;
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
