import { SellerService } from '../../src/seller/services/seller.service';
import { CreateSellerDto } from '../../src/seller/dto/create-seller.dto';
import { Seller } from '../../src/seller/entities/seller.entity';
import { SellerUseCase } from '../../src/seller/services/seller.useCase';
import { CreateSellerConnectAccountDto } from '../../src/seller/dto/create-seller-connected-account.dto';
import { SellerStripeAccountMappingService } from '../../src/stripe/services/seller-account-mapping.service';
export async function testSellerSetup(
  testUserId: string,
  sellerUseCase: SellerUseCase,
  sellerStripeAccountMappingService: SellerStripeAccountMappingService,
  sellerService: SellerService,
) {
  // Create a seller stripe account for the user
  const sellerStripeAccountId =
    await sellerUseCase.createSellerConnectedAccount(
      testUserId,
      Object.assign(new CreateSellerConnectAccountDto(), {
        country: 'GB',
        defaultCurrency: 'GBP',
      }),
    );

  const sellerStripeAccountMapping =
    await sellerStripeAccountMappingService.findOneByUserId(testUserId);
  const sellerId = sellerStripeAccountMapping.sellerId;
  const seller = await sellerService.findOne(testUserId, sellerId);

  return {
    seller,
    sellerStripeAccountId,
    sellerStripeAccountMapping,
  };
}

export async function createActiveTestSeller(
  testUserId: string,
  sellerService: SellerService,
): Promise<Omit<Seller, 'userId'>> {
  const dto: CreateSellerDto = {
    status: 'ACTIVE',
  };

  return await sellerService.create(testUserId, dto);
}

export async function createPendingTestSeller(
  testUserId: string,
  sellerService: SellerService,
): Promise<Omit<Seller, 'userId'>> {
  const dto: CreateSellerDto = {
    status: 'PENDING',
  };
  return await sellerService.create(testUserId, dto);
}

export async function createSuspendedTestSeller(
  testUserId: string,
  sellerService: SellerService,
): Promise<Omit<Seller, 'userId'>> {
  const dto: CreateSellerDto = {
    status: 'SUSPENDED',
  };
  return await sellerService.create(testUserId, dto);
}
