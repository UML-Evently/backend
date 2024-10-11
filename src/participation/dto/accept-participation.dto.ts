import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class AcceptParticipationRequestDto {
  @ApiProperty()
  eventId: ObjectId;

  @ApiProperty()
  participationId: ObjectId;
}
