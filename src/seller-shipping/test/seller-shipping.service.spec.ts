import { Test, TestingModule } from '@nestjs/testing';
import { SellerShippingService } from '../seller-shipping.service';

describe('SellerShippingService', () => {
  let service: SellerShippingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SellerShippingService],
    }).compile();

    service = module.get<SellerShippingService>(SellerShippingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
