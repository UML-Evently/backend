import { ApiProperty } from '@nestjs/swagger';
import { EventEntity } from '../../event/event.entity';

export class UserEventsSuggestionsResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  suggestions: EventEntity[];
}
