import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import type { IRequest } from 'src/auth/middlewares/auth.middleware';
import {
  CreateShopReturnSchema,
  ViewOneShopReturnSchema,
  UpdateShopReturnSchema,
} from './shop.type';
import { ApiCreateShop, ApiViewShop, ApiUpdateShop } from './shop.swagger';
import { UpdateShopDto } from './dto/update-shop.dto';

@Controller('Shop')
@Controller({ path: 'shops', version: '1' })
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post()
  @ApiCreateShop()
  @HttpCode(201)
  async create(
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
  async ViewOne(
    @Req() req: IRequest,
    @Param('shopId') shopId: string,
  ): Promise<ViewOneShopReturnSchema> {
    return await this.shopService.findOne(
      shopId,
      req.middleware.seller?.id || '',
    );
  }

  @Patch(':shopId')
  @ApiUpdateShop()
  async update(
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
