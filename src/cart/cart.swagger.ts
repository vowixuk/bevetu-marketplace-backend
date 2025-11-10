import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import {
  AddItemToCartDto,
  UpdateItemQtyInCartDto,
  RemoveItemFromCartDto,
  CheckItemsAvailabilityUseCaseDto,
} from './dto';
import {
  AddItemToCartReturnType,
  UpdateCartItemQtyReturnType,
  RemoveItemFromCartReturnType,
  RefreshCartReturnType,
  BuyerGetShippingCostReturnType,
} from './cart.type';

// 🛒 View current cart
export function ApiBuyerViewCurrentCart() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get or create current cart for the buyer',
      description:
        'Retrieves the current un-checked-out cart for the buyer. If none exists, a new one will be created automatically.',
      tags: ['Cart'],
    }),
    ApiResponse({
      status: 200,
      description: 'Current cart successfully retrieved.',
      schema: {
        example: {
          id: 'cart_123',
          isCheckout: false,
          items: [
            {
              id: 'item_1',
              shopId: 'shop_abc',
              cartId: 'cart_123',
              productId: 'prod_123',
              productName: 'T-shirt',
              quantity: 2,
              price: 1999,
              available: true,
            },
          ],
          createdAt: '2025-11-09T15:30:00.000Z',
          updatedAt: '2025-11-09T15:35:00.000Z',
        } as unknown as AddItemToCartReturnType,
      },
    }),
  );
}

// ➕ Add item to cart
export function ApiAddItemToCart() {
  return applyDecorators(
    ApiOperation({
      summary: 'Add an item to the buyer’s cart',
      description:
        'Adds a product to the buyer’s current cart. If the cart does not exist, it will be created.',
      tags: ['Cart'],
    }),
    ApiBody({ type: AddItemToCartDto }),
    ApiResponse({
      status: 200,
      description: 'Item successfully added to the cart.',
      schema: {
        example: {
          id: 'cart_123',
          isCheckout: false,
          items: [
            {
              id: 'item_1',
              shopId: 'shop_abc',
              cartId: 'cart_123',
              productId: 'prod_123',
              productName: 'T-shirt',
              quantity: 2,
              price: 1999,
              available: true,
            },
          ],
          createdAt: '2025-11-09T15:30:00.000Z',
          updatedAt: '2025-11-09T15:35:00.000Z',
        } as unknown as AddItemToCartReturnType,
      },
    }),
  );
}

// ✏️ Update cart item quantity
export function ApiUpdateCartItemQty() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update quantity of an item in the cart',
      description:
        'Updates the quantity of a specific item in the buyer’s cart. Returns the updated cart state.',
      tags: ['Cart'],
    }),
    ApiBody({ type: UpdateItemQtyInCartDto }),
    ApiResponse({
      status: 200,
      description: 'Cart item quantity successfully updated.',
      schema: {
        example: {
          id: 'cart_123',
          isCheckout: false,
          items: [
            {
              id: 'item_1',
              shopId: 'shop_abc',
              cartId: 'cart_123',
              productId: 'prod_123',
              productName: 'T-shirt',
              quantity: 3,
              price: 1999,
              available: true,
            },
          ],
          updatedAt: '2025-11-09T15:40:00.000Z',
        } as unknown as UpdateCartItemQtyReturnType,
      },
    }),
  );
}

export function ApiRemoveItemFromCart() {
  return applyDecorators(
    ApiOperation({
      summary: 'Remove an item from the buyer’s cart',
      description:
        'Removes a specific item from the buyer’s cart if it belongs to the buyer. Returns the updated cart state.',
      tags: ['Cart'],
    }),
    ApiBody({ type: RemoveItemFromCartDto }),
    ApiResponse({
      status: 200,
      description: 'Item successfully removed from the cart.',
      schema: {
        example: {
          id: 'cart_123',
          isCheckout: false,
          items: [],
          updatedAt: '2025-11-09T15:45:00.000Z',
        } as unknown as RemoveItemFromCartReturnType,
      },
    }),
  );
}

// 🔄 Refresh cart
export function ApiRefreshCart() {
  return applyDecorators(
    ApiOperation({
      summary: 'Refresh cart items availability',
      description:
        'Revalidates product availability and prices for all items in the cart. Returns the updated cart.',
      tags: ['Cart'],
    }),
    ApiBody({ type: CheckItemsAvailabilityUseCaseDto }),
    ApiResponse({
      status: 200,
      description: 'Cart successfully refreshed.',
      schema: {
        example: {
          id: 'cart_123',
          isCheckout: false,
          items: [
            {
              id: 'item_1',
              shopId: 'shop_abc',
              productName: 'T-shirt',
              available: true,
            },
          ],
        } as RefreshCartReturnType,
      },
    }),
  );
}

// 🚚 Calculate shipping cost
export function ApiBuyerGetShippingCost() {
  return applyDecorators(
    ApiOperation({
      summary: 'Calculate total and per-shop shipping cost',
      description:
        'Calculates the estimated shipping cost for the buyer’s cart, broken down by shop and product.',
      tags: ['Cart'],
    }),
    ApiParam({
      name: 'cartId',
      type: String,
      required: true,
      description: 'The ID of the buyer’s cart to calculate shipping for.',
    }),
    ApiResponse({
      status: 200,
      description: 'Shipping cost successfully calculated.',
      schema: {
        example: {
          cartTotalShippingFee: 1200,
          shopShippingFee: [
            {
              shopId: 'shop_abc',
              products: [
                {
                  product: { id: 'prod_123', name: 'T-shirt' },
                  qty: 2,
                  shippingFee: 600,
                },
              ],
              totalShippingFee: 600,
              freeShippingAmount: 5000,
            },
            {
              shopId: 'shop_efg',
              products: [
                {
                  product: { id: 'prod_123', name: 'T-shirt' },
                  qty: 6,
                  shippingFee: 6100,
                },
              ],
              totalShippingFee: 6200,
              freeShippingAmount: 52000,
            },
          ],
        } as BuyerGetShippingCostReturnType,
      },
    }),
  );
}
