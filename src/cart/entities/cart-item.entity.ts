type CartItemProps = Omit<CartItem, 'getTotal'>;
export class CartItem {
  id: string;
  shopId: string;
  cartId: string;
  productId: string;
  varientId: string;
  quantity: number;
  price: number;

  constructor(init: CartItemProps) {
    Object.assign(this, init);
  }

  getTotal(): number {
    return this.price * this.quantity;
  }
}
