import { SellerShippingProfile } from './entities/seller-shipping-profile.entity';

export type SafeShippingProfile = Omit<SellerShippingProfile, 'sellerId'>;

export type CreateShippingProfileRetrunSchema = {
  message: string;
};

export type FindAllShippingProfilesByShippingIdRetrunSchema =
  SafeShippingProfile[];

export type FindOneShippingProfileRetrunSchema = SafeShippingProfile;

export type UpdateShippingProfileRetrunSchema = {
  message: string;
};

export type RemoveShippingProfileRetrunSchema = {
  message: string;
};
