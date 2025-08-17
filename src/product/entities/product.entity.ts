import { PetType, ProductType } from './category.vo';

type OptionalProperties<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

export type Variants = {
  id: string;
  name: string;
  additionalPrice: number;
  stock: number;
};

export type Discount = {
  price: number;
  type: 'percentage' | 'fixed';
  date: {
    start: Date;
    end: Date;
  };
};

export type Categories = {
  pet: PetType;
  product: ProductType;
};

export class Product {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;

  tags: string[];
  slug?: string;
  imageUrls: string[];

  /* calculated by the sum of variant */
  stock: number;
  /* this will be used when after payment and order is placed */
  isActive: boolean;
  reservedStock: number;
  isApproved: boolean;

  createdAt: Date;
  updatedAt: Date;

  // Variants (size, color, model, etc.)
  variants: Variants[];

  // Discount Setting
  discount: Discount[];

  // Category
  categories: Categories;

  constructor(
    init: Omit<Product, OptionalProperties<Product>> &
      Partial<Pick<Product, OptionalProperties<Product>>>,
  ) {
    Object.assign(this, init);
  }
}
