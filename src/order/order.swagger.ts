import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateOrderUseCaseDto } from './dto/create-order-use-case.dto';
import { BuyerViewAllDto } from './dto/buyer-view-all.dto';

export function ApiBuyerCheckout() {
  return applyDecorators(
    ApiOperation({
      summary: 'Initiate Stripe Checkout for Buyer Order',
      description:
        'Creates a Stripe Checkout session for the current buyer based on the cart and order address information. ' +
        'Returns a Stripe Checkout URL that the frontend can redirect the user to for payment.',
      tags: ['Order'],
    }),
    ApiBody({
      type: CreateOrderUseCaseDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Stripe Checkout session URL successfully created.',
      schema: {
        example: 'https://checkout.stripe.com/pay/cs_test_1234567890abcdef',
      },
    }),
  );
}
export function ApiBuyerViewAll() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buyer View All Orders',
      description:
        'Returns a paginated list of all orders owned by the authenticated buyer. ' +
        'Results can be sorted by latest or oldest based on the query parameter.',
      tags: ['Order'],
    }),
    ApiBody({
      type: BuyerViewAllDto,
    }),
    ApiResponse({
      status: 200,
      description:
        'Successfully returned paginated list of buyer-owned orders.',
      schema: {
        example: {
          orders: [
            {
              id: 'order_123',
              shopId: 'shop_456',
              cartId: 'cart_789',
              totalAmount: 150.0,
              shippingFee: 10.0,

              discount: 5.0,
              currency: 'USD',
              paymentStatus: 'SUCCESS',
              paymentMethod: 'CARD',
              orderStatus: 'PROCESSING',
              createdAt: '2025-01-01T12:00:00.000Z',
              updatedAt: '2025-01-02T12:00:00.000Z',
              remark: 'Leave at front door',
              orderAddress: {
                id: 'addr_123',
                orderId: 'order_123',
                buyerId: 'buyer_456',
                fullName: 'John Doe',
                phoneNumber: '+1234567890',
                line1: '123 Main St',
                line2: 'Apt 4B',
                city: 'New York',
                state: 'NY',
                postalCode: '10001',
                country: 'USA',
              },
            },
          ],
          currentPage: 1,
          limit: 10,
          totalRecords: 45,
          totalPages: 5,
          start: 1,
          end: 10,
          next: '/orders?page=2&limit=10',
          prev: null,
        },
      },
    }),
  );
}

export function ApiBuyerViewOne() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buyer View One Order',
      description:
        'Returns a single order owned by the authenticated buyer. ' +
        'If the order is not owned by the buyer, an error will be returned.',
      tags: ['Order'],
    }),
    ApiParam({
      name: 'orderId',
      required: true,
      description: 'The unique identifier of the order.',
      schema: { type: 'string' },
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully returned the buyer-owned order.',
      schema: {
        example: {
          id: 'order_123',
          shopId: 'shop_456',
          cartId: 'cart_789',
          totalAmount: 150.0,
          shippingFee: 10.0,
          discount: 5.0,
          currency: 'USD',
          paymentStatus: 'SUCCESS',
          paymentMethod: 'CARD',
          orderStatus: 'DELIVERED',
          createdAt: '2025-01-01T12:00:00.000Z',
          updatedAt: '2025-01-05T12:00:00.000Z',
          remark: 'Leave at front door',
          orderAddress: {
            id: 'addr_123',
            orderId: 'order_123',
            buyerId: 'buyer_456',
            fullName: 'John Doe',
            phoneNumber: '+1234567890',
            line1: '123 Main St',
            line2: 'Apt 4B',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA',
          },
          items: [
            {
              id: 'item_1',
              orderId: 'order_123',
              shopId: 'shop_456',
              productId: 'prod_789',
              varientId: 'var_101',
              productName: 'Wireless Mouse',
              quantity: 2,
              price: 50.0,
              shippingFee: 5.0,
              discount: 0.0,
              refundedQuantity: 0,
              refundedAmount: 0,
              refundStatus: 'NONE',
              createdAt: '2025-01-01T12:00:00.000Z',
              updatedAt: '2025-01-01T12:00:00.000Z',
              attributes: { color: 'black' },
              remark: 'Gift wrap',
            },
          ],
        },
      },
    }),
  );
}
