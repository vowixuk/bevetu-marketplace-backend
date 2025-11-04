import { CartItem } from './cart-item.entity';
type CartProps = Omit<Cart, 'getTotal' | 'getItemCount'>;
export class Cart {
  id: string;
  buyerId: string;
  isCheckout: boolean; // if this cart id checkedout, set true
  items: CartItem[];
  orderId?: string; // only after checkkout
  updatedAt?: Date;
  createdAt: Date;

  constructor(init: CartProps) {
    Object.assign(this, init);
  }

  /**
   * Calculate total price of all items in the cart.
   */
  getTotal(): number {
    return this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  }

  /**
   * Calculate total item count.
   */
  getItemCount(): number {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }
}
