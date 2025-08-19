import { Module } from '@nestjs/common';
import { BuyerService } from './services/buyer.service';
import { BuyerController } from './buyer.controller';
import { BuyerRepository } from './buyer.repository';

@Module({
  controllers: [BuyerController],
  providers: [BuyerService, BuyerRepository],
  exports: [BuyerService],
})
export class BuyerModule {}
