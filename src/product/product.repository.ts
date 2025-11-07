import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  Categories,
  Discount,
  Product,
  Variants,
} from './entities/product.entity';
import {
  Prisma,
  Product as PrismaProduct,
  SellerStatus as PrismaSellerStatus,
} from '@prisma/client';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create(product: Product): Promise<Product> {
    return mapPrismaProductToDomain(
      await this.prisma.product.create({
        data: {
          shopId: product.shopId,
          sellerId: product.sellerId,
          name: product.name,
          description: product.description,
          price: product.price,
          tags: product.tags,
          slug: product.slug,
          imageUrls: product.imageUrls,
          stock: product.stock,
          reservedStock: product.reservedStock,
          onShelf: product.onShelf,
          shippingProfileId: product.shippingProfileId ?? undefined,
          isApproved: product.isApproved,
          variants: product.variants ?? [],
          discount: product.discount ?? [],
          categories: product.categories,
          dimensions: product.dimensions ?? undefined,
          // createdAt: product.createdAt ?? new Date(),
        },
      }),
    ) as Product;
  }

  async findAllOnShelf(
    skip: number,
    take: number,
  ): Promise<{
    products: Product[] | null;
    total: number;
  }> {
    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: { onShelf: true, isApproved: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({
        where: { onShelf: true, isApproved: true },
      }),
    ]);

    return {
      products: products.map(mapPrismaProductToDomain) as Product[],
      total,
    };
  }

  async findOneValidForDisplay(id: string): Promise<Product | null> {
    return mapPrismaProductToDomain(
      await this.prisma.product.findUnique({
        where: {
          id,
          onShelf: true,
          isApproved: true,
          shop: {
            deletedAt: null,
            seller: {
              status: 'ACTIVE',
              user: { deletedAt: null },
            },
          },
        },
      }),
    );
  }
  async findOne(id: string): Promise<Product | null> {
    return mapPrismaProductToDomain(
      await this.prisma.product.findUnique({ where: { id } }),
    );
  }

  async findBySellerIdAndShopId(
    sellerId: string,
    shopId: string,
    skip: number,
    take: number,
  ): Promise<{
    products: Product[] | null;
    total: number;
  }> {
    const total = await this.prisma.product.count({
      where: { shopId, sellerId },
    });
    const products = await this.prisma.product.findMany({
      where: { shopId, sellerId },
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
    });
    return {
      products: products.map(mapPrismaProductToDomain) as Product[],
      total,
    };
  }

  async findAllOnShelfByShopId(
    shopId: string,
    skip: number,
    take: number,
  ): Promise<{
    products: Product[] | null;
    total: number;
  }> {
    const total = await this.prisma.product.count({
      where: { shopId, onShelf: true },
    });
    const products = await this.prisma.product.findMany({
      where: { shopId, onShelf: true, isApproved: true },
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
    });

    return {
      products: products.map(mapPrismaProductToDomain) as Product[],
      total,
    };
  }

  async update(product: Product): Promise<Product> {
    return mapPrismaProductToDomain(
      await this.prisma.product.update({
        where: { id: product.id },
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          tags: product.tags,
          slug: product.slug,
          imageUrls: product.imageUrls,
          stock: product.stock,
          reservedStock: product.reservedStock,
          onShelf: product.onShelf,
          isApproved: product.isApproved,
          variants: product.variants,
          discount: product.discount,
          categories: product.categories,
          shippingProfileId: product.shippingProfileId,
          dimensions: product.dimensions,
          updatedAt: new Date(),
        },
      }),
    ) as Product;
  }

  async findExcessOnShelfByShopId(
    shopId: string,
    quota: number,
  ): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: { shopId, onShelf: true },
      orderBy: { createdAt: 'asc' },
      skip: quota,
    });

    return products.map(mapPrismaProductToDomain) as Product[];
  }

  async remove(id: string): Promise<Product> {
    return mapPrismaProductToDomain(
      await this.prisma.product.delete({ where: { id } }),
    ) as Product;
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: ids },
      },
    });
    return products.map(mapPrismaProductToDomain) as Product[];
  }

  /**
   * Filters products based on multiple cross-model criteria.
   *
   * This method combines product-level filters with related entity validations
   * (e.g., shop, seller, and user) to ensure that only valid, visible, and
   * authorized products are retrieved.
   *
   * The filtering process consists of three main stages:
   *
   * 1️⃣ **Configuration-based validation** — Applies security and visibility rules.
   *     Determines whether to include or exclude products based on:
   *     - Product status (on shelf / approved)
   *     - Seller status (active / suspended / etc.)
   *     - Related entity states (deleted users or shops)
   *
   * 2️⃣ **Search-based filtering** — Applies optional filters for:
   *     - Shop ID
   *     - Category (array containment)
   *     - Keyword search (product name, description, categories, or shop name)
   *
   * 3️⃣ **Query execution and mapping** — Executes the Prisma query with pagination
   *     and sorting, then maps raw Prisma results back to domain entities.
   *
   * @param shopId        Optional ID of the shop to filter by.
   * @param category      Optional category string to filter products by.
   * @param searchWords   Optional keyword(s) for text-based search.
   * @param page          Pagination and sorting configuration.
   * @param config        Security and visibility configuration flags.
   *
   * @returns A list of domain-level `Product` entities matching the provided filters.
   */
  async filter({
    shopId,
    productId,
    category,
    searchWords,
    page = {
      skip: 0,
      take: 10,
      orderBy: 'desc' as 'desc' | 'asc',
    },
    config = {
      onShelf: true,
      isApproved: true,
      sellerStatus: 'ACTIVE' as const,
      shopIsDeleted: false,
      userIsDeleted: false,
    },
  }: {
    shopId?: string;
    productId?: string;
    category?: {
      pet?: string;
      product?: string;
    };
    searchWords?: string;
    page?: {
      skip?: number;
      take?: number;
      orderBy?: 'desc' | 'asc';
    };
    config?: {
      onShelf?: boolean;
      isApproved?: boolean;
      sellerStatus?: 'ACTIVE' | 'PENDING' | 'DELETED' | 'SUSPENDED';
      shopIsDeleted?: boolean;
      userIsDeleted?: boolean;
    };
  }): Promise<{ products: Product[]; total: number }> {
    /* Step 1 – Apply configuration-based filters.
     * Enforces security and visibility constraints before applying general filters.
     * Determines inclusion or exclusion of products based on approval state,
     * shelf status, seller activity, and deletion state of related entities.
     */
    const where: Prisma.ProductWhereInput = {
      onShelf: config.onShelf,
      isApproved: config.isApproved,

      shop: {
        ...(config.shopIsDeleted ? { deletedAt: { not: null } } : undefined),
        seller: {
          status: config.sellerStatus as PrismaSellerStatus,
          user: {
            ...(config.userIsDeleted
              ? { deletedAt: { not: null } }
              : undefined),
          },
        },
      },
    };

    /* Step 2 – Apply search-based filters.
     * Adds optional filtering by shop, category, and keyword.
     * Supports fuzzy matching against product and shop names, as well as
     * product descriptions and categories.
     */

    if (productId) {
      where.id = productId;
    } else {
      if (shopId) {
        where.shopId = shopId;
      }

      if (category) {
        where.categories = {
          ...(category.pet
            ? { path: ['pet'], equals: category.pet }
            : undefined),
          ...(category.product
            ? { path: ['product'], equals: category.product }
            : undefined),
        };
      }

      if (searchWords?.trim()) {
        where.OR = [
          { name: { contains: searchWords, mode: 'insensitive' } },
          { description: { contains: searchWords, mode: 'insensitive' } },
          { categories: { array_contains: [searchWords] } },
          {
            shop: {
              name: { contains: searchWords, mode: 'insensitive' },
            },
          },
        ];
      }
    }

    const total = await this.prisma.product.count({
      where,
    });

    /* Step 3 – Execute query and transform results.
     * Fetches data from Prisma with pagination and sorting, then maps
     * the raw records back into domain-level `Product` entities.
     */
    const products = await this.prisma.product.findMany({
      where,
      skip: page.skip,
      take: page.take,
      orderBy: { updatedAt: page.orderBy },
    });

    // Step 4 – Transform Prisma results into domain entities.
    return {
      products: products.map(mapPrismaProductToDomain) as Product[],
      total,
    };
  }
}

