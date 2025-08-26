import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  Categories,
  Discount,
  Product,
  Variants,
} from './entities/product.entity';
import { Product as PrismaProduct } from '@prisma/client';

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
          isApproved: product.isApproved,
          variants: product.variants ?? [],
          discount: product.discount ?? [],
          categories: product.categories,
          createdAt: product.createdAt ?? new Date(),
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
          updatedAt: new Date(),
        },
      }),
    ) as Product;
  }

  async remove(id: string): Promise<Product> {
    return mapPrismaProductToDomain(
      await this.prisma.product.delete({ where: { id } }),
    ) as Product;
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
    shippingProfileId: (prismaProduct.shippingProfileId ?? undefined) as
      | string
      | undefined,
  });
}
