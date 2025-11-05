import { Inject, Injectable } from '@nestjs/common';
import { OrderEventRecordService } from '../services/event-record.service';
import { OrderAddressService } from '../services/order-address.service';
import { OrderItemService } from '../services/order-item.service';
import { OrderService } from '../order.service';
import { CartService } from 'src/cart/services/cart.service';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private eventRecordsService: OrderEventRecordService,
    private orderAddressService: OrderAddressService,
    private orderItemService: OrderItemService,
    private orderService: OrderService,
    private cartService: CartService,
  ) {}

  async execute(cartId: string) {
    /**
     * step 1 - fetch the cart item out
     */
    /**
     * Step 2 – Create the order record and obtain its ID.
     *          Initialize the order with a `PENDING` payment status,
     *          which will be updated to `SUCCESS` after payment confirmation.
     */
    /**
     * Step 3 – Create the associated order items.
     */
    /**
     * Step 4 – Create the order address record.
     */
    /**
     * Step 5 – Create the initial order event record.
     */
    /**
     * Step 6 – redirect to Stripe payment page
     */
  }
}
