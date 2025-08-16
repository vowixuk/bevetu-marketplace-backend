import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SubscriptionService } from './sellerSubscription.service';
import { CreateSellerSubscriptionDto } from './dto/create-seller-subscription.dto';
import { UpdateSellerSubscriptionDto } from './dto/update-seller-subscription.dto';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  create(@Body() CreateSellerSubscriptionDto: CreateSellerSubscriptionDto) {
    return this.subscriptionService.create(CreateSellerSubscriptionDto);
  }

  @Get()
  findAll() {
    return this.subscriptionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() UpdateSellerSubscriptionDto: UpdateSellerSubscriptionDto,
  ) {
    return this.subscriptionService.update(+id, UpdateSellerSubscriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionService.remove(+id);
  }
}
