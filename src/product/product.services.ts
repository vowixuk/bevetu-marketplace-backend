import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ViewProductsDto } from './dto';
import { StorageService } from '../storage/storage.service';
import { GetUploadPresignedUrlDto } from '../storage/dto/get-upload-presigned-url.dto';
import { GetDownloadPresignedUrlDto } from 'src/storage/dto/get-donwload-presigned-url.dto';
import { GetPresignedUrlDto } from './dto/get-presigned-url.dto';
import { RemoveDocumentDto } from './dto/remove-document.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly storageService: StorageService,
    private readonly productRepository: ProductRepository,
  ) {}

  /**
   * Warning!
   * If calling this method directly from the controller,
   * So to avoid the product on shelf without shpping profile attached
   * make sure to set `createDto.onShelf` to `false`.
   */
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
      onShelf: createDto.onShelf,
      isApproved: true,
      categories: createDto.categories,
      shippingProfileId: createDto.shippingProfileId ?? undefined,
      variants: createDto.variants ?? [],
      discount: createDto.discount ?? [],
      dimensions: createDto.dimensions ?? undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.productRepository.create(product);
  }

  /**
   * Internal-use only — not intended for public access.
   * This method does not verify whether a product is on-shelf or approved,
   * nor does it validate product ownership for the caller.
   * It is meant for admin-level operations or cases where product–shop–seller
   * ownership is already guaranteed.
   */
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
   * Internal-use only — not intended for public access.
   * This method does not verify whether a product is on-shelf or approved,
   * nor does it validate product ownership for the caller.
   * It is meant for admin-level operations or cases where product–shop–seller
   * ownership is already guaranteed.
   */
  async findByIds(ids: string[]): Promise<Product[]> {
    const uniqueIds = Array.from(new Set(ids));
    return await this.productRepository.findByIds(uniqueIds);
  }

  /**
   * Internal-use only — not intended for public access.
   * This method does not verify whether a product is on-shelf or approved,
   * nor does it validate product ownership for the caller.
   * Find only products that are onShelf, approved,
   * and belong to active shops, users, and sellers.
   *
   * but the sensitive field remain
   * (e.g. `reservedStock`, `isApproved`, `onShelf`, `sellerId`)
   *
   */
  async findOneValidForDisplay(id: string): Promise<Product | null> {
    return await this.productRepository.findOneValidForDisplay(id);
  }

  /**
   * Public-facing method — intended for displaying a product to buyers.
   * Unlike `findOne`, this method strips out sensitive or internal fields
   * (e.g. `reservedStock`, `isApproved`, `onShelf`, `sellerId`) so that
   * only safe, buyer-relevant data is returned.
   *
   * Use this when rendering product details in a shop or marketplace
   * where the consumer should only see information suitable for public display.
   */
  async findOneForDisplay(
    id: string,
    shopId: string,
  ): Promise<
    Omit<Product, 'reservedStock' | 'isApproved' | 'onShelf' | 'sellerId'>
  > {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { reservedStock, isApproved, onShelf, sellerId, ...product } =
      await this.findOne(id, shopId);
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
  async findAllOnShelfFromMultipleShops(
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

  async findExcessOnShelfByShopId(
    shopId: string,
    quota: number,
  ): Promise<Product[]> {
    return await this.productRepository.findExcessOnShelfByShopId(
      shopId,
      quota,
    );
  }

  async remove(id: string, shopId: string): Promise<Product> {
    const product = await this.findOne(id, shopId);

    const removedProduct = await this.productRepository.remove(product.id);

    await Promise.all(
      removedProduct.imageUrls.map(async (img) => {
        try {
          await this.removeDocumentFromStorage(product.sellerId, {
            fileName: img,
          } as RemoveDocumentDto);
        } catch (err) {
          console.error(`Failed to remove ${img}:`, err);
        }
      }),
    );

    return removedProduct;
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

  async addImageUrl(
    sellerId: string,
    productId: string,
    dto: UpdateProductDto,
  ) {
    const products = await this.findByIds([productId]);

    if (!products || products.length <= 0) {
      throw new BadRequestException('Product not found');
    }
    if (!dto.imageUrls || dto.imageUrls.length <= 0) {
      throw new BadRequestException('No image url found');
    }

    const product = products[0];
    if (product.sellerId !== sellerId) {
      throw new UnauthorizedException('Not allowed');
    }
    const newImageUrls = [...product.imageUrls, ...dto.imageUrls];

    return await this.productRepository.update(
      new Product({
        ...product,
        imageUrls: newImageUrls,
      }),
    );
  }

  async removeImageUrl(
    sellerId: string,
    productId: string,
    dto: UpdateProductDto,
  ) {
    const products = await this.findByIds([productId]);

    if (!products || products.length <= 0) {
      throw new BadRequestException('Product not found');
    }

    const product = products[0];
    if (product.sellerId !== sellerId) {
      throw new UnauthorizedException('Not allowed');
    }

    if (
      !dto.imageUrls ||
      dto.imageUrls.length <= 0 ||
      dto.imageUrls == undefined ||
      !dto.imageUrls[0]
    ) {
      throw new BadRequestException('No image url found');
    }

    const newImageUrls = product.imageUrls.filter(
      (img) => img !== dto.imageUrls![0],
    );

    await this.productRepository.update(
      new Product({
        ...product,
        imageUrls: newImageUrls,
      }),
    );

    await this.removeDocumentFromStorage(sellerId, {
      fileName: dto.imageUrls[0],
    } as RemoveDocumentDto);
  }

  async generateUploadProductPicturePresignedUrl(
    sellerId: string,
    fileName: string,
  ): Promise<string> {
    return await this.storageService.getUploadPresignedUrl(
      Object.assign(new GetUploadPresignedUrlDto(), {
        fileName: fileName,
        allowedContentTypes: ['image/jpeg', 'image/png'],
        bucket: process.env.BUCKET_PRODUCT_PICTURES,
        storagePath: `${sellerId}/`,
        expires: 60 * 5,
        acl: 'public-read',
      }),
    );
  }

  async generateDownloadPresignedUrl(
    getPresignedUrlDto: GetPresignedUrlDto,
  ): Promise<string> {
    try {
      const product = await this.findByIds([getPresignedUrlDto.productId]);
      const presignedUrl = await this.storageService.getDownloadPresignedUrl(
        Object.assign(new GetDownloadPresignedUrlDto(), {
          bucket: process.env.BUCKET_PRODUCT_PICTURES,
          key: `${product[0].sellerId}/${getPresignedUrlDto.fileName}`,
          expires: 60 * 5,
        }),
      );
      return presignedUrl;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async removeDocumentFromStorage(
    sellerId: string,
    removeDocumentDto: RemoveDocumentDto,
  ): Promise<string> {
    return await this.storageService.deleteObject(
      process.env.BUCKET_PRODUCT_PICTURES!,
      `${sellerId}/${removeDocumentDto.fileName}`,
    );
  }

  /**
   * Filters products for the buyer-side view based on optional criteria and pagination.
   *
   * This function constructs a query configuration from the provided DTO,
   * including product ID, shop ID, category, search keywords, and pagination options.
   * It then delegates the filtering to the product repository.
   *
   * The function handles:
   * - Pagination (`limit` and `page`), with default values if unspecified.
   * - Sorting order based on `latest` flag (`desc` by default, `asc` if false).
   * - Optional filters: `productId`, `shopId`, `category`, `search`.
   *
   * ⚠️ **Security Warning**:
   *   All products returned by this function are validated to ensure they are
   *   safe to show to buyers. It enforces checks on related entities, including
   *   seller status, user status, and shop deletion state.
   *   **Do not fetch buyer-visible products using other queries**, as they may
   *   return products from invalid or unauthorized sellers, users, or shops.
   *
   * @param dto - Data transfer object containing filtering and pagination options.
   * @returns A list of products matching the provided criteria without sensitive data like:
   *         'reservedStock' | 'isApproved' | 'onShelf' | 'sellerId'
   */
  async filterProductsForBuyerSide(dto: ViewProductsDto) {
    let skip = 0;
    let page = 1;
    let limit = 10;
    let orderBy: 'desc' | 'asc' | undefined = 'desc';

    if (dto.limit) {
      limit = dto.limit;
    }

    if (dto.page) {
      page = dto.page;
      skip = (page - 1) * limit;
    }

    if (dto.latest === false) {
      orderBy = 'asc';
    }

    const _page = {
      skip,
      take: limit,
      orderBy,
    };

    const category: {
      pet: string | undefined;
      product: string | undefined;
    } = {
      pet: dto.pet,
      product: dto.product,
    };

    const setting = {
      ...(dto.productId ? { productId: dto.productId } : undefined),
      ...(dto.shopId ? { shopId: dto.shopId } : undefined),
      ...(dto.pet || dto.product ? { category } : undefined),
      ...(dto.search?.trim() ? { searchWords: dto.search.trim() } : undefined),
      page: _page,
    };

    const { products, total } = await this.productRepository.filter(setting);

    const publicProducts: Omit<
      Product,
      'reservedStock' | 'isApproved' | 'onShelf' | 'sellerId'
    >[] = products.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ reservedStock, isApproved, onShelf, sellerId, ...publicData }) =>
        publicData,
    );

    const totalRecords = total;
    const totalPages = Math.ceil(total / limit);

    const start = skip + 1;
    const end = Math.min(skip + limit, totalRecords);

    const baseApiEndpoint = `${process.env.BASE_URL}/v1/products`;
    const next =
      end < totalRecords
        ? `${baseApiEndpoint}?page=${page + 1}&limit=${limit}`
        : null;

    const prev =
      page > 1 ? `${baseApiEndpoint}?page=${page - 1}&limit=${limit}` : null;

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
}
