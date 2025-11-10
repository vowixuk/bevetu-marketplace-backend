import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CreateOrderUseCaseDto } from './dto/create-order-use-case.dto';

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
