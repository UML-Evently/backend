import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordRequestDto {
  @ApiProperty()
  oldPassword: string;

  @ApiProperty()
  newPassword: string;
}
