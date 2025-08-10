import {
  Controller,
  // Get,
  Post,
  Body,
  HttpCode,
  Req,
  // Patch,
  // Param,
  // Delete,
} from '@nestjs/common';
import { SellerService } from './seller.service';
// import { CreateSellerDto } from './dto/create-seller.dto';
import { ApiTags } from '@nestjs/swagger';
// import { UpdateSellerDto } from './dto/update-seller.dto';

import { CreateSellerConnectAccountDto } from './dto/create-seller-connected-account.dto';
import type { IRequest } from '../auth/middlewares/auth.middleware';

@ApiTags('Seller')
@Controller({ path: 'sellers', version: '1' })
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Post()
  @HttpCode(201)
  async createSellerConnectedAccount(
    @Req() req: IRequest,
    @Body() createSellerConnectedAccountDto: CreateSellerConnectAccountDto,
  ): Promise<any> {
    const connectedAccountId =
      await this.sellerService.createSellerConnectedAccount(
        req.middleware.userId,
        createSellerConnectedAccountDto,
      );
    return {
      accountId: connectedAccountId,
    };
  }

  // @Post()
  // create(@Body() createSellerDto: CreateSellerDto) {
  //   return this.sellerService.create(createSellerDto);
  // }

  // @Get()
  // findAll() {
  //   return this.sellerService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.sellerService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateSellerDto: UpdateSellerDto) {
  //   return this.sellerService.update(+id, updateSellerDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.sellerService.remove(+id);
  // }
}
