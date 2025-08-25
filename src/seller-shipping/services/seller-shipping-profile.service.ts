import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SellerShippingProfileRepository } from '../repositories/seller-shipping-profile.repository';
import { SellerShippingProfile } from '../entities/seller-shipping-profile.entity';
import { CreateSellerShippingProfileDto } from '../dto/create-seller-shipping-profile.dto';
import { UpdateSellerShippingProfileDto } from '../dto/update-seller-shipping-profile.dto';

@Injectable()
export class SellerShippingProfileService {
  constructor(
    private readonly sellerShippingProfileRepository: SellerShippingProfileRepository,
  ) {}
  async create(
    sellerId: string,
    createDto: CreateSellerShippingProfileDto,
  ): Promise<SellerShippingProfile> {
    const profile = new SellerShippingProfile({
      id: '',
      sellerId,
      shopId: createDto.shopId,
      sellerShippingId: createDto.sellerShippingId,
      name: createDto.name,
      feeType: createDto.feeType,
      feeAmount: createDto.feeAmount,
      currency: createDto.currency,
      originCountry: createDto.originCountry,
      originZip: createDto.originZip,
      ...(createDto.buyerPickUp !== undefined && {
        buyerPickUp: createDto.buyerPickUp,
      }),
      ...(createDto.buyerPickUpLocation !== undefined && {
        buyerPickUpLocation: createDto.buyerPickUpLocation,
      }),
      ...(createDto.supportedRegions !== undefined && {
        supportedRegions: createDto.supportedRegions,
      }),
      ...(createDto.estimatedDeliveryMinDays !== undefined && {
        estimatedDeliveryMinDays: createDto.estimatedDeliveryMinDays,
      }),
      ...(createDto.estimatedDeliveryMaxDays !== undefined && {
        estimatedDeliveryMaxDays: createDto.estimatedDeliveryMaxDays,
      }),
    });

    if (profile.feeType === 'free') {
      profile.feeAmount = 0;
    }

    return this.sellerShippingProfileRepository.create(profile);
  }

  async findOne(id: string, sellerId: string): Promise<SellerShippingProfile> {
    const profile = await this.sellerShippingProfileRepository.findOne(id);
    if (!profile) {
      throw new NotFoundException('Shipping profile not found');
    }
    if (profile.sellerId !== sellerId) {
      throw new ForbiddenException('Profile does not belong to this seller');
    }
    return profile;
  }
  async findBySellerShippingId(
    shippingId: string,
  ): Promise<SellerShippingProfile[]> {
    return this.sellerShippingProfileRepository.findBySellerShippingId(
      shippingId,
    );
  }

  async update(
    id: string,
    sellerId: string,
    updateDto: UpdateSellerShippingProfileDto,
  ): Promise<SellerShippingProfile> {
    const existingProfile = await this.findOne(id, sellerId);

    const updatedProfile = new SellerShippingProfile({
      ...existingProfile,
      ...updateDto,
    });

    //Forcely set the feeAmount as 0 if the type if free
    if (updatedProfile.feeType === 'free') {
      updatedProfile.feeAmount = 0;
    }
    return this.sellerShippingProfileRepository.update(updatedProfile);
  }

  async remove(id: string, sellerId: string): Promise<SellerShippingProfile> {
    const profile = await this.findOne(id, sellerId);
    return this.sellerShippingProfileRepository.remove(profile.id);
  }
}
