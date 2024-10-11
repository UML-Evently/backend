import { ApiProperty } from '@nestjs/swagger';

export class LoginSuccessDto {
  @ApiProperty()
  success: boolean;
  @ApiProperty()
  token: string;
}
