import { IsString, IsUUID, IsOptional, Length, Matches } from 'class-validator';

export class CreateOrderAddressDto {
  @IsUUID()
  orderId: string;

  @IsUUID()
  buyerId: string;

  @IsString()
  @Length(2, 100)
  fullName: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s-]{7,20}$/, {
    message: 'phoneNumber must be a valid phone number',
  })
  phoneNumber?: string;

  @IsString()
  @Length(5, 255)
  line1: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  line2?: string;

  @IsString()
  @Length(2, 100)
  city: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  state?: string;

  @IsString()
  @Length(2, 20)
  postalCode: string;

  @IsString()
  @Length(2, 100)
  country: string;
}
