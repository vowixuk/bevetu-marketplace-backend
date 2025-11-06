import { Inject, Injectable } from '@nestjs/common';
import { OrderEventRecordService } from '../services/event-record.service';
import { OrderAddressService } from '../services/order-address.service';
import { OrderItemService } from '../services/order-item.service';
import { OrderService } from '../order.service';
import { CartService } from 'src/cart/services/cart.service';

@Injectable()
export class AfterPaymentSuccessUseCase {
  constructor(
    private eventRecordsService: OrderEventRecordService,
    private orderAddressService: OrderAddressService,
    private orderItemService: OrderItemService,
    private orderService: OrderService,
    private cartService: CartService,
  ) {}

  async execute(orderId: string) {
    /**
     * step 1 - fetch the order record
     */
    /**
     * Step 2 – Update order status to 'SUCCESS'
     */
    /**
     * Step 3 – update cart's `orderId` and `unchecked` to false
     */
    /**
     * Step 4 – update order event record 'PAYMENT_SUCCESS'
     */
  }
}
