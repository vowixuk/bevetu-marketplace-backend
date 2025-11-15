import { IsString, Matches } from 'class-validator';

export class GetFileNameQueryDto {
  @IsString()
  @Matches(/^[\w,\s-]+\.[A-Za-z]{3,4}$/, {
    message: 'Invalid file name format',
  })
  fileName: string;
}
