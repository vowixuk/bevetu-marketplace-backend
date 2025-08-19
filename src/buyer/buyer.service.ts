import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BuyerRepository } from './buyer.repository';
import { Buyer } from './entities/buyer.entity';
import { UpdateBuyerDto } from './dto/update-buyer.dto';

@Injectable()
export class BuyerService {
  constructor(private readonly buyerRepository: BuyerRepository) {}

  async create(userId: string): Promise<Buyer> {
    const buyer = new Buyer({
      id: '',
      userId,
    });

    return this.buyerRepository.create(buyer);
  }

  async findOne(id: string, userId: string): Promise<Buyer> {
    const buyer = await this.buyerRepository.findOne(id);
    if (!buyer) {
      throw new NotFoundException('Buyer not found');
    }

    if (buyer.userId !== userId) {
      throw new ForbiddenException('Buyer does not belong to this user');
    }

    return buyer;
  }

  async findByUserId(userId: string): Promise<Buyer> {
    const buyer = await this.buyerRepository.findByUserId(userId);
    if (!buyer) {
      throw new NotFoundException('Buyer not found');
    }
    return buyer;
  }

  async findAll(): Promise<Buyer[]> {
    return this.buyerRepository.findAll();
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateBuyerDto,
  ): Promise<Buyer> {
    const existingBuyer = await this.findOne(id, userId);

    const updatedBuyer = new Buyer({
      ...existingBuyer,
      ...(updateDto.address ? { address: updateDto.address } : {}),
      ...(updateDto.paymentMethod
        ? { paymentMethod: updateDto.paymentMethod }
        : {}),
    });

    return this.buyerRepository.update(updatedBuyer);
  }

  async remove(id: string, userId: string): Promise<Buyer> {
    const existingBuyer = await this.findOne(id, userId);
    return this.buyerRepository.remove(existingBuyer.id);
  }
}
