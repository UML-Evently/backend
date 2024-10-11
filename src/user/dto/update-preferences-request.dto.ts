import { ApiProperty } from '@nestjs/swagger';

export class UpdatePreferencesRequestDto {
  @ApiProperty()
  preferences: string[];
}
