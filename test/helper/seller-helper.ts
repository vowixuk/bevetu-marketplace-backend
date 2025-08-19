import { SellerService } from '../../src/seller/services/seller.service';
import { CreateSellerDto } from '../../src/seller/dto/create-seller.dto';
import { Seller } from '../../src/seller/entities/seller.entity';

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
