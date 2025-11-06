import { CartItem } from './cart-item.entity';
type CartProps = Omit<Cart, 'getTotal' | 'getItemCount'>;
export class Cart {
  id: string;
  buyerId: string;
  isCheckout: boolean;
  items: CartItem[];
  orderId?: string;
  updatedAt?: Date;
  createdAt: Date;

  constructor(init: CartProps) {
    Object.assign(this, init);
  }

  /**
   * Calculate total price of all items in the cart.
   */
  getTotal(): number {
    return this.items.reduce((sum, item) => {
      if (item.available) {
        return sum + item.price * item.quantity;
      }
      return sum;
    }, 0);
  }

  /**
   * Calculate total item count.
   */
  getItemCount(): number {
    return this.items.reduce((count, item) => {
      if (item.available) {
        return count + item.quantity;
      }
      return count;
    }, 0);
  }
}
