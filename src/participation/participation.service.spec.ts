import { Test, TestingModule } from '@nestjs/testing';
import { ParticipationService } from './participation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ParticipationEntity } from './participation.entity';
import { EventEntity } from '../event/event.entity';
import { UserEntity } from '../user/user.entity';
import { MongoRepository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import {
  RequestParticipationDto,
  AcceptParticipationRequestDto,
  RejectParticipationRequestDto,
  CancelParticipationRequestDto,
} from './dto';
import { PasskitService } from '@app/passkit';

describe('ParticipationService', () => {
  let service: ParticipationService;
  let participationRepository: MongoRepository<ParticipationEntity>;
  let eventRepository: MongoRepository<EventEntity>;
  let userRepository: MongoRepository<UserEntity>;
  let passkitService: PasskitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipationService,
        PasskitService,
        {
          provide: getRepositoryToken(ParticipationEntity),
          useClass: MongoRepository,
        },
        {
          provide: getRepositoryToken(EventEntity),
          useClass: MongoRepository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useClass: MongoRepository,
        },
      ],
    }).compile();

    service = module.get<ParticipationService>(ParticipationService);
    passkitService = module.get<PasskitService>(PasskitService);
    participationRepository = module.get<MongoRepository<ParticipationEntity>>(
      getRepositoryToken(ParticipationEntity),
    );
    eventRepository = module.get<MongoRepository<EventEntity>>(
      getRepositoryToken(EventEntity),
    );
    userRepository = module.get<MongoRepository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createParticipation', () => {
    it('should throw NotFoundException if event does not exist', async () => {
      const eventId = new ObjectId();
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.createParticipation(new ObjectId(), eventId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user already has a participation in the event', async () => {
      const eventId = new ObjectId();
      const userId = new ObjectId();
      const user = { _id: userId };
      const event = { _id: eventId, type: 'public' };
      const participation = { _id: new ObjectId(), user, event };

      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(event as any);
      jest
        .spyOn(participationRepository, 'findOne')
        .mockResolvedValue(participation as any);

      await expect(
        service.createParticipation(userId, eventId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if event is invite only', async () => {
      const eventId = new ObjectId();
      const userId = new ObjectId();
      const event = { _id: eventId, type: 'invite-only' };
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(event as any);
      jest.spyOn(participationRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.createParticipation(userId, eventId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create and return participation if data is valid', async () => {
      const eventId = new ObjectId();
      const userId = new ObjectId();
      const user = { _id: userId };
      const event = { _id: eventId, type: 'public' };
      const participation = {
        _id: new ObjectId(),
        user,
        event,
        status: 'accepted',
      };
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(event as any);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
      jest.spyOn(participationRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(participationRepository, 'create')
        .mockReturnValue(participation as any);
      jest
        .spyOn(participationRepository, 'save')
        .mockResolvedValue(participation as any);

      const result = await service.createParticipation(userId, eventId);
      expect(result).toEqual(participation);
    });
  });

  describe('requestParticipation', () => {
    it('should throw NotFoundException if event does not exist', async () => {
      const requestParticipationDto: RequestParticipationDto = {
        eventId: new ObjectId(),
        message: 'message',
      };
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.requestParticipation(new ObjectId(), requestParticipationDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user already has a participation in the event', async () => {
      const requestParticipationDto: RequestParticipationDto = {
        eventId: new ObjectId(),
        message: 'message',
      };
      const userId = new ObjectId();
      const event = { _id: requestParticipationDto.eventId, type: 'public' };
      const participation = { _id: new ObjectId(), userId, event };
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(event as any);
      jest
        .spyOn(participationRepository, 'findOne')
        .mockResolvedValue(participation as any);

      await expect(
        service.requestParticipation(userId, requestParticipationDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if event is not invite only', async () => {
      const requestParticipationDto: RequestParticipationDto = {
        eventId: new ObjectId(),
        message: 'message',
      };
      const userId = new ObjectId();
      const event = { _id: requestParticipationDto.eventId, type: 'public' };
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(event as any);
      jest.spyOn(participationRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.requestParticipation(userId, requestParticipationDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create and return participation if data is valid', async () => {
      const requestParticipationDto: RequestParticipationDto = {
        eventId: new ObjectId(),
        message: 'message',
      };
      const userId = new ObjectId();
      const user = { _id: userId };
      const event = {
        _id: requestParticipationDto.eventId,
        type: 'invite-only',
      };
      const participation = {
        _id: new ObjectId(),
        user,
        event,
        status: 'pending',
        message: requestParticipationDto.message,
      };
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(event as any);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
      jest.spyOn(participationRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(participationRepository, 'create')
        .mockReturnValue(participation as any);
      jest
        .spyOn(participationRepository, 'save')
        .mockResolvedValue(participation as any);

      const result = await service.requestParticipation(
        userId,
        requestParticipationDto,
      );
      expect(result).toEqual(participation);
    });
  });

  describe('acceptParticipationRequest', () => {
    it('should throw NotFoundException if participation does not exist', async () => {
      const acceptParticipationRequestDto: AcceptParticipationRequestDto = {
        eventId: new ObjectId(),
        participationId: new ObjectId(),
      };
      jest.spyOn(participationRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.acceptParticipationRequest(
          new ObjectId(),
          acceptParticipationRequestDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the owner of the event', async () => {
      const acceptParticipationRequestDto: AcceptParticipationRequestDto = {
        eventId: new ObjectId(),
        participationId: new ObjectId(),
      };
      const participation = {
        _id: acceptParticipationRequestDto.participationId,
        event: { ownerId: new ObjectId() },
        status: 'pending',
      };
      jest
        .spyOn(participationRepository, 'findOne')
        .mockResolvedValue(participation as any);

      await expect(
        service.acceptParticipationRequest(
          new ObjectId(),
          acceptParticipationRequestDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if participation is not pending', async () => {
      const acceptParticipationRequestDto: AcceptParticipationRequestDto = {
        eventId: new ObjectId(),
        participationId: new ObjectId(),
      };
      const participation = {
        _id: acceptParticipationRequestDto.participationId,
        event: { ownerId: new ObjectId() },
        status: 'accepted',
      };
      jest
        .spyOn(participationRepository, 'findOne')
        .mockResolvedValue(participation as any);

      await expect(
        service.acceptParticipationRequest(
          participation.event.ownerId,
          acceptParticipationRequestDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should accept and return participation if data is valid', async () => {
      const acceptParticipationRequestDto: AcceptParticipationRequestDto = {
        eventId: new ObjectId(),
        participationId: new ObjectId(),
      };
      const participation = {
        _id: acceptParticipationRequestDto.participationId,
        event: { ownerId: new ObjectId() },
        status: 'pending',
      };
      jest
        .spyOn(participationRepository, 'findOne')
        .mockResolvedValue(participation as any);
      jest
        .spyOn(participationRepository, 'save')
        .mockResolvedValue({ ...participation, status: 'accepted' } as any);

      const result = await service.acceptParticipationRequest(
        participation.event.ownerId,
        acceptParticipationRequestDto,
      );
      expect(result.status).toEqual('accepted');
    });
  });

  describe('rejectParticipationRequest', () => {
    it('should throw NotFoundException if participation does not exist', async () => {
      const rejectParticipationRequestDto: RejectParticipationRequestDto = {
        eventId: new ObjectId(),
        participationId: new ObjectId(),
      };
      jest.spyOn(participationRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.rejectParticipationRequest(
          new ObjectId(),
          rejectParticipationRequestDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the owner of the event', async () => {
      const rejectParticipationRequestDto: RejectParticipationRequestDto = {
        eventId: new ObjectId(),
        participationId: new ObjectId(),
      };
      const participation = {
        _id: rejectParticipationRequestDto.participationId,
        event: { ownerId: new ObjectId() },
        status: 'pending',
      };
      jest
        .spyOn(participationRepository, 'findOne')
        .mockResolvedValue(participation as any);

      await expect(
        service.rejectParticipationRequest(
          new ObjectId(),
          rejectParticipationRequestDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if participation is not pending', async () => {
      const rejectParticipationRequestDto: RejectParticipationRequestDto = {
        eventId: new ObjectId(),
        participationId: new ObjectId(),
      };
      const participation = {
        _id: rejectParticipationRequestDto.participationId,
        event: { ownerId: new ObjectId() },
        status: 'accepted',
      };
      jest
        .spyOn(participationRepository, 'findOne')
        .mockResolvedValue(participation as any);

      await expect(
        service.rejectParticipationRequest(
          participation.event.ownerId,
          rejectParticipationRequestDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject and return participation if data is valid', async () => {
      const rejectParticipationRequestDto: RejectParticipationRequestDto = {
        eventId: new ObjectId(),
        participationId: new ObjectId(),
      };
      const participation = {
        _id: rejectParticipationRequestDto.participationId,
        event: { ownerId: new ObjectId() },
        status: 'pending',
      };
      jest
        .spyOn(participationRepository, 'findOne')
        .mockResolvedValue(participation as any);
      jest
        .spyOn(participationRepository, 'save')
        .mockResolvedValue({ ...participation, status: 'rejected' } as any);

      const result = await service.rejectParticipationRequest(
        participation.event.ownerId,
        rejectParticipationRequestDto,
      );
      expect(result.status).toEqual('rejected');
    });
  });

  describe('cancelParticipationRequest', () => {
    it('should throw NotFoundException if participation does not exist', async () => {
      const cancelParticipationRequestDto: CancelParticipationRequestDto = {
        eventId: new ObjectId(),
        participationId: new ObjectId(),
      };
      jest.spyOn(participationRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.cancelParticipationRequest(
          new ObjectId(),
          cancelParticipationRequestDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the owner of the participation', async () => {
      const cancelParticipationRequestDto: CancelParticipationRequestDto = {
        eventId: new ObjectId(),
        participationId: new ObjectId(),
      };
      const userId = new ObjectId();
      const user = { _id: userId };
      const participation = {
        _id: cancelParticipationRequestDto.participationId,
        user,
        status: 'pending',
      };

      jest
        .spyOn(participationRepository, 'findOne')
        .mockResolvedValue(participation as any);
      jest.spyOn(participationRepository, 'save').mockResolvedValue(null);

      await expect(
        service.cancelParticipationRequest(
          new ObjectId(),
          cancelParticipationRequestDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if participation is already cancelled or rejected', async () => {
      const cancelParticipationRequestDto: CancelParticipationRequestDto = {
        eventId: new ObjectId(),
        participationId: new ObjectId(),
      };
      const userId = new ObjectId();
      const user = { _id: userId };
      const participation = {
        _id: cancelParticipationRequestDto.participationId,
        user,
        status: 'cancelled',
      };
      jest
        .spyOn(participationRepository, 'findOne')
        .mockResolvedValue(participation as any);

      await expect(
        service.cancelParticipationRequest(
          participation.user._id,
          cancelParticipationRequestDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should cancel and return participation if data is valid', async () => {
      const cancelParticipationRequestDto: CancelParticipationRequestDto = {
        eventId: new ObjectId(),
        participationId: new ObjectId(),
      };
      const userId = new ObjectId();
      const user = { _id: userId };
      const participation = {
        _id: cancelParticipationRequestDto.participationId,
        user,
        status: 'pending',
      };
      jest
        .spyOn(participationRepository, 'findOne')
        .mockResolvedValue(participation as any);
      jest
        .spyOn(participationRepository, 'save')
        .mockResolvedValue({ ...participation, status: 'cancelled' } as any);

      const result = await service.cancelParticipationRequest(
        participation.user._id,
        cancelParticipationRequestDto,
      );
      expect(result.status).toEqual('cancelled');
    });
  });
});
