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

  async create(
    sellerId: string,
    shopId: string,
    createDto: CreateProductDto,
  ): Promise<Product> {
    const product = new Product({
      id: '',
      shopId,
      sellerId,
      name: createDto.name,
      description: createDto.description,
      price: createDto.price,
      tags: createDto.tags ?? [],
      slug: createDto.slug,
      imageUrls: createDto.imageUrls ?? [],
      stock: createDto.stock,
      reservedStock: 0,
      onShelf: false,
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

  /**
   * Retrieves all products belonging to a given seller within a specific shop.
   * Typically used when a seller wants to view the products in their own shop.
   */
  async findBySellerIdAndShopId(
    sellerId: string,
    shopId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    products: Product[];
    currentPage: number; // current page of this return
    limit: number; // no of record in this return
    totalRecords: number; // Total number record in the database
    totalPages: number; // Total page
    start: number; // This return start from x record.
    end: number; // This return end to y record.
    next: string | null; // url of next page
    prev: string | null; // url of previous page
  }> {
    const skip = (page - 1) * limit;
    let _product: Product[] = [];
    let _total = 0;
    const { products, total } =
      await this.productRepository.findBySellerIdAndShopId(
        sellerId,
        shopId,
        skip,
        limit,
      );

    if (products) {
      _product = products;
      _total = total;
    }

    const totalRecords = _total;
    const totalPages = Math.ceil(totalRecords / limit);

    const start = skip + 1;
    const end = Math.min(skip + limit, _total);
    const baseApiEndpoint = `${process.env.BASE_URL}/v1/documents/pets/daily-records`;
    const next =
      end < _total
        ? `${baseApiEndpoint}?page=${page + 1}&limit=${limit}`
        : null;

    const prev =
      page > 1 ? `${baseApiEndpoint}?page=${page - 1}&limit=${limit}` : null;

    return {
      products: _product,
      currentPage: page,
      limit,
      totalPages,
      totalRecords,
      start,
      end,
      next,
      prev,
    };
  }

  /**
   * Retrieves all publicly visible products for a given shop.
   * Typically used when a buyer wants to browse a shop’s catalog.
   * Only returns products that are on-shelf and excludes internal fields
   * (e.g., approval status or other seller-only information).
   */
  async findAllOnShelfByShopId(
    shopId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    products: Omit<
      Product,
      'reservedStock' | 'isApproved' | 'onShelf' | 'sellerId'
    >[];
    currentPage: number; // current page of this return
    limit: number; // no of record in this return
    totalRecords: number; // Total number record in the database
    totalPages: number; // Total page
    start: number; // This return start from x record.
    end: number; // This return end to y record.
    next: string | null; // url of next page
    prev: string | null; // url of previous page
  }> {
    // How many record to skip.
    // e.g - page:3 ; limit:30
    // I want record in page 3, and each page has 30 items
    // Page 1 record no: 1 - 30
    // Page 2 record no: 31 - 60
    // Page 3 record no: 61 - 90
    //
    // item to skip: (3-1) * 30 = 60
    // So, after skip the first 60 items,
    // The rest of the next 30 records are the Page 3 records

    const skip = (page - 1) * limit;
    let _product: Product[] = [];
    let _total = 0;
    const { products, total } =
      await this.productRepository.findAllOnShelfByShopId(shopId, skip, limit);

    if (products) {
      _product = products;
      _total = total;
    }

    const totalRecords = _total;
    const totalPages = Math.ceil(totalRecords / limit);

    const start = skip + 1;
    const end = Math.min(skip + limit, _total);
    const baseApiEndpoint = `${process.env.BASE_URL}/v1/documents/pets/daily-records`;
    const next =
      end < _total
        ? `${baseApiEndpoint}?page=${page + 1}&limit=${limit}`
        : null;

    const prev =
      page > 1 ? `${baseApiEndpoint}?page=${page - 1}&limit=${limit}` : null;

    const publicProducts: Omit<
      Product,
      'reservedStock' | 'isApproved' | 'onShelf' | 'sellerId'
    >[] = _product.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ reservedStock, isApproved, onShelf, sellerId, ...publicData }) =>
        publicData,
    );

    return {
      products: publicProducts,
      currentPage: page,
      limit,
      totalPages,
      totalRecords,
      start,
      end,
      next,
      prev,
    };
  }

  /**
   * Retrieves all publicly visible products across all shops, ordered by creation date.
   * Typically used for displaying products on the homepage.
   * Only includes products that are on-shelf and excludes internal fields
   * (e.g., approval status or other seller-only details).
   */
  async findAllOnShelf(
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    products: Omit<
      Product,
      'reservedStock' | 'isApproved' | 'onShelf' | 'sellerId'
    >[];
    currentPage: number; // current page of this return
    limit: number; // no of record in this return
    totalRecords: number; // Total number record in the database
    totalPages: number; // Total page
    start: number; // This return start from x record.
    end: number; // This return end to y record.
    next: string | null; // url of next page
    prev: string | null; // url of previous page
  }> {
    const skip = (page - 1) * limit;
    let _product: Product[] = [];
    let _total = 0;
    const { products, total } = await this.productRepository.findAllOnShelf(
      skip,
      limit,
    );

    if (products) {
      _product = products;
      _total = total;
    }

    const totalRecords = _total;
    const totalPages = Math.ceil(totalRecords / limit);

    const start = skip + 1;
    const end = Math.min(skip + limit, _total);

    const baseApiEndpoint = `${process.env.BASE_URL}/v1/documents/pets/daily-records`;
    const next =
      end < _total
        ? `${baseApiEndpoint}?page=${page + 1}&limit=${limit}`
        : null;

    const prev =
      page > 1 ? `${baseApiEndpoint}?page=${page - 1}&limit=${limit}` : null;

    const publicProducts: Omit<
      Product,
      'reservedStock' | 'isApproved' | 'onShelf' | 'sellerId'
    >[] = _product.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ reservedStock, isApproved, onShelf, sellerId, ...publicData }) =>
        publicData,
    );

    return {
      products: publicProducts,
      currentPage: page,
      limit,
      totalPages,
      totalRecords,
      start,
      end,
      next,
      prev,
    };
  }

  /**
   * Updates a product by its ID and associated shop ID.
   * First, it fetches the existing product and merges it with the provided update DTO.
   * This ensures only valid and existing product data is updated.
   */
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
      }),
    );
  }

  /**
   * Updates a product directly without checking if it exists or validating shop ownership.
   * This method should be used cautiously, as it may overwrite existing data.
   */
  async noCheckingUpdate(id: string, updatedProduct: Product) {
    return this.productRepository.update(updatedProduct);
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
