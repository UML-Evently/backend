import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEntity } from './event.entity';
import { MongoRepository } from 'typeorm';
import { CreateEventDto, EditEventDto } from './dto';
import { ObjectId } from 'mongodb';
import { ParticipationEntity } from '../participation/participation.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(EventEntity)
    private eventRepository: MongoRepository<EventEntity>,
    @InjectRepository(ParticipationEntity)
    private participationRepository: MongoRepository<ParticipationEntity>,
  ) {}

  async getAllEvent() {
    return this.eventRepository.find();
  }

  async getAllUserEvents(userId: ObjectId) {
    return this.eventRepository.find({
      where: { ownerId: userId },
    });
  }

  async findOne(eventId: string) {
    return this.eventRepository.findOne({
      where: { _id: new ObjectId(eventId) },
    });
  }

  async searchEvents(search: string) {
    const regex = new RegExp(search, 'i'); // 'i' for case-insensitive search
    return this.eventRepository.find({
      where: {
        $or: [{ name: { $regex: regex } }, { description: { $regex: regex } }],
      },
      take: 5,
    });
  }

  async createEvent(userId: ObjectId, CreateEventDto: CreateEventDto) {
    const event = this.eventRepository.create({
      ...CreateEventDto,
      ownerId: userId,
    });

    return this.eventRepository.save(event);
  }

  async editEvent(
    userId: ObjectId,
    eventId: ObjectId,
    editEventDto: EditEventDto,
  ) {
    const event = await this.eventRepository.findOne({
      where: { _id: new ObjectId(eventId), ownerId: userId },
    });

    if (!event) {
      throw new NotFoundException({ message: 'Event not found' });
    }

    return this.eventRepository.updateOne(
      { _id: new ObjectId(eventId) },
      { $set: { ...editEventDto } },
    );
  }

  async deleteEvent(userId: ObjectId, eventId: ObjectId) {
    const event = await this.eventRepository.findOne({
      where: { _id: new ObjectId(eventId), ownerId: userId },
    });

    if (!event) {
      throw new NotFoundException({ message: 'Event not found' });
    }

    // delete all participations for the event
    await this.participationRepository.deleteMany({
      'event._id': new ObjectId(eventId),
    });
    await this.eventRepository.delete(event._id);
    return true;
  }
}
