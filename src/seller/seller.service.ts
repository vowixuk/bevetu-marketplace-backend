/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SellerRepository } from './seller.repository';
import { CreateSellerDto } from './dto/create-seller.dto';
import { Seller } from './entities/seller.entity';
import { UpdateSellerDto } from './dto/update-seller.dto';

@Injectable()
export class SellerService {
  constructor(private readonly sellerRepository: SellerRepository) {}

  // async createSellerConnectedAccount(
  //   userId: string,
  //   createSellerConnectAccountDto: CreateSellerConnectAccountDto,
  // ) {
  //   const connectedAccount = await this.stripeService.createAccount(
  //     createSellerConnectAccountDto.country,
  //   );

  //   // create a seller account ans save the stripe connected ID
  //   return connectedAccount;
  // }

  async create(
    userId: string,
    createSellerDto: CreateSellerDto,
  ): Promise<Omit<Seller, 'id'>> {
    const seller = await this.sellerRepository.create(
      new Seller({
        id: '',
        userId,
        email: createSellerDto.email,
        status: 'ACTIVE',
        attributes: createSellerDto.attributes || {},
        createdAt: new Date(),
      }),
    );

    // Remove userId from returned object (if you don't want to expose it)
    const { id, ...sellerWithoutId } = seller;
    return sellerWithoutId;
  }

  async findAll(): Promise<Omit<Seller, 'id'>[]> {
    const sellers = await this.sellerRepository.findAll();
    if (sellers.length === 0) {
      return [];
    }
    return sellers.map((seller) => {
      const { id, ...sellerWithoutId } = seller;
      return sellerWithoutId;
    });
  }

  async findOne(sellerId: string): Promise<Omit<Seller, 'id'>> {
    const seller = await this.sellerRepository.findOne(sellerId);
    if (!seller) {
      throw new NotFoundException('Seller not found');
    }
    if (seller.id !== sellerId) {
      throw new ForbiddenException('Seller does not belong to this user');
    }
    const { id, ...sellerWithoutId } = seller;
    return sellerWithoutId;
  }

  async update(
    sellerId: string,
    updateSellerDto: UpdateSellerDto,
  ): Promise<Omit<Seller, 'id'>> {
    const seller = await this.findOne(sellerId);

    const updatedSeller = await this.sellerRepository.update({
      ...(seller as Seller),
      ...updateSellerDto,
    });

    const { id, ...sellerWithoutId } = updatedSeller;
    return sellerWithoutId;
  }

  async remove(sellerId: string): Promise<Omit<Seller, 'id'>> {
    const seller = await this.findOne(sellerId);
    const deletedSeller = await this.sellerRepository.remove(sellerId);
    const { id, ...sellerWithoutId } = deletedSeller;
    return sellerWithoutId;
  }
}
