import { PartialType } from '@nestjs/swagger';
import { CreateOrderItemDto } from './create-order-item.dto';

export class UpdateOrderDto extends PartialType(CreateOrderItemDto) {}
