/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SellerRepository } from '../seller.repository';
import { CreateSellerDto } from '../dto/create-seller.dto';
import { Seller } from '../entities/seller.entity';
import { UpdateSellerDto } from '../dto/update-seller.dto';
import { CreateSellerConnectAccountDto } from '../dto/create-seller-connected-account.dto';
import { StripeService } from 'src/stripe/services/stripe.service';
import { SellerService } from './seller.service';
import { ShopService } from 'src/shop/shop.service';
import { SellerStripeAccountMapping } from '@prisma/client';
import { SellerStripeAccountMappingService } from 'src/stripe/services/seller-account-mapping.service';
import { CreateAccountSessionDto } from '../dto/create-account-session.dto';
import Stripe from 'stripe';
import { CreateSellerStripeAccountMappingDto } from 'src/stripe/dto/create-seller-account-mapping.dto';

@Injectable()
export class SellerUseCase {
  constructor(
    private readonly sellerService: SellerService,
    private readonly stripeService: StripeService,
    private readonly shopService: ShopService,
    private readonly sellerStripeAccountMappingService: SellerStripeAccountMappingService,
  ) {}

  async createSellerConnectedAccount(
    userId: string,
    createSellerConnectAccountDto: CreateSellerConnectAccountDto,
  ): Promise<string> {

    // Step 1 - Create Seller Account in Stripe
    const connectedAccount = await this.stripeService.createAccount(
      createSellerConnectAccountDto.country,
    );

    // Step 2 - Create Seller Account in bevetu
    const seller = await this.sellerService.create(
      userId,
      Object.assign(new CreateSellerDto(), {
        status: 'PENDING',
      }),
    );

    // Step 3 - Create Seller-Stripe-Account-Mapping
    await this.sellerStripeAccountMappingService.create(
      userId,
      Object.assign(new CreateSellerStripeAccountMappingDto(), {
        sellerId: seller.id,
        stripeAccountId: connectedAccount.id,
        identifyId: connectedAccount.id,
      }),
    );

    return connectedAccount.id;
  }

  async createAccountSession(
    createAccountSessionDto: CreateAccountSessionDto,
  ): Promise<{
    client_secret: string;
  }> {
    const accountSession = await this.stripeService.createAccountSession(
      createAccountSessionDto,
    );
    return accountSession;
  }

  async findSellerStripeAccountByUserId(
    userId: string,
  ): Promise<Omit<SellerStripeAccountMapping, 'userId'>> {
    return await this.sellerStripeAccountMappingService.findOneByUserId(userId);
  }

  async checkSellerOnBoardStatus(sellerAccountId: string) {
    return await this.stripeService.checkSellerOnBoardStatus(sellerAccountId);
  }
}
