import {
  Controller,
  Post,
  Body,
  HttpCode,
  Req,
  Get,
  Res,
  BadRequestException,
} from '@nestjs/common';

import express from 'express';

import { ApiTags } from '@nestjs/swagger';
import { SellerUseCase } from './services/seller.useCase';

import { CreateSellerConnectAccountDto } from './dto/create-seller-connected-account.dto';
import type { IRequest } from '../auth/middlewares/auth.middleware';
import {
  ApiCheckIsSellerFullyOnBoarded,
  ApiCreateAccountSession,
  ApiCreateSellerAccount,
  ApiViewSellerStripeAccountId,
} from './seller.swagger';
import {
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
    @Res() res: express.Response,
  ) {
    if (req.middleware.seller?.stripeAccountId) {
      throw new BadRequestException('seller account already created !');
    }
    const connectedAccountId =
      await this.sellerUseCase.createSellerConnectedAccount(
        req.middleware.userId,
        createSellerConnectedAccountDto,
      );

    res.cookie('BVT_MKT', '', { maxAge: 0, path: '/' });

    console.log(connectedAccountId, '<< connectedAccountId');
    res.status(201).send({
      stripeAccountId: connectedAccountId,
    });
  }

  @Post('account/session')
  @ApiCreateAccountSession()
  async createSellerAccountSession(
    @Req() req: IRequest,
    @Body() createAccountSessionDto: CreateAccountSessionDto,
  ): Promise<CreateAccountSessionSchema> {
    const session = await this.sellerUseCase.createStripeSession(
      createAccountSessionDto,
    );
    return {
      client_secret: session.client_secret,
    };
  }

  @Get('stripe/account-id')
  @ApiViewSellerStripeAccountId()
  async viewSellerStripeAccountId(
    @Req() req: IRequest,
  ): Promise<ViewSellerStripeAccount> {
    if (req.middleware.seller?.stripeAccountId) {
      return {
        stripeAccountId: req.middleware.seller?.stripeAccountId,
      };
    }
    const { stripeAccountId } =
      await this.sellerUseCase.findSellerStripeAccountByUserId(
        req.middleware.userId,
      );
    return {
      stripeAccountId,
    };
  }

  @Get('fully-onboarded')
  @ApiCheckIsSellerFullyOnBoarded()
  async checkIsSellerFullyOnBoarded(@Req() req: IRequest): Promise<boolean> {
    if (!req.middleware.seller?.stripeAccountId) {
      throw new BadRequestException('No seller id founded');
    }
    return await this.sellerUseCase.checkIsSellerFullyOnBoarded(
      req.middleware.userId,
      req.middleware.seller.id,
      req.middleware.seller?.stripeAccountId,
    );
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
