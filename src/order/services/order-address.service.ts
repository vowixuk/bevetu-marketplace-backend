import { Injectable } from '@nestjs/common';
import { OrderAddressRepository } from '../repositories/order-address.repository';
import { CreateOrderAddressDto } from '../dto/create-order-address.dto';
import { OrderAddress } from '../entities/order-address';

@Injectable()
export class OrderAddressService {
  constructor(
    private readonly orderAddressRepository: OrderAddressRepository,
  ) {}

  async create(dto: CreateOrderAddressDto): Promise<OrderAddress> {
    const address = new OrderAddress({
      ...dto,
      id: '',
      orderId: dto.orderId ?? '',
      buyerId: dto.buyerId ?? '',
    });
    return this.orderAddressRepository.create(address);
  }
}
