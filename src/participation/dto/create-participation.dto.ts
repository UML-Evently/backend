import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class CreateParticipationDto {
  @ApiProperty()
  eventId: ObjectId;
}
