type OptionalProperties<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

export class User {
  id: string;
  email: string;
  mainId: string;

  createdAt: Date;

  //optional properties
  updatedAt?: Date | null;
  deletedAt?: Date | null;

  constructor(
    init: Omit<User, OptionalProperties<User>> &
      Partial<Pick<User, OptionalProperties<User>>>,
  ) {
    Object.assign(this, init);
  }
}
