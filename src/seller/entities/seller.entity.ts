type OptionalProperties<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

export class Seller {
  id: string;
  email: string;

  /* Bvt main app id */
  mainId: string;

  state: 'ACTIVE' | 'DELETED' | 'SUSPENDED';

  createdAt: Date;

  stripeConnectedAccountId: string;
  stripeOnboardingCompleted: boolean;

  defaultCurrency: string;
  country: string;

  //optional properties
  updatedAt?: Date | null;
  deletedAt?: Date | null;

  constructor(
    init: Omit<Seller, OptionalProperties<Seller>> &
      Partial<Pick<Seller, OptionalProperties<Seller>>>,
  ) {
    Object.assign(this, init);
  }
}
