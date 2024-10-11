import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserUpdateResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiPropertyOptional()
  message?: string;
}
