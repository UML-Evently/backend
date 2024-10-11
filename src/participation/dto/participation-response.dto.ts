import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { UserEntity } from '../../user/user.entity';
import { EventEntity } from '../../event/event.entity';

export class ParticipationResponseDto {
  @ApiProperty()
  id: ObjectId;

  @ApiProperty()
  user: UserEntity;

  @ApiProperty()
  event: EventEntity;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  passkitToken?: string;
}
