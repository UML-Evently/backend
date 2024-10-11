import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class CancelParticipationRequestDto {
  @ApiProperty()
  eventId: ObjectId;

  @ApiProperty()
  participationId: ObjectId;
}
