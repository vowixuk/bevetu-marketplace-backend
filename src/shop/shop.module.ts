import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopRepository } from './shop.repository';
import { ShopController } from './shop.controller';
import { SetupShopUseCase } from './use-cases/setup-shop.useCase';
import { SellerShippingModule } from 'src/seller-shipping/seller-shipping.module';
@Module({
  imports: [SellerShippingModule],
  controllers: [ShopController],
  providers: [ShopService, ShopRepository, SetupShopUseCase],
  exports: [ShopService],
})
export class ShopModule {}
