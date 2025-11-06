import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderEventRecordService } from '../services/event-record.service';
import { OrderAddressService } from '../services/order-address.service';
import { OrderItemService } from '../services/order-item.service';
import { OrderService } from '../services/order.service';
import { CartService } from 'src/cart/services/cart.service';
import { StripeService } from 'test/helper/testing-module';
import { CreateOrderDto } from '../dto/create-order.dto';
import { CalculateShippingFeeUseCase } from '../../cart/use-cases/calculate-shipping-fee.useCase';
import { OrderPaymentStatus, OrderStatus } from '../entities/order.entity';
import { CreateOrderItemDto } from '../dto/create-order-item.dto';
import { CreateOrderAddressDto } from '../dto/create-order-address.dto';
import { CreateOrderEventRecordDto } from '../dto/create-event-record.dto';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private eventRecordsService: OrderEventRecordService,
    private orderAddressService: OrderAddressService,
    private orderItemService: OrderItemService,
    private orderService: OrderService,
    private cartService: CartService,
    private stripeService: StripeService,
    private calculateShippingFeeUseCase: CalculateShippingFeeUseCase,
  ) {}

  async execute(
    buyerId: string,
    cartId: string,
    createOrderAddressDto: CreateOrderAddressDto,
  ) {
    /**
     * step 1 - fetch the cart item out
     */
    const cart = await this.cartService.findOneIfOwned(buyerId, cartId);

    if (!cart) {
      throw new BadRequestException('Cart not found');
    }
    if (cart.isCheckout) {
      throw new BadRequestException('This cart has been checked out');
    }
    /**
     * Step 2 – Create the order record and obtain its ID.
     *          Initialize the order with a `PENDING` payment status,
     *          which will be updated to `SUCCESS` after payment confirmation.
     */
    const shippingFee: number = await this.calculateShippingFeeUseCase.execute(
      buyerId,
      cartId,
    );

    const order = await this.orderService.buyerCreateOrder(
      buyerId,
      Object.assign(new CreateOrderDto(), {
        buyerId,
        sellerId: '',
        shopId: '',
        cartId: cart.id,
        totalAmount: cart.getTotal(),
        shippingFee,
        discount: 0,
        currency: 'GBP',
        paymentStatus: 'PENDING' as OrderPaymentStatus,
        paymentMethod: 'Stripe',
        orderStatus: 'CREATED' as OrderStatus,
      }),
    );

    /**
     * Step 3 – Create the associated order items.
     */
    const createOrderItemDtos = cart.items.map((item) => {
      return Object.assign(new CreateOrderItemDto(), {
        refundStatus: 'None',
        discount: 0,
        shippingFee: 0,
        price: 0,
        quantity: item.quantity,
        productName: item.productName,
        productId: item.productId,
        shopId: item.shopId,
        orderId: order.id,
      });
    });

    await this.orderItemService.createMany(createOrderItemDtos);

    /**
     * Step 4 – Create the order address record.
     */
    createOrderAddressDto.orderId = order.id;
    await this.orderAddressService.create(createOrderAddressDto);

    /**
     * Step 5 – Create the initial order event record.
     */
    await this.eventRecordsService.create(
      Object.assign(new CreateOrderEventRecordDto(), {
        orderId: order.id,
        type: 'CREATE',
        metadata: {
          totalAmount: shippingFee + cart.getTotal(),
          currency: 'GBP',
          paymentMethod: 'Stripe',
          itemCount: cart.getItemCount(),
        },
      }),
    );

    /**
     * Step 6 – redirect to Stripe payment page
     */
  }
}
