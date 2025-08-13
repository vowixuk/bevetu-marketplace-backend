import { Controller, Post, Body, HttpCode, Req, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SellerUseCase } from './services/seller.useCase';

import { CreateSellerConnectAccountDto } from './dto/create-seller-connected-account.dto';
import type { IRequest } from '../auth/middlewares/auth.middleware';
import {
  ApiCreateAccountSession,
  ApiCreateSellerAccount,
  ApiViewSellerStripeAccountId,
} from './seller.swagger';
import {
  CreateAccountSchema,
  CreateAccountSessionSchema,
  ViewSellerStripeAccount,
} from './seller.type';
import { CreateAccountSessionDto } from './dto/create-account-session.dto';

@ApiTags('Seller')
@Controller({ path: 'sellers', version: '1' })
export class SellerController {
  constructor(private readonly sellerUseCase: SellerUseCase) {}

  @Post('account')
  @ApiCreateSellerAccount()
  @HttpCode(201)
  async createSellerConnectedAccount(
    @Req() req: IRequest,
    @Body() createSellerConnectedAccountDto: CreateSellerConnectAccountDto,
  ): Promise<CreateAccountSchema> {
    const connectedAccountId =
      await this.sellerUseCase.createSellerConnectedAccount(
        req.middleware.userId,
        createSellerConnectedAccountDto,
      );
    return {
      stripeAccountId: connectedAccountId.id,
    };
  }

  @Post('account/session')
  @ApiCreateAccountSession()
  async createSellerAccountSession(
    @Req() req: IRequest,
    @Body() createAccountSessionDto: CreateAccountSessionDto,
  ): Promise<CreateAccountSessionSchema> {
    const session = await this.sellerUseCase.createAccountSession(
      createAccountSessionDto,
    );
    return {
      client_secret: session.client_secret,
    };
  }

  // @Post()
  // create(@Body() createSellerDto: CreateSellerDto) {
  //   return this.sellerService.create(createSellerDto);
  // }

  @Get('stripe/account-id')
  @ApiViewSellerStripeAccountId()
  async viewSellerStripeAccountId(
    @Req() req: IRequest,
  ): Promise<ViewSellerStripeAccount> {
    const { stripeAccountId } =
      await this.sellerUseCase.findSellerStripeAccountByUserId(
        req.middleware.userId,
      );
    return {
      stripeAccountId,
    };
  }

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
