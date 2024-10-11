import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEntity } from './event.entity';
import { MongoRepository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateEventDto, EditEventDto } from './dto';
import { ObjectId } from 'mongodb';
import { ParticipationEntity } from '../participation/participation.entity';

describe('EventService', () => {
  let service: EventService;
  let eventRepository: MongoRepository<EventEntity>;
  let participationRepository: MongoRepository<ParticipationEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: getRepositoryToken(EventEntity),
          useClass: MongoRepository,
        },
        {
          provide: getRepositoryToken(ParticipationEntity),
          useClass: MongoRepository,
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    eventRepository = module.get<MongoRepository<EventEntity>>(
      getRepositoryToken(EventEntity),
    );
    participationRepository = module.get<MongoRepository<ParticipationEntity>>(
      getRepositoryToken(ParticipationEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEvent', () => {
    it('should throw error if event data is invalid', async () => {
      const createEventDto: CreateEventDto = {
        name: '',
        description: 'description',
        type: 'public',
        startDate: new Date(),
        endDate: new Date(),
        tags: [],
      };
      await expect(
        service.createEvent(new ObjectId(), createEventDto),
      ).rejects.toThrow();
    });

    it('should create and return event if event data is valid', async () => {
      const createEventDto: CreateEventDto = {
        name: 'Event Name',
        description: 'description',
        type: 'public',
        startDate: new Date(),
        endDate: new Date(),
        tags: [],
      };
      const event = { ...createEventDto, _id: new ObjectId() };
      jest.spyOn(eventRepository, 'create').mockReturnValue(event as any);
      jest.spyOn(eventRepository, 'save').mockResolvedValue(event as any);

      const result = await service.createEvent(new ObjectId(), createEventDto);
      expect(result).toEqual(event);
    });
  });

  describe('editEvent', () => {
    it('should throw NotFoundException if event does not exist', async () => {
      const editEventDto: EditEventDto = {
        name: 'Updated Event Name',
        description: 'Updated description',
        type: 'public',
        startDate: new Date(),
        endDate: new Date(),
        tags: [],
      };
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.editEvent(new ObjectId(), new ObjectId(), editEventDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update and return event if event data is valid', async () => {
      const editEventDto: EditEventDto = {
        name: 'Updated Event Name',
        description: 'Updated description',
        type: 'public',
        startDate: new Date(),
        endDate: new Date(),
        tags: [],
      };
      const event = { ...editEventDto, _id: new ObjectId() };
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(event as any);
      jest.spyOn(eventRepository, 'updateOne').mockResolvedValue(event as any);
      jest.spyOn(eventRepository, 'save').mockResolvedValue(event as any);

      const result = await service.editEvent(
        new ObjectId(),
        new ObjectId(),
        editEventDto,
      );
      expect(result).toEqual(event);
    });
  });

  describe('deleteEvent', () => {
    it('should throw NotFoundException if event does not exist', async () => {
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.deleteEvent(new ObjectId(), new ObjectId()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return true if event is deleted', async () => {
      const event = { _id: new ObjectId() };
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(event as any);
      jest
        .spyOn(eventRepository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);
      jest
        .spyOn(participationRepository, 'deleteMany')
        .mockResolvedValue({ affected: 1 } as any);

      const result = await service.deleteEvent(new ObjectId(), new ObjectId());
      expect(result).toBe(true);
    });
  });
});
