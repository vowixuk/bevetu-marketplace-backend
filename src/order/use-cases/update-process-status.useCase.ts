import { Inject, Injectable } from '@nestjs/common';
import { OrderEventRecordService } from '../services/event-record.service';
import { OrderAddressService } from '../services/order-address.service';
import { OrderItemService } from '../services/order-item.service';
import { OrderService } from '../order.service';
import { CartService } from 'src/cart/services/cart.service';
import { OrderStatus } from '../entities/order.entity';

@Injectable()
export class UpdateProcessStatusUseCase {
  constructor(
    private eventRecordsService: OrderEventRecordService,
    private orderAddressService: OrderAddressService,
    private orderItemService: OrderItemService,
    private orderService: OrderService,
    private cartService: CartService,
  ) {}

  async execute(orderId: string, status: OrderStatus) {
    /**
     * step 1 - fetch the order record and update status
     */
    /**
     * Step 4 – Create the order address record.
     */
  }
}
