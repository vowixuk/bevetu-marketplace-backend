import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopRepository } from './shop.repository';
// import { ShopController } from './shop.controller';

@Module({
  controllers: [],
  providers: [ShopService, ShopRepository],
  exports: [ShopService],
})
export class ShopModule {}
