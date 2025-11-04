type CartItemProps = Omit<CartItem, 'getTotal'>;
export class CartItem {
  id: string;
  shopId: string;
  cartId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  available: boolean;
  varientId?: string;
  unavailableReason?: string;

  constructor(init: CartItemProps) {
    Object.assign(this, init);
  }

  getTotal(): number {
    return this.price * this.quantity;
  }
}
