import { Order } from './entities/order.entity';

export type PublicOrder = Omit<
  Order,
  'buyerId' | 'sellerId' | 'eventRecords' | 'items' | 'carrierId'
>;

export type PaginationResponse = {
  orders: PublicOrder[];
  currentPage: number; // current page of this return
  limit: number; // no of record in this return
  totalRecords: number; // Total number record in the database
  totalPages: number; // Total page
  start: number; // This return start from x record.
  end: number; // This return end to y record.
  next: string | null; // url of next page
  prev: string | null; // url of previous page
};

export type BuyerViewAllType = PaginationResponse;

export type BuyerViewOneType = Omit<Order, 'buyerId' | 'sellerId'>;
