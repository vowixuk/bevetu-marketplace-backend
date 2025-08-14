import { PartialType } from '@nestjs/mapped-types';
import { CreateShopDto } from './create-shop.dto';
// import { IsOptional, IsDate } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';

export class UpdateShopDto extends PartialType(CreateShopDto) {}
