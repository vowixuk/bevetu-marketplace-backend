import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import {
  CreateProductDto,
  SetProductOnShelfDto,
  UpdateProductDto,
  ViewProductsDto,
} from './dto';

import {
  CreateProductReturnSchema,
  GetUploadProductPresignUrlReturnSchema,
  ResetProductOnShelfReturnSchema,
  SafeProductForPublic,
  SellerViewProductReturnSchema,
  SetProductOnShelfReturnSchema,
  UpdateProductReturnSchema,
  ViewFilteredProductReturnSchema,
  ViewProductListReturnSchema,
} from './product.type';
import { GenerateUploadPresignedUrlDto } from './dto/generate-upload-presigned-url.dto';

// --- example objects ---
const safeProductExample: SellerViewProductReturnSchema = {
  id: 'prod_123',
  shopId: 'shop_456',
  name: 'Premium Dog Food',
  description: 'High-quality dog food for adult dogs',
  price: 29.99,
  tags: ['dog', 'food', 'premium'],
  slug: 'premium-dog-food',
  imageUrls: [
    'https://example.com/image1.png',
    'https://example.com/image2.png',
  ],
  stock: 100,
  onShelf: true,
  reservedStock: 0,
  isApproved: true,
  createdAt: new Date('2025-08-27T00:00:00.000Z'),
  updatedAt: new Date('2025-08-27T00:00:00.000Z'),
  variants: [
    { id: 'var_1', name: 'Small Pack', additionalPrice: 0, stock: 50 },
    { id: 'var_2', name: 'Large Pack', additionalPrice: 10, stock: 50 },
  ],
  discount: [
    {
      price: 5,
      type: 'fixed',
      date: { start: new Date('2025-08-01'), end: new Date('2025-08-15') },
    },
  ],
  categories: { pet: 'dog', product: 'food' },
  shippingProfileId: 'ship_pro_123',
};

const safeProducForPublicExample: SafeProductForPublic = {
  id: 'prod_123',
  shopId: 'shop_456',
  name: 'Premium Dog Food',
  description: 'High-quality dog food for adult dogs',
  price: 29.99,
  tags: ['dog', 'food', 'premium'],
  slug: 'premium-dog-food',
  imageUrls: [
    'https://example.com/image1.png',
    'https://example.com/image2.png',
  ],
  stock: 100,
  createdAt: new Date('2025-08-27T00:00:00.000Z'),
  updatedAt: new Date('2025-08-27T00:00:00.000Z'),
  variants: [
    { id: 'var_1', name: 'Small Pack', additionalPrice: 0, stock: 50 },
    { id: 'var_2', name: 'Large Pack', additionalPrice: 10, stock: 50 },
  ],
  discount: [
    {
      price: 5,
      type: 'fixed',
      date: { start: new Date('2025-08-01'), end: new Date('2025-08-15') },
    },
  ],
  categories: { pet: 'dog', product: 'food' },
  shippingProfileId: 'ship_pro_123',
};

const productListExample: ViewProductListReturnSchema = {
  products: [safeProductExample],
  currentPage: 1,
  limit: 10,
  totalRecords: 1,
  totalPages: 1,
  start: 1,
  end: 1,
  next: null,
  prev: null,
};

const productListForPublicExample: ViewFilteredProductReturnSchema = {
  products: [safeProducForPublicExample],
  currentPage: 1,
  limit: 10,
  totalRecords: 1,
  totalPages: 1,
  start: 1,
  end: 1,
  next: null,
  prev: null,
};

// --- Swagger decorators ---
export function ApiCreateProduct() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new product',
      description:
        'Creates a new product for the seller with all relevant details including variants, discount, and categories.',
      tags: ['Product'],
    }),
    ApiParam({ name: 'shopId', type: String }),
    ApiBody({ type: CreateProductDto }),
    ApiResponse({
      status: 201,
      description: 'Product successfully created.',
      schema: { example: { message: 'created' } as CreateProductReturnSchema },
    }),
  );
}

export function ApiSetProductOnShelf() {
  return applyDecorators(
    ApiOperation({
      summary: 'Set product on-shelf or off-shelf',
      description: 'Updates the onShelf status of a product.',
      tags: ['Product'],
    }),
    ApiParam({ name: 'shopId', type: String }),
    ApiParam({ name: 'productId', type: String }),
    ApiBody({ type: SetProductOnShelfDto }),
    ApiResponse({
      status: 200,
      description: 'Product on-shelf status updated.',
      schema: {
        example: { message: 'updated' } as SetProductOnShelfReturnSchema,
      },
    }),
  );
}

