import { OmitType } from '@nestjs/swagger';
import { Event } from './event';

export class EventResponseDto extends OmitType(Event, [
  'ownerId',
  'createdAt',
  'updatedAt',
] as const) {}
