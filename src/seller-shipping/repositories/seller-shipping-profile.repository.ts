import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { SellerShippingProfile } from '../entities/seller-shipping-profile.entity';

import {
  Prisma,
  SellerShippingProfile as PrismaSellerShippingProfile,
  SellerShippingFeeType as PrismaSellerShippingFeeType,
} from '@prisma/client';

@Injectable()
export class SellerShippingProfileRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create(profile: SellerShippingProfile): Promise<SellerShippingProfile> {
    const prismaProfile = await this.prisma.sellerShippingProfile.create({
      data: {
        shopId: profile.shopId,
        sellerId: profile.sellerId,
        sellerShippingId: profile.sellerShippingId,
        name: profile.name,
        feeType: profile.feeType as PrismaSellerShippingFeeType,
        feeAmount: profile.feeAmount,
        currency: profile.currency,
        ...(profile.originCountry
          ? { originCountry: profile.originCountry }
          : {}),
        ...(profile.originZip ? { originZip: profile.originZip } : {}),
        ...(profile.buyerPickUp !== undefined
          ? { buyerPickUp: profile.buyerPickUp }
          : {}),
        ...(profile.buyerPickUpLocation
          ? { buyerPickUpLocation: profile.buyerPickUpLocation }
          : {}),
        ...(profile.supportedRegions
          ? { supportedRegions: profile.supportedRegions }
          : {}),
        ...(profile.estimatedDeliveryMinDays
          ? { estimatedDeliveryMinDays: profile.estimatedDeliveryMinDays }
          : {}),
        ...(profile.estimatedDeliveryMaxDays
          ? { estimatedDeliveryMaxDays: profile.estimatedDeliveryMaxDays }
          : {}),
      } as Prisma.SellerShippingProfileUncheckedCreateInput,
    });

    return mapPrismaSellerShippingProfileToDomain(prismaProfile)!;
  }

  async findOne(id: string): Promise<SellerShippingProfile | null> {
    const profile = await this.prisma.sellerShippingProfile.findUnique({
      where: { id },
    });
    return mapPrismaSellerShippingProfileToDomain(profile);
  }

  async findBySellerShippingId(
    shippingId: string,
  ): Promise<SellerShippingProfile[]> {
    const profiles = await this.prisma.sellerShippingProfile.findMany({
      where: { sellerShippingId: shippingId },
    });
    return profiles.map(
      mapPrismaSellerShippingProfileToDomain,
    ) as SellerShippingProfile[];
  }

  async update(profile: SellerShippingProfile): Promise<SellerShippingProfile> {
    const prismaProfile = await this.prisma.sellerShippingProfile.update({
      where: { id: profile.id },
      data: {
        shopId: profile.shopId,
        sellerId: profile.sellerId,
        name: profile.name,
        feeType: profile.feeType,
        feeAmount: profile.feeAmount,
        currency: profile.currency,
        originCountry: profile.originCountry,
        originZip: profile.originZip,
        buyerPickUp: profile.buyerPickUp,
        buyerPickUpLocation: profile.buyerPickUpLocation,
        supportedRegions: profile.supportedRegions,
        estimatedDeliveryMinDays: profile.estimatedDeliveryMinDays,
        estimatedDeliveryMaxDays: profile.estimatedDeliveryMaxDays,
        updatedAt: new Date(),
      },
    });

    return mapPrismaSellerShippingProfileToDomain(prismaProfile)!;
  }

  async remove(id: string): Promise<SellerShippingProfile> {
    const prismaProfile = await this.prisma.sellerShippingProfile.delete({
      where: { id },
    });
    return mapPrismaSellerShippingProfileToDomain(prismaProfile)!;
  }
}

export function mapPrismaSellerShippingProfileToDomain(
  prismaProfile?: PrismaSellerShippingProfile | null,
): SellerShippingProfile | null {
  if (!prismaProfile) return null;

  return new SellerShippingProfile({
    id: prismaProfile.id,
    shopId: prismaProfile.shopId,
    sellerId: prismaProfile.sellerId,
    sellerShippingId: prismaProfile.sellerShippingId,
    name: prismaProfile.name,
    feeType: prismaProfile.feeType as SellerShippingProfile['feeType'],
    feeAmount: prismaProfile.feeAmount,
    currency: prismaProfile.currency,
    originCountry: prismaProfile.originCountry,
    originZip: prismaProfile.originZip,
    buyerPickUp: prismaProfile.buyerPickUp ?? undefined,
    buyerPickUpLocation: prismaProfile.buyerPickUpLocation ?? undefined,
    supportedRegions: prismaProfile.supportedRegions ?? undefined,
    estimatedDeliveryMinDays:
      prismaProfile.estimatedDeliveryMinDays ?? undefined,
    estimatedDeliveryMaxDays:
      prismaProfile.estimatedDeliveryMaxDays ?? undefined,
  });
}
