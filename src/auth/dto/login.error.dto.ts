import { ApiProperty } from '@nestjs/swagger';

export class LoginErrorDto {
  @ApiProperty()
  success: boolean;
  @ApiProperty()
  message: string;
}
