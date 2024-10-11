import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class Event {
  @ApiProperty()
  _id: ObjectId;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  ownerId: ObjectId;

  @ApiProperty()
  type: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  tags: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
