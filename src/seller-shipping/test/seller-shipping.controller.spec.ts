import { Test, TestingModule } from '@nestjs/testing';
import { SellerShippingController } from './seller-shipping.controller';
import { SellerShippingService } from './seller-shipping.service';

describe('SellerShippingController', () => {
  let controller: SellerShippingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerShippingController],
      providers: [SellerShippingService],
    }).compile();

    controller = module.get<SellerShippingController>(SellerShippingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
