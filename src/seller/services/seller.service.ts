/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SellerRepository } from '../seller.repository';
import { CreateSellerDto } from '../dto/create-seller.dto';
import { Seller, SellerStatusType } from '../entities/seller.entity';
import { UpdateSellerDto } from '../dto/update-seller.dto';

@Injectable()
export class SellerService {
  constructor(private readonly sellerRepository: SellerRepository) {}

  async create(
    userId: string,
    createSellerDto: CreateSellerDto,
  ): Promise<Omit<Seller, 'userId'>> {
    const seller = await this.sellerRepository.create(
      new Seller({
        id: '',
        userId,
        status: createSellerDto.status,
        attributes: createSellerDto.attributes || {},
        createdAt: new Date(),
      }),
    );

    // Remove userId from returned object (if you don't want to expose it)
    const { userId: id, ...sellerWithoutId } = seller;
    return sellerWithoutId;
  }

  // async findAll(): Promise<Omit<Seller, 'userId'>[]> {
  //   const sellers = await this.sellerRepository.findAll();
  //   if (sellers.length === 0) {
  //     return [];
  //   }
  //   return sellers.map((seller) => {
  //     const { userId, ...sellerWithoutId } = seller;
  //     return sellerWithoutId;
  //   });
  // }

  async findOne(
    userid: string,
    sellerId: string,
  ): Promise<Omit<Seller, 'userId'>> {
    const seller = await this.sellerRepository.findOne(sellerId);
    if (!seller) {
      throw new NotFoundException('Seller not found');
    }
    if (seller.userId !== userid) {
      throw new ForbiddenException('Seller does not belong to this user');
    }
    const { userId, ...sellerWithoutId } = seller;
    return sellerWithoutId;
  }

  async update(
    userId: string,
    sellerId: string,
    updateSellerDto: UpdateSellerDto,
  ): Promise<Omit<Seller, 'userId'>> {
    const seller = await this.findOne(userId, sellerId);

    const updatedSeller = await this.sellerRepository.update({
      ...(seller as Seller),
      ...updateSellerDto,
    });

    const { userId: id, ...sellerWithoutId } = updatedSeller;
    return sellerWithoutId;
  }

  async softDelete(userId: string, sellerId: string) {
    await this.findOne(userId, sellerId);
    return this.sellerRepository.softDelete(sellerId);
  }

  async restore(userId: string, sellerId: string) {
    await this.findOne(userId, sellerId);
    return this.sellerRepository.restore(sellerId);
  }

  async remove(
    userId: string,
    sellerId: string,
  ): Promise<Omit<Seller, 'userId'>> {
    const seller = await this.findOne(userId, sellerId);
    const deletedSeller = await this.sellerRepository.remove(sellerId);
    const { userId: id, ...sellerWithoutId } = deletedSeller;
    return sellerWithoutId;
  }
}
