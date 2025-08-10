type OptionalProperties<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

export type sellerStatausType = 'ACTIVE' | 'DELETED' | 'SUSPENDED';

export class Seller {
  id: string;
  userId: string;
  email: string;

  status: sellerStatausType;

  attributes: Record<string, any>;
  createdAt: Date;

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
