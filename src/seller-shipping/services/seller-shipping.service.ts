import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SellerShippingRepository } from '../repositories/seller-shipping.repository';
import { SellerShipping } from '../entities/seller-shipping.entity';

import { CreateSellerShippingDto } from '../dto/create-seller-shipping.dto';
import { UpdateSellerShippingDto } from '../dto/update-seller-shipping.dto';

@Injectable()
export class SellerShippingService {
  constructor(
    private readonly sellerShippingRepository: SellerShippingRepository,
  ) {}

  /**
   * Create a new seller shipping record
   */
  async create(
    sellerId: string,
    createSellerShippingDto: CreateSellerShippingDto,
  ): Promise<SellerShipping> {
    const shipping = new SellerShipping({
      id: '',
      sellerId,
      shopId: createSellerShippingDto.shopId,
      freeShippingOption: createSellerShippingDto.freeShippingOption,
      createdAt: new Date(),
    });

    return this.sellerShippingRepository.create(shipping);
  }

  /**
   * Find a shipping record by its ID
   */
  async findOne(id: string, sellerId: string): Promise<SellerShipping> {
    const shipping = await this.sellerShippingRepository.findOne(id);
    if (!shipping) {
      throw new NotFoundException('Seller shipping not found');
    }
    if (shipping.sellerId !== sellerId) {
      throw new ForbiddenException(
        'Shipping record does not belong to this seller',
      );
    }
    return shipping;
  }

  /**
   * Find a shipping record by seller ID
   * Pending to delete since. should attach to shop id,
   * one seller can has many shiiping reocrd if they have more
   * then one shop in future
   */
  // async findBySellerId(sellerId: string): Promise<SellerShipping> {
  //   const shipping =
  //     await this.sellerShippingRepository.findBySellerId(sellerId);
  //   if (!shipping) {
  //     throw new NotFoundException('Seller shipping not found for this seller');
  //   }
  //   return shipping;
  // }

  async findByShopId(
    shopId: string,
    sellerId: string,
  ): Promise<SellerShipping> {
    const shipping = await this.sellerShippingRepository.findByShopId(shopId);

    if (!shipping) {
      throw new NotFoundException('Seller shipping not found for this shop');
    }
    if (shipping.sellerId !== sellerId) {
      throw new ForbiddenException(
        'Shipping record does not belong to this seller',
      );
    }
    return shipping;
  }

  /**
   * Update a seller shipping record
   */
  async update(
    id: string,
    sellerId: string,
    updateDto: UpdateSellerShippingDto,
  ): Promise<SellerShipping> {
    const existingShipping = await this.findOne(id, sellerId);

    const updatedShipping = {
      ...existingShipping,
      ...updateDto,
    } as SellerShipping;

    return this.sellerShippingRepository.update(updatedShipping);
  }

  /**
   * Remove a seller shipping record
   */
  async remove(id: string, sellerId: string): Promise<SellerShipping> {
    const shipping = await this.findOne(id, sellerId);
    return this.sellerShippingRepository.remove(shipping.id);
  }
}
