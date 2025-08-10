type OptionalProperties<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

export class Shop {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  country: string;
  shopUrl: string; // bevetu market url
  website?: string; // shop own url
  attributes: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  constructor(
    init: Omit<Shop, OptionalProperties<Shop>> &
      Partial<Pick<Shop, OptionalProperties<Shop>>>,
  ) {
    Object.assign(this, init);
  }
}
