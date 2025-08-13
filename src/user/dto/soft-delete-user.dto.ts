import { IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class softDeleteUserDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deletedAt?: Date | null;
}
