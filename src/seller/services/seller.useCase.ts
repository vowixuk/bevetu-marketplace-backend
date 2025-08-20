/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSellerDto } from '../dto/create-seller.dto';
import { CreateSellerConnectAccountDto } from '../dto/create-seller-connected-account.dto';
import { StripeService } from '../../stripe/services/stripe.service';
import { SellerService } from './seller.service';
import { ShopService } from '../../shop/shop.service';
import { SellerStripeAccountMapping } from '@prisma/client';
import { SellerStripeAccountMappingService } from '../../stripe/services/seller-account-mapping.service';
import { CreateAccountSessionDto } from '../dto/create-account-session.dto';
import { CreateSellerStripeAccountMappingDto } from '../../stripe/dto/create-seller-account-mapping.dto';
import { UpdateSellerDto } from '../dto/update-seller.dto';

@Injectable()
export class SellerUseCase {
  constructor(
    private readonly sellerService: SellerService,
    private readonly stripeService: StripeService,
    private readonly shopService: ShopService,
    private readonly sellerStripeAccountMappingService: SellerStripeAccountMappingService,
  ) {}

  /**
   * Create Seller account in both stripe and our own database
   */
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
        status: 'ACTIVE',
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

  async findSellerStripeAccountByUserId(
    userId: string,
  ): Promise<Omit<SellerStripeAccountMapping, 'userId'>> {
    return await this.sellerStripeAccountMappingService.findOneByUserId(userId);
  }

  /**
   * Generic helper to create any Stripe embedded component session
   * @returns client_secret from Stripe
   */
  async createStripeSession(
    createAccountSessionDto: CreateAccountSessionDto,
  ): Promise<{ client_secret: string }> {
    const serviceMethod = this.stripeService[
      createAccountSessionDto.sessionMethod as keyof StripeService
    ] as (dto: CreateAccountSessionDto) => Promise<{ client_secret: string }>;

    if (typeof serviceMethod !== 'function') {
      throw new BadRequestException(
        `StripeService has no method called "${createAccountSessionDto.sessionMethod}"`,
      );
    }

    const session = (await serviceMethod.call(
      this.stripeService,
      createAccountSessionDto,
    )) as { client_secret: string };
    return session;
  }

  /**
   * Check if the user is fully onboarded
   * This is to confirm the onbaord flow is fully go throught in frontend
   * after that
   */
  async checkIsSellerFullyOnBoarded(
    userId: string,
    sellId: string,
    sellerAccountId: string,
  ): Promise<boolean> {
    const isFullyOnBoarded =
      await this.stripeService.checkIsSellerFullyOnBoarded(sellerAccountId);

    if (isFullyOnBoarded) {
      const seller = await this.sellerService.update(
        userId,
        sellId,
        Object.assign(new UpdateSellerDto(), {
          status: 'ACTIVE',
        }),
      );
      return true;
    }
    return false;
  }

  /**
   * Check if the user is fully onboarded (MOCK)
   */
  async checkIsSellerFullyOnBoardedMock(
    userId: string,
    sellId: string,
    sellerAccountId: string,
  ): Promise<boolean> {
    const seller = await this.sellerService.update(
      userId,
      sellId,
      Object.assign(new UpdateSellerDto(), {
        status: 'ACTIVE',
      }),
    );
    return true;
  }
}
