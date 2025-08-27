import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CreateSellerShippingProfileDto } from './dto/create-seller-shipping-profile.dto';
import {
  CreateShippingProfileRetrunSchema,
  FindAllShippingProfilesByShippingIdRetrunSchema,
  FindOneShippingProfileRetrunSchema,
  RemoveShippingProfileRetrunSchema,
  UpdateShippingProfileRetrunSchema,
} from './seller-shipping.type';
import {
  FindAllProfilesByShippingIdDto,
  FindOneProfileDto,
  UpdateSellerShippingProfileDto,
} from './dto';

export function ApiCreateShippingProfile() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new shipping profile',
      description:
        'Creates a shipping profile for a seller, including fee type, origin, delivery times, and optional settings such as buyer pickup and supported regions.',
      deprecated: false,
      tags: ['Seller Shipping'],
    }),
    ApiBody({
      type: CreateSellerShippingProfileDto,
    }),
    ApiResponse({
      status: 201,
      description: 'Shipping profile successfully created.',
      schema: {
        example: {
          message: 'created',
        } as CreateShippingProfileRetrunSchema,
      },
    }),
  );
}

export function ApiFindAllShippingProfilesByShippingId() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all shipping profiles by Seller Shipping ID',
      description:
        'Fetches all shipping profiles associated with a given seller shipping ID. ' +
        'The returned profiles exclude the sellerId field for public consumption.',
      tags: ['Seller Shipping'],
      deprecated: false,
    }),
    ApiQuery({
      type: FindAllProfilesByShippingIdDto,
      name: 'shippingId',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'List of shipping profiles successfully retrieved.',
      schema: {
        example: [
          {
            id: 'profile_123',
            shopId: 'shop_456',
            sellerShippingId: 'ship_123456789',
            name: 'Standard Shipping',
            feeType: 'flat',
            feeAmount: 10,
            currency: 'USD',
            originCountry: 'US',
            originZip: '10001',
            buyerPickUp: false,
            buyerPickUpLocation: null,
            supportedRegions: ['US', 'CA'],
            estimatedDeliveryMinDays: 3,
            estimatedDeliveryMaxDays: 5,
            createdAt: '2025-08-27T00:00:00.000Z',
            updatedAt: '2025-08-27T00:00:00.000Z',
          },
        ] as unknown as FindAllShippingProfilesByShippingIdRetrunSchema,
      },
    }),
  );
}

export function ApiFindOneShippingProfile() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Get a single shipping profile by Seller Shipping ID and Profile ID',
      description:
        'Fetches a single shipping profile associated with a given seller shipping ID and profile ID. ' +
        'The returned profile is sanitized to exclude sensitive seller information.',
      tags: ['Seller Shipping'],
      deprecated: false,
    }),
    ApiQuery({
      type: FindOneProfileDto,
      name: 'shippingId',
      required: true,
    }),
    ApiQuery({
      type: FindOneProfileDto,
      name: 'shippingProfileId',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Shipping profile successfully retrieved.',
      schema: {
        example: {
          id: 'ship_pro_123456789',
          shopId: 'shop_987654321',
          sellerShippingId: 'ship_123456789',
          name: 'Standard Shipping',
          feeType: 'flat',
          feeAmount: 10,
          currency: 'USD',
          originCountry: 'US',
          originZip: '10001',
          buyerPickUp: false,
          buyerPickUpLocation: null,
          supportedRegions: ['US', 'CA'],
          estimatedDeliveryMinDays: 3,
          estimatedDeliveryMaxDays: 5,
          createdAt: '2025-08-27T00:00:00.000Z',
          updatedAt: '2025-08-27T00:00:00.000Z',
        } as unknown as FindOneShippingProfileRetrunSchema,
      },
    }),
  );
}

export function ApiUpdateShippingProfile() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update a seller shipping profile',
      description:
        'Updates an existing shipping profile belonging to a seller. ' +
        'Both the `shippingId` and `shippingProfileId` must be provided to identify the profile.',
      tags: ['Seller Shipping'],
      deprecated: false,
    }),
    ApiParam({
      name: 'shippingId',
      description: 'The unique identifier of the seller shipping.',
      example: 'ship_123456789',
    }),
    ApiParam({
      name: 'shippingProfileId',
      description: 'The unique identifier of the seller shipping profile.',
      example: 'ship_pro_123456789',
    }),
    ApiBody({
      type: UpdateSellerShippingProfileDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Shipping profile successfully updated.',
      schema: {
        example: {
          message: 'updated',
        } as UpdateShippingProfileRetrunSchema,
      },
    }),
  );
}

export function ApiRemoveShippingProfile() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete a seller shipping profile',
      description:
        'Deletes a seller shipping profile by `shippingId` and `shippingProfileId`. ' +
        'Once deleted, the profile cannot be restored.',
      tags: ['Seller Shipping'],
      deprecated: false,
    }),
    ApiParam({
      name: 'shippingId',
      description: 'The unique identifier of the seller shipping.',
      example: 'ship_123456789',
    }),
    ApiParam({
      name: 'shippingProfileId',
      description: 'The unique identifier of the seller shipping profile.',
      example: 'ship_pro_123456789',
    }),
    ApiResponse({
      status: 200,
      description: 'Shipping profile successfully deleted.',
      schema: {
        example: {
          message: 'deleted',
        } as RemoveShippingProfileRetrunSchema,
      },
    }),
  );
}
