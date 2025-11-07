import { CreateProductDto } from '../../src/product/dto/create-product.dto';
import { Product } from '../../src/product/entities/product.entity';
import { CreateProductUseCase } from './testing-module';

/**
 * Create test products for a seller/shop with dynamic dimensions and shipping fee types.
 */
export async function createTestProductsForSeller({
  sellerId,
  shopId,
  createProductUseCase,
  products,
}: {
  sellerId: string;
  shopId: string;
  createProductUseCase: CreateProductUseCase;
  products: {
    name: string;
    price: number;
    stock: number;
    shippingProfileId: string;
    feeType: 'free' | 'flat' | 'per_item' | 'by_weight';
    dimensions: {
      weight: number; // required
      width?: number;
      height?: number;
      depth?: number;
    };
  }[];
}) {
  const createdProducts: Product[] = [];

  for (const product of products) {
    // validate required weight
    if (!product.dimensions?.weight) {
      throw new Error(
        `Missing required 'weight' for product "${product.name}" (${product.feeType})`,
      );
    }

    const createDto: CreateProductDto = {
      name: product.name,
      description: `${product.name} (${product.feeType})`,
      price: product.price,
      stock: product.stock,
      onShelf: true,
      categories: { pet: 'dog', product: 'apparel' },
      dimensions: {
        weight: product.dimensions.weight,
        width: product.dimensions.width ?? 2,
        height: product.dimensions.height ?? 3,
        depth: product.dimensions.depth ?? 4,
      },
      variants: [],
      discount: [],
      shippingProfileId: product.shippingProfileId,
    };

    const created = await createProductUseCase.execute(
      sellerId,
      shopId,
      createDto,
    );

    createdProducts.push(created);
    console.log(
      `✅ Created ${product.name} (${product.feeType}) for seller ${sellerId}`,
    );
  }

  return createdProducts;
}
