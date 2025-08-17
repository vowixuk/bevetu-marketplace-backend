import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async create(shopId: string, createDto: CreateProductDto): Promise<Product> {
    const product = new Product({
      id: '',
      shopId,
      name: createDto.name,
      description: createDto.description,
      price: createDto.price,
      tags: createDto.tags ?? [],
      slug: createDto.slug,
      imageUrls: createDto.imageUrls ?? [],
      stock: createDto.stock,
      reservedStock: 0,
      isActive: false,
      isApproved: true,
      categories: createDto.categories,
      variants: createDto.variants ?? [],
      discount: createDto.discount ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.productRepository.create(product);
  }

  async findOne(id: string, shopId: string): Promise<Product> {
    const product = await this.productRepository.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.shopId !== shopId) {
      throw new ForbiddenException('Product does not belong to this shop');
    }
    return product;
  }

  async findByShopId(shopId: string): Promise<Product[]> {
    return this.productRepository.findByShopId(shopId);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async update(
    id: string,
    shopId: string,
    updateDto: UpdateProductDto,
  ): Promise<Product> {
    const existingProduct = await this.findOne(id, shopId);

    return this.productRepository.update(
      new Product({
        ...existingProduct,
        ...updateDto,
        updatedAt: new Date(),
      }),
    );
  }

  async remove(id: string, shopId: string): Promise<Product> {
    const product = await this.findOne(id, shopId);
    return this.productRepository.remove(product.id);
  }

  async disapproval(id: string, shopId: string) {
    const existingProduct = await this.findOne(id, shopId);

    return this.productRepository.update(
      new Product({
        ...existingProduct,
        ...{ isApproved: false },
        updatedAt: new Date(),
      }),
    );
  }

  async approval(id: string, shopId: string) {
    const existingProduct = await this.findOne(id, shopId);

    return this.productRepository.update(
      new Product({
        ...existingProduct,
        ...{ isApproved: true },
        updatedAt: new Date(),
      }),
    );
  }
}
