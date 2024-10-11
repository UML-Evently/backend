import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmailRequestDto {
  @ApiProperty()
  email: string;
}
