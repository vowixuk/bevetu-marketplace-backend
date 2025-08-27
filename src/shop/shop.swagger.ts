import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import {
  CreateShopReturnSchema,
  UpdateShopReturnSchema,
  ViewOneShopReturnSchema,
} from './shop.type';

export function ApiCreateShop() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new shop',
      description:
        'Allows a seller to create a new shop with details such as name, description, country, shop URL, optional website, and additional attributes.',
      tags: ['Shop'],
      deprecated: false,
    }),
    ApiBody({
      type: CreateShopDto,
    }),
    ApiResponse({
      status: 201,
      description: 'Shop successfully created for the seller.',
      schema: {
        example: {
          shopId: '123123',
        } as CreateShopReturnSchema,
      },
    }),
  );
}

export function ApiViewShopByUserId() {
  return applyDecorators(
    ApiOperation({
      summary: 'View shop details',
      description:
        'Fetches detailed information about a shop by userId, including its ID, name, description, seller ID, country, shop URL, attributes, optional website, and timestamps for creation and updates.',
      tags: ['Shop'],
      deprecated: false,
    }),
    ApiResponse({
      status: 200,
      description: 'Returns the shop details.',
      schema: {
        example: {
          id: 'shop_01H8KJ2T6YQZ7X1ABCDEF',
          name: 'My Awesome Shop',
          description:
            'A shop that sells eco-friendly and sustainable products for everyday use.',
          sellerId: 'seller_01H8KJ2T6YQZ7X1ABCDE',
          country: 'US',
          shopUrl: 'my-awesome-shop',
          attributes: {},
          website: 'https://www.myawesomeshop.com',
          createdAt: '2025-08-14T10:00:00.000Z',
          updatedAt: '2025-08-14T12:30:00.000Z',
          deletedAt: null,
        } as unknown as ViewOneShopReturnSchema,
      },
    }),
  );
}

export function ApiViewShop() {
  return applyDecorators(
    ApiOperation({
      summary: 'View shop details',
      description:
        'Fetches detailed information about a specific shop, including its ID, name, description, seller ID, country, shop URL, attributes, optional website, and timestamps for creation and updates.',
      tags: ['Shop'],
      deprecated: false,
    }),
    ApiParam({
      name: 'shopId',
      description: 'The unique identifier of the shop to update.',
      example: 'shop_01H8KJ2T6YQZ7X1ABCDEF',
    }),
    ApiResponse({
      status: 200,
      description: 'Returns the shop details.',
      schema: {
        example: {
          id: 'shop_01H8KJ2T6YQZ7X1ABCDEF',
          name: 'My Awesome Shop',
          description:
            'A shop that sells eco-friendly and sustainable products for everyday use.',
          sellerId: 'seller_01H8KJ2T6YQZ7X1ABCDE',
          country: 'US',
          shopUrl: 'my-awesome-shop',
          attributes: {},
          website: 'https://www.myawesomeshop.com',
          createdAt: '2025-08-14T10:00:00.000Z',
          updatedAt: '2025-08-14T12:30:00.000Z',
          deletedAt: null,
        } as unknown as ViewOneShopReturnSchema,
      },
    }),
  );
}

export function ApiUpdateShop() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update an existing shop',
      description:
        'Allows a seller to update details of their shop such as name, description, country, website, and other attributes. ' +
        'The `shopId` must be provided as a route parameter, and the request body should include the updated shop data.',
      tags: ['Shop'],
      deprecated: false,
    }),
    ApiParam({
      name: 'shopId',
      description: 'The unique identifier of the shop to update.',
      example: 'shop_01H8KJ2T6YQZ7X1ABCDEF',
    }),
    ApiBody({
      type: UpdateShopDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Shop successfully updated.',
      schema: {
        example: {
          message: 'updated',
        } as UpdateShopReturnSchema,
      },
    }),
  );
}
