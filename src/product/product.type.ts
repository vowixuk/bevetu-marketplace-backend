import { Product } from './entities/product.entity';

export type safeProduct = Omit<Product, 'sellerId'>;

export type CreateProductReturnSchema = {
  message: string;
};

export type SetProductOnShelfReturnSchema = {
  message: string;
};

export type UpdateProductReturnSchema = {
  message: string;
};

export type ViewProductListReturnSchema = {
  products: safeProduct[];
  currentPage: number; // current page of this return
  limit: number; // no of record in this return
  totalRecords: number; // Total number record in the database
  totalPages: number; // Total page
  start: number; // This return start from x record.
  end: number; // This return end to y record.
  next: string | null; // url of next page
  prev: string | null; // url of previous page
};

export type ResetProductOnShelfReturnSchema = {
  message: string;
};

export type SellerViewProductReturnSchema = safeProduct;

export type SafeProductForPublic = Omit<
  Product,
  'reservedStock' | 'isApproved' | 'onShelf' | 'sellerId'
>;
export type ViewFilteredProductReturnSchema = {
  products: SafeProductForPublic[];

  currentPage: number; // current page of this return
  limit: number; // no of record in this return
  totalRecords: number; // Total number record in the database
  totalPages: number; // Total page
  start: number; // This return start from x record.
  end: number; // This return end to y record.
  next: string | null; // url of next page
  prev: string | null; // url of previous page
};

export type GetUploadProductPresignUrlReturnSchema = { url: string };
