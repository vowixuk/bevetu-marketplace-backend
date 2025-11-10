import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateOrderUseCase } from './use-cases/create-order.useCase';
import { type IRequest } from '../auth/middlewares/auth.middleware';
import { CreateOrderUseCaseDto } from './dto/create-order-use-case.dto';

@ApiTags('Order')
@Controller({ path: 'order', version: '1' })
export class OrderController {
  constructor(private readonly createOrderUseCase: CreateOrderUseCase) {}
  @Post('/checkout')
  async checkout(
    @Req() req: IRequest,
    @Body() dto: CreateOrderUseCaseDto,
  ): Promise<string> {
    dto.createOrderAddressDto.buyerId = req.middleware.buyer.id;
    return await this.createOrderUseCase.execute(
      req.middleware.buyer.id,
      dto.cartId,
      dto.createOrderAddressDto,
      dto.promotionCode,
    );
  }
}
