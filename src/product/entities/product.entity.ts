type OptionalProperties<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

export type Variants = {
  id: string;
  name: string;
  additionalPrice?: number;
  stock: number;
};

export type Discount = {
  price?: number;
  type?: 'percentage' | 'fixed';
  dstart?: Date;
  end?: Date;
};

export class Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  reservedStock?: number;
  isActive: boolean;
  isApproved?: boolean;
  imageUrls?: string[];
  sellerId: string;
  categoryId?: string;
  tags?: string[];
  slug?: string;
  createdAt: Date;
  updatedAt: Date;

  // Variants (size, color, model, etc.)
  variants?: Variants[];

  // Discount Setting
  discount?: Discount[];

  // Ratings / Reviews
  averageRating?: number;
  reviewCount?: number;

  constructor(
    init: Omit<Product, OptionalProperties<Product>> &
      Partial<Pick<Product, OptionalProperties<Product>>>,
  ) {
    Object.assign(this, init);
  }
}
