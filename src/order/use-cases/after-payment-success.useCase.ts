import { Injectable } from '@nestjs/common';
import { OrderEventRecordService } from '../services/event-record.service';
import { OrderService } from '../services/order.service';
import { CartService } from '../../cart/services/cart.service';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { CreateOrderEventRecordDto } from '../dto/create-event-record.dto';
@Injectable()
export class AfterPaymentSuccessUseCase {
  constructor(
    private eventRecordsService: OrderEventRecordService,
    private orderService: OrderService,
    private cartService: CartService,
  ) {}

  async execute(
    orderId: string,
    currency: string,
    totalAmount: number,
    discountAmount: number,
    transactionNo?: string,
    invoiceUrl?: string,
  ) {
    /**
     * step 1 - fetch the order record
     */
    const order = await this.orderService.fineOne(orderId);

    /**
     * Step 2 – Update order status to 'SUCCESS'
     */
    await this.orderService.update(
      order.id,
      Object.assign(new UpdateOrderDto(), {
        paymentStatus: 'SUCCESS',
      }),
    );

    /**
     * Step 3 – update cart's `orderId` and `unchecked` to false
     */
    await this.cartService.setCheckoutDone(
      order.buyerId,
      order.cartId,
      orderId,
    );

    /**
     * Step 4 – update order event record 'PAYMENT_SUCCESS'
     */
    await this.eventRecordsService.create(
      Object.assign(new CreateOrderEventRecordDto(), {
        orderId: order.id,
        type: 'PAYMENT_SUCCESS',
        metadata: {
          totalAmount,
          discountAmount,
          currency,
          transactionNo: transactionNo ?? null,
          invoiceUrl: invoiceUrl ?? null,
        },
      }),
    );
  }
}
