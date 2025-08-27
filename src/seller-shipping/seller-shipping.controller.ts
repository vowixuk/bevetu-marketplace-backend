import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { SellerShippingProfileService } from './services/seller-shipping-profile.service';
import type { IRequest } from 'src/auth/middlewares/auth.middleware';
import { ApiTags } from '@nestjs/swagger';
import {
  UpdateSellerShippingProfileDto,
  CreateSellerShippingProfileDto,
  FindAllProfilesByShippingIdDto,
  FindOneProfileDto,
} from './dto';
import {
  CreateShippingProfileRetrunSchema,
  FindAllShippingProfilesByShippingIdRetrunSchema,
  FindOneShippingProfileRetrunSchema,
  RemoveShippingProfileRetrunSchema,
  UpdateShippingProfileRetrunSchema,
} from './seller-shipping.type';
import {
  ApiCreateShippingProfile,
  ApiFindAllShippingProfilesByShippingId,
  ApiRemoveShippingProfile,
  ApiUpdateShippingProfile,
} from './seller-shipping.swagger';

@ApiTags('Seller Shipping')
@Controller({ path: 'seller-shippings', version: '1' })
export class SellerShippingController {
  constructor(
    private readonly shippingProfileService: SellerShippingProfileService,
  ) {}

  @Post(':shippingId/shipping-profiles')
  @ApiCreateShippingProfile()
  async createShippingProfile(
    @Req() req: IRequest,
    @Body() dto: CreateSellerShippingProfileDto,
  ): Promise<CreateShippingProfileRetrunSchema> {
    await this.shippingProfileService.create(req.middleware.seller!.id, dto);
    return {
      message: 'created',
    };
  }

  @Get(':shippingId/shipping-profiles')
  @ApiFindAllShippingProfilesByShippingId()
  async findAllShippingProfilesByShippingId(
    @Req() req: IRequest,
    @Param() dto: FindAllProfilesByShippingIdDto,
  ): Promise<FindAllShippingProfilesByShippingIdRetrunSchema> {
    const profiles = await this.shippingProfileService.findBySellerShippingId(
      dto.shippingId,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return profiles.map(({ sellerId, ...profileData }) => profileData);
  }

  @Get(':shippingId/shipping-profiles/:shippingProfileId')
  async findOneShippingProfile(
    @Req() req: IRequest,
    @Param() dto: FindOneProfileDto,
  ): Promise<FindOneShippingProfileRetrunSchema> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sellerId, ...profileData } =
      await this.shippingProfileService.findOne(
        dto.shippingProfileId,
        req.middleware.seller!.id,
        dto.shippingId,
      );

    return profileData;
  }

  @Patch(':shippingId/shipping-profiles/:shippingProfileId')
  @ApiUpdateShippingProfile()
  async updateShippingProfile(
    @Req() req: IRequest,
    @Param('shippingId') shippingId: string,
    @Param('shippingProfileId') shippingProfileId: string,
    @Body() dto: UpdateSellerShippingProfileDto,
  ): Promise<UpdateShippingProfileRetrunSchema> {
    await this.shippingProfileService.update(
      shippingProfileId,
      req.middleware.seller!.id,
      shippingId,
      dto,
    );
    return {
      message: 'updated',
    };
  }

  @Delete(':shippingId/shipping-profiles/:shippingProfileId')
  @ApiRemoveShippingProfile()
  async removeShippingProfile(
    @Req() req: IRequest,
    @Param('shippingId') shippingId: string,
    @Param('shippingProfileId') shippingProfileId: string,
  ): Promise<RemoveShippingProfileRetrunSchema> {
    await this.shippingProfileService.remove(
      shippingProfileId,
      req.middleware.seller!.id,
      shippingId,
    );

    return {
      message: 'deleted',
    };
  }
}
