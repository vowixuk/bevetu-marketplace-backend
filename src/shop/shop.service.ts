/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ShopRepository } from './shop.repository';
import { Shop } from './entities/shop.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@Injectable()
export class ShopService {
  constructor(private readonly shopRepository: ShopRepository) {}

  async create(sellerId: string, createShopDto: CreateShopDto): Promise<Shop> {
    const shop = await this.shopRepository.create(
      new Shop({
        id: '',
        sellerId: sellerId,
        name: createShopDto.name,
        description: createShopDto.description,
        country: createShopDto.country,
        createdAt: new Date(),
        attributes: createShopDto.attributes || {},
        shopUrl: '',
        ...(createShopDto.website ? { website: createShopDto.website } : {}),
      }),
    );
    return shop;
  }

  // async findAllBySellerId(sellerId: string): Promise<Shop[]> {
  //   const shops = await this.shopRepository.findAllBySellerId(sellerId);
  //   if (shops.length === 0) {
  //     return [];
  //   }
  //   return shops;
  // }

  async findOne(shopId: string, sellerId: string): Promise<Shop> {
    const shop = await this.shopRepository.findOne(shopId);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }
    if (shop.sellerId !== sellerId) {
      throw new ForbiddenException('Shop does not belong to this seller');
    }
    return shop;
  }

  /**
   * Retrieves shops by their IDs.
   * Returns only basic shop information and excludes sensitive fields
   * (e.g., sellerId, updatedAt, deletedAt, website).
   */
  async findShopsBasicInfoByIds(shipId: string[]): Promise<
    {
      id: string;
      name: string;
      description: string;
      country: string;
      shopUrl: string;
    }[]
  > {
    const shops = await this.shopRepository.findAllByIds(shipId);
    return shops
      .filter((shop) => !shop.deletedAt)
      .map(
        ({
          sellerId,
          website,
          attributes,
          createdAt,
          updatedAt,
          deletedAt,
          ...shop
        }) => shop,
      );
  }

  async findOneBySellerId(sellerId: string): Promise<Shop> {
    const shop = await this.shopRepository.findOneBySellerId(sellerId);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }
    return shop;
  }

  async update(
    shopId: string,
    sellerId: string,
    updateShopDto: UpdateShopDto,
  ): Promise<Shop> {
    const shop = await this.findOne(shopId, sellerId);

    const updatedShop = await this.shopRepository.update({
      ...shop,
      ...updateShopDto,
    });

    return updatedShop;
  }

  async remove(shopId: string, sellerId: string): Promise<Shop> {
    await this.findOne(shopId, sellerId);
    const deletedShop = await this.shopRepository.remove(shopId);
    if (!deletedShop) {
      throw new NotFoundException('Shop not found');
    }
    return deletedShop;
  }
}
