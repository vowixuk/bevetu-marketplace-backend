import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import type { IRequest } from 'src/auth/middlewares/auth.middleware';
import {
  CreateShopReturnSchema,
  ViewOneShopReturnSchema,
  UpdateShopReturnSchema,
} from './shop.type';
import {
  ApiCreateShop,
  ApiViewShop,
  ApiUpdateShop,
  ApiViewShopByUserId,
} from './shop.swagger';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ApiTags } from '@nestjs/swagger';
import { SellerOriginGuard } from 'src/share/guards/seller-site-origin.guard';

@UseGuards(SellerOriginGuard)
@ApiTags('Shop')
@Controller({ path: 'shops', version: '1' })
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post()
  @ApiCreateShop()
  @HttpCode(201)
  async createShop(
    @Req() req: IRequest,
    @Body() createShopDto: CreateShopDto,
  ): Promise<CreateShopReturnSchema> {
    const shop = await this.shopService.create(
      req.middleware.seller?.id as string,
      createShopDto,
    );

    return {
      shopId: shop.id,
    };
  }

  @Get(':shopId')
  @ApiViewShop()
  async viewOneShop(
    @Req() req: IRequest,
    @Param('shopId') shopId: string,
  ): Promise<ViewOneShopReturnSchema> {
    return await this.shopService.findOne(
      shopId,
      req.middleware.seller?.id || '',
    );
  }

  @Get()
  @ApiViewShopByUserId()
  async viewOneShopByUserId(
    @Req() req: IRequest,
  ): Promise<ViewOneShopReturnSchema> {
    return await this.shopService.findOneBySellerId(
      req.middleware.seller?.id || '',
    );
  }

  @Patch(':shopId')
  @ApiUpdateShop()
  async updateShop(
    @Req() req: IRequest,
    @Param('shopId') shopId: string,
    @Body() updateShopDto: UpdateShopDto,
  ): Promise<UpdateShopReturnSchema> {
    await this.shopService.update(
      shopId,
      req.middleware.seller?.id || ' ',
      updateShopDto,
    );
    return { message: 'updated' };
  }
}
