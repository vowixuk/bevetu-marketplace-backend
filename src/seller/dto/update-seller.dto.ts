import { PartialType } from '@nestjs/swagger';
import { CreateSellerDto } from './create-seller-connected-account.dto';

export class UpdateSellerDto extends PartialType(CreateSellerDto) {}
