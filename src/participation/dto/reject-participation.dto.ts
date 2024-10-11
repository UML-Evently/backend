import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class RejectParticipationRequestDto {
  @ApiProperty()
  eventId: ObjectId;

  @ApiProperty()
  participationId: ObjectId;
}
