import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveDocumentDto {
  @ApiProperty({
    description: 'The name of the file to be uploaded.',
    example: 'report.pdf',
  })
  @IsNotEmpty()
  @IsString() // Ensures fileName is a string
  fileName: string;
}
