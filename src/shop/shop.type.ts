import { Shop } from './entities/shop.entity';

export type CreateShopReturnSchema = {
  shopId: string;
};

export type ViewOneShopReturnSchema = Omit<Shop, 'sellerId'>;

export type UpdateShopReturnSchema = { message: string };
