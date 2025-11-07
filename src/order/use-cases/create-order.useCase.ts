import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderEventRecordService } from '../services/event-record.service';
import { OrderAddressService } from '../services/order-address.service';
import { OrderItemService } from '../services/order-item.service';
import { OrderService } from '../services/order.service';
import { StripeService } from '../../stripe/services/stripe.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { CalculateShippingFeeUseCase } from '../../cart/use-cases/calculate-shipping-fee.useCase';
import { OrderPaymentStatus, OrderStatus } from '../entities/order.entity';
import { CreateOrderItemDto } from '../dto/create-order-item.dto';
import { CreateOrderAddressDto } from '../dto/create-order-address.dto';
import { CreateOrderEventRecordDto } from '../dto/create-event-record.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { CheckItemsAvailabilityUseCase } from '../../cart/use-cases/check-items-availability.useCase';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private eventRecordsService: OrderEventRecordService,
    private orderAddressService: OrderAddressService,
    private orderItemService: OrderItemService,
    private orderService: OrderService,
    private stripeService: StripeService,
    private calculateShippingFeeUseCase: CalculateShippingFeeUseCase,
    private checkItemsAvailabilityUseCase: CheckItemsAvailabilityUseCase,
  ) {}

  async execute(
    buyerId: string,
    cartId: string,
    createOrderAddressDto: CreateOrderAddressDto,
    promotionCode?: string,
  ) {
    /**
     * step 1 - fetch the cart item out with CheckItemsAvailabilityUseCase to make sure all the product are up to date
     */
    const cart = await this.checkItemsAvailabilityUseCase.execute(
      buyerId,
      cartId,
    );

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
    const shippingFee = await this.calculateShippingFeeUseCase.execute(cart);

    const order = await this.orderService.buyerCreateOrder(
      buyerId,
      Object.assign(new CreateOrderDto(), {
        buyerId,
        sellerId: '',
        shopId: '',
        cartId: cart.id,
        totalAmount: cart.getTotal(),
        shippingFee: shippingFee.cartTotalShippingFee,
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

    const lineItemForStripeCheckout: {
      name: string;
      unitAmount: number;
      quantity: number;
      shopId: string;
    }[] = [];
    const createOrderItemDtos: CreateOrderItemDto[] = [];
    for (const item of cart.items) {
      createOrderItemDtos.push(
        Object.assign(new CreateOrderItemDto(), {
          refundStatus: 'None',
          discount: 0,
          shippingFee: shippingFee.cartTotalShippingFee,
          price: item.price,
          quantity: item.quantity,
          productName: item.productName,
          productId: item.productId,
          shopId: item.shopId,
          orderId: order.id,
        }),
      );

      lineItemForStripeCheckout.push({
        name: item.productName,
        unitAmount: item.price * 100,
        quantity: item.quantity,
        shopId: item.shopId,
      });
    }

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
          totalAmount: shippingFee.cartTotalShippingFee + cart.getTotal(),
          currency: 'GBP',
          paymentMethod: 'Stripe',
          itemCount: cart.getItemCount(),
        },
      }),
    );

    /**
     * Step 6 – redirect to Stripe payment page
     */
    const { url, id: stripeSessionId } =
      await this.stripeService.createBuyerCheckoutSession({
        items: lineItemForStripeCheckout,
        shippingFee: shippingFee.cartTotalShippingFee,
        currency: 'GBP',
        successUrl: process.env.BUYER_CHECKOUT_SUCCESS_URL || '',
        cancelUrl: process.env.BUYER_CHECKOUT_CANCEL_URL || '',
        orderId: order.id,
        buyerId,
        promotionCode,
      });

    /**
     *  Step 7 - save the session id
     */
    await this.orderService.update(
      order.id,
      Object.assign(new UpdateOrderDto(), {
        stripeSessionId,
      }),
    );

    return url;
  }
}
