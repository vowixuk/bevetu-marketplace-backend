import { Shop } from './entities/shop.entity';

export type CreateShopReturnSchema = {
  shopId: string;
};

export type ViewOneShopReturnSchema = Shop;

export type UpdateShopReturnSchema = { message: string };