export function ApiUpdateProduct() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update an existing product',
      description:
        'Updates details of an existing product including name, description, price, tags, variants, discount, etc.',
      tags: ['Product'],
    }),
    ApiParam({ name: 'shopId', type: String }),
    ApiParam({ name: 'productId', type: String }),
    ApiBody({ type: UpdateProductDto }),
    ApiResponse({
      status: 200,
      description: 'Product successfully updated.',
      schema: { example: { message: 'updated' } as UpdateProductReturnSchema },
    }),
  );
}

export function ApiViewProductList() {
  return applyDecorators(
    ApiOperation({
      summary: 'View list of products for a shop',
      description:
        "Fetches a paginated list of products for the seller's shop, excluding sensitive fields.",
      tags: ['Product'],
    }),
    ApiParam({ name: 'shopId', type: String }),
    ApiQuery({ type: ViewProductsDto }),
    ApiResponse({
      status: 200,
      description: 'Product list retrieved successfully.',
      schema: { example: productListExample },
    }),
  );
}

export function ApiResetProductOnShelf() {
  return applyDecorators(
    ApiOperation({
      summary: 'Reset all products on-shelf status',
      description:
        'Resets all products in the shop to a default on-shelf status. Typically used after subscription plan changes.',
      tags: ['Product'],
    }),
    ApiParam({ name: 'shopId', type: String }),
    ApiResponse({
      status: 200,
      description: 'All products on-shelf status reset.',
      schema: {
        example: { message: 'reset' } as ResetProductOnShelfReturnSchema,
      },
    }),
  );
}

export function ApiSellerViewProduct() {
  return applyDecorators(
    ApiOperation({
      summary: 'View a single product for the seller',
      description:
        'Returns details of a product excluding sensitive sellerId field.',
      tags: ['Product'],
    }),
    ApiParam({ name: 'shopId', type: String }),
    ApiParam({ name: 'productId', type: String }),
    ApiResponse({
      status: 200,
      description: 'Product retrieved successfully.',
      schema: { example: safeProductExample },
    }),
  );
}

export function ApiDeleteProduct() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete a product',
      description: "Deletes a product from the seller's shop.",
      tags: ['Product'],
    }),
    ApiParam({ name: 'shopId', type: String }),
    ApiParam({ name: 'productId', type: String }),
    ApiResponse({
      status: 200,
      description: 'Product deleted successfully.',
      schema: { example: { message: 'deleted' } },
    }),
  );
}

export function ApiViewFilteredProducts() {
  return applyDecorators(
    ApiOperation({
      summary: '',
      description: '',
      tags: ['Product'],
    }),

    ApiResponse({
      status: 200,
      description: 'Product retrieved successfully.',
      schema: { example: productListForPublicExample },
    }),
  );
}

export function ApiGetUploadProductPicturePresignUrl() {
  return applyDecorators(
    ApiOperation({
      summary: 'Generate presigned URL for profile picture upload',
      description:
        'Generates a presigned URL that allows the client to upload a profile picture directly to the storage service.',
      tags: ['Product'],
      deprecated: false,
    }),
    ApiBody({
      type: GenerateUploadPresignedUrlDto,
      description: 'The details required to generate the presigned URL',
    }),
    ApiResponse({
      status: 200,
      description: 'Presigned URL generated successfully',
      schema: {
        example: {
          url: 'https://example.com/upload/presigned-url',
        } as GetUploadProductPresignUrlReturnSchema,
      },
    }),
  );
}

export function ApiRemoveProductImage() {
  return applyDecorators(
    ApiOperation({
      summary: 'Remove an image from a product',
      description: "Removes a specific image URL from the product's gallery.",
      tags: ['Product'],
    }),
    ApiParam({ name: 'shopId', type: String }),
    ApiParam({ name: 'productId', type: String }),
    ApiResponse({
      status: 204,
      description: 'Image removed successfully. No content returned.',
    }),
  );
}

export function ApiAddProductImage() {
  return applyDecorators(
    ApiOperation({
      summary: 'Add an image to a product',
      description: "Adds a new image URL to the product's gallery.",
      tags: ['Product'],
    }),
    ApiParam({ name: 'shopId', type: String }),
    ApiParam({ name: 'productId', type: String }),
    ApiResponse({
      status: 204,
      description: 'Image added successfully. No content returned.',
    }),
  );
}