/**
 * Map Prisma Product model to domain Product entity.
 */
export function mapPrismaProductToDomain(
  prismaProduct: PrismaProduct | null,
): Product | null {
  if (!prismaProduct) return null;

  return new Product({
    id: prismaProduct.id,
    sellerId: prismaProduct.sellerId,
    shopId: prismaProduct.shopId,
    name: prismaProduct.name,
    description: prismaProduct.description,
    price: prismaProduct.price,
    tags: prismaProduct.tags ?? [],
    slug: prismaProduct.slug ?? undefined,
    imageUrls: prismaProduct.imageUrls ?? [],
    stock: prismaProduct.stock,
    reservedStock: prismaProduct.reservedStock,
    onShelf: prismaProduct.onShelf ? true : false,
    isApproved: prismaProduct.isApproved,
    variants: prismaProduct.variants as Variants[], // JSON -> TypeScript type
    discount: prismaProduct.discount as unknown as Discount[], // JSON -> TypeScript type
    categories: prismaProduct.categories as Categories, // JSON -> TypeScript type
    createdAt: prismaProduct.createdAt,
    updatedAt: prismaProduct.updatedAt,
    dimensions:
      (prismaProduct.dimensions as Product['dimensions']) ?? undefined,
    shippingProfileId: prismaProduct.shippingProfileId ?? undefined,
  });
}
