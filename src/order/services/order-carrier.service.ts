import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateOrderCarrierDto } from '../dto/create-order-carrier.dto';
import { OrderCarrier } from '../entities/order-carrier.entity';
import { OrderCarrierRepository } from '../repositories/order-carrier.repository';
import { UpdateOrderCarrierDto } from '../dto/update-order-carrier.dto';

@Injectable()
export class OrderAddressService {
  constructor(
    private readonly orderCarrierRepository: OrderCarrierRepository,
  ) {}

  async create(dto: CreateOrderCarrierDto): Promise<OrderCarrier> {
    const address = new OrderCarrier({
      ...dto,
      id: '',
      shippedAt: dto.shippedAt ? new Date(dto.shippedAt) : undefined,
      estimatedDelivery: dto.estimatedDelivery
        ? new Date(dto.estimatedDelivery)
        : undefined,
      deliveredAt: dto.deliveredAt ? new Date(dto.deliveredAt) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return this.orderCarrierRepository.create(address);
  }

  /**
   * Verifies whether the given shopId belongs to the specified sellerId.
   *
   * NOTE: This function is not yet implemented.
   * PENDING: Add proper verification logic to check ownership of the shop by the seller.
   *
   * @param sellerId - The ID of the seller to verify ownership against.
   * @param shopId - The ID of the shop to verify.
   * @returns An object containing sellerId and shopId (currently a placeholder).
   */
  verifyShopIdAndSellerId(sellerId: string, shopId: string) {
    // TODO: Implement actual verification logic

    const validationResult = true;
    if (validationResult) {
      throw new UnauthorizedException('Seller and shop not match');
    }
    return true;
  }

  async update(
    sellerId: string,
    shopId: string,
    orderCarrierId: string,
    dto: UpdateOrderCarrierDto,
  ): Promise<OrderCarrier> {
    this.verifyShopIdAndSellerId(sellerId, shopId);

    const orderCarrier = await this.orderCarrierRepository.fineOneIfShopOwned(
      orderCarrierId,
      shopId,
    );
    if (!orderCarrier) {
      throw new NotFoundException('Carrier not found');
    }

    return this.orderCarrierRepository.updateIfShopOwned(
      orderCarrierId,
      shopId,
      {
        ...orderCarrier,
        ...dto,
      } as OrderCarrier,
    );
  }
}
