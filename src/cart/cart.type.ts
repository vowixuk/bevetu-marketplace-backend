import { Cart } from './entities/cart.entity';

export type BuyerViewCurrentCartReturnType = Cart;

export type AddItemToCartReturnType = Cart;

export type UpdateCartItemQtyReturnType = Cart;

export type RemoveItemFromCartReturnType = Cart;

export type RefreshCartReturnType = Cart;

export type BuyerGetShippingCostReturnType = {
  cartTotalShippingFee: number;
  shopShippingFee: {
    shopId: string;
    products: {
      product: { id: string; name: string };
      qty: number;
      shippingFee: number;
    }[];
    totalShippingFee: number;
    freeShippingAmount: number | undefined;
  }[];
};
