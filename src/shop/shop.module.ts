import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopRepository } from './shop.repository';
import { ShopController } from './shop.controller';

@Module({
  controllers: [ShopController],
  providers: [ShopService, ShopRepository],
  exports: [ShopService],
})
export class ShopModule {}
