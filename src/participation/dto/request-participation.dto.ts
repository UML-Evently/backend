import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class RequestParticipationDto {
  @ApiProperty()
  eventId: ObjectId;

  @ApiProperty()
  message: string;
}
