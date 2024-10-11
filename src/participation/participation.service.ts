import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ParticipationEntity } from './participation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { EventEntity } from '../event/event.entity';
import {
  AcceptParticipationRequestDto,
  CancelParticipationRequestDto,
  RejectParticipationRequestDto,
  RequestParticipationDto,
} from './dto';
import { ObjectId } from 'mongodb';
import { UserEntity } from '../user/user.entity';
import * as jwt from 'jsonwebtoken';
import { PasskitService } from '@app/passkit';

const APPLE_PASSKIT_SECRET = 'REDACTED';

@Injectable()
export class ParticipationService {
  constructor(
    private readonly passkitService: PasskitService,
    @InjectRepository(ParticipationEntity)
    private readonly participationRepository: MongoRepository<ParticipationEntity>,
    @InjectRepository(EventEntity)
    private readonly eventRepository: MongoRepository<EventEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: MongoRepository<UserEntity>,
  ) {}

  async createParticipation(userId: ObjectId, eventId: ObjectId) {
    const eventData = await this.eventRepository.findOne({
      where: { _id: new ObjectId(eventId) },
    });

    if (!eventData) {
      throw new NotFoundException({
        success: false,
        message: 'Event not found',
      });
    }

    const existingParticipation = await this.participationRepository.findOne({
      where: {
        'user._id': userId,
        'event._id': new ObjectId(eventId),
        status: { $ne: 'cancelled' },
      },
    });

    if (existingParticipation) {
      throw new ForbiddenException({
        success: false,
        message: 'You already have a participation in this event',
      });
    }

    const isInviteOnly = eventData.type !== 'public';

    if (isInviteOnly) {
      throw new ForbiddenException({
        success: false,
        message: 'Event is invite only',
      });
    }

    const user = await this.getUserDetails(userId);

    const participation = this.participationRepository.create({
      user,
      event: eventData,
      status: 'accepted',
    });

    return this.participationRepository.save(participation);
  }

  async requestParticipation(
    userId: ObjectId,
    requestParticipationDto: RequestParticipationDto,
  ) {
    const eventData = await this.eventRepository.findOne({
      where: { _id: new ObjectId(requestParticipationDto.eventId) },
    });

    if (!eventData) {
      throw new NotFoundException({
        success: false,
        message: 'Event not found',
      });
    }

    const existingParticipation = await this.participationRepository.findOne({
      where: {
        'user._id': userId,
        'event._id': new ObjectId(requestParticipationDto.eventId),
        status: { $ne: 'cancelled' },
      },
    });

    if (existingParticipation) {
      throw new ForbiddenException({
        success: false,
        message: 'You already have a participation in this event',
      });
    }

    const isInviteOnly = eventData.type !== 'public';

    if (!isInviteOnly) {
      throw new ForbiddenException({
        success: false,
        message: 'Event is not invite only',
      });
    }

    const user = await this.getUserDetails(userId);

    const participation = this.participationRepository.create({
      user,
      event: eventData,
      message: requestParticipationDto.message,
      status: 'pending',
    });

    return this.participationRepository.save(participation);
  }

  async acceptParticipationRequest(
    userId: ObjectId,
    acceptParticipationRequestDto: AcceptParticipationRequestDto,
  ) {
    const participation = await this.participationRepository.findOne({
      where: {
        _id: new ObjectId(acceptParticipationRequestDto.participationId),
      },
    });

    if (!participation) {
      throw new NotFoundException({
        success: false,
        message: 'Participation not found',
      });
    }

    if (!participation.event.ownerId.equals(userId)) {
      throw new ForbiddenException({
        success: false,
        message: 'You are not the owner of the event',
      });
    }

    if (
      participation.status !== 'pending' &&
      participation.status !== 'rejected'
    ) {
      throw new ForbiddenException({
        success: false,
        message: 'Participation is not pending or rejected',
      });
    }

    participation.status = 'accepted';
    return this.participationRepository.save(participation);
  }

  async rejectParticipationRequest(
    userId: ObjectId,
    rejectParticipationRequestDto: RejectParticipationRequestDto,
  ) {
    const participation = await this.participationRepository.findOne({
      where: {
        _id: new ObjectId(rejectParticipationRequestDto.participationId),
      },
    });

    if (!participation) {
      throw new NotFoundException({
        success: false,
        message: 'Participation not found',
      });
    }

    if (!participation.event.ownerId.equals(userId)) {
      throw new ForbiddenException({
        success: false,
        message: 'You are not the owner of the event',
      });
    }

    if (participation.status !== 'pending') {
      throw new ForbiddenException({
        success: false,
        message: 'Participation is not pending',
      });
    }

    participation.status = 'rejected';
    return this.participationRepository.save(participation);
  }

  async cancelParticipationRequest(
    userId: ObjectId,
    cancelParticipationRequestDto: CancelParticipationRequestDto,
  ) {
    const participation = await this.participationRepository.findOne({
      where: {
        _id: new ObjectId(cancelParticipationRequestDto.participationId),
      },
    });

    if (!participation) {
      throw new NotFoundException({
        success: false,
        message: 'Participation not found',
      });
    }

    if (!participation.user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
      });
    }

    if (!participation.user._id.equals(userId)) {
      throw new ForbiddenException({
        success: false,
        message: 'You are not the owner of the participation',
      });
    }

    if (
      participation.status === 'cancelled' ||
      participation.status === 'rejected'
    ) {
      throw new ForbiddenException({
        success: false,
        message: 'Unable to cancel participation',
      });
    }

    participation.status = 'cancelled';
    return this.participationRepository.save(participation);
  }

  async getEventParticipations(userId: ObjectId, eventId: string) {
    const event = await this.eventRepository.findOne({
      where: { _id: new ObjectId(eventId) },
    });

    if (!event) {
      throw new NotFoundException({
        success: false,
        message: 'Event not found',
      });
    }

    if (!event.ownerId.equals(userId)) {
      throw new ForbiddenException({
        success: false,
        message: 'You are not the owner of the event',
      });
    }

    return this.participationRepository.find({
      where: {
        'event._id': new ObjectId(eventId),
        status: { $ne: 'cancelled' },
      },
    });
  }

  async getAllUserParticipations(userId: ObjectId) {
    return this.participationRepository.find({
      where: {
        'user._id': userId,
        status: { $ne: 'cancelled' },
      },
    });
  }

  async getParticipation(userId: ObjectId, eventId: string) {
    const participation = await this.participationRepository.findOne({
      where: {
        'user._id': userId,
        'event._id': new ObjectId(eventId),
        status: { $ne: 'cancelled' },
      },
    });
    if (!participation) {
      return;
    }
    return {
      ...participation,
      passkitToken: jwt.sign(
        {
          eventId: participation.event._id,
          eventName: participation.event.name,
          eventDescription: participation.event.description,
          startDate: participation.event.startDate,
          endDate: participation.event.endDate,
          username: participation.user.username,
        },
        APPLE_PASSKIT_SECRET,
        { expiresIn: '1h' },
      ),
    };
  }

  async getUserDetails(userId: ObjectId) {
    return await this.userRepository.findOne({
      where: { _id: userId },
      select: ['_id', 'username', 'email'],
    });
  }

  getApplePasskit(token: string) {
    const data = jwt.verify(token, APPLE_PASSKIT_SECRET) as {
      eventId: string;
      eventName: string;
      eventDescription: string;
      startDate: string;
      endDate: string;
      username: string;
    };
    return this.passkitService.getPass(
      data.eventId,
      data.eventName,
      data.eventDescription,
      new Date(data.startDate),
      new Date(data.endDate),
      data.username,
    );
  }
}
