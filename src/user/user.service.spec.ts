import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { MongoRepository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { EventEntity } from '../event/event.entity';
import { ParticipationEntity } from '../participation/participation.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepository: MongoRepository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: MongoRepository,
        },
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

    service = module.get<UserService>(UserService);
    userRepository = module.get<MongoRepository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updatePassword', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      const userId = new ObjectId();
      const oldPassword = 'oldPassword';
      const newPassword = 'newPassword';
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.updatePassword(userId, oldPassword, newPassword),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if old password is incorrect', async () => {
      const userId = new ObjectId();
      const oldPassword = 'wrongOldPassword';
      const newPassword = 'newPassword';
      const user = {
        _id: userId,
        password: await bcrypt.hash('correctOldPassword', 10),
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);

      await expect(
        service.updatePassword(userId, oldPassword, newPassword),
      ).rejects.toThrow(Error);
    });

    it('should return success if password update is valid', async () => {
      const userId = new ObjectId();
      const oldPassword = 'oldPassword';
      const newPassword = 'newPassword';
      const user = {
        _id: userId,
        password: await bcrypt.hash(oldPassword, 10),
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => newPassword);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user as any);

      const result = await service.updatePassword(
        userId,
        oldPassword,
        newPassword,
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('updateEmail', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      const userId = new ObjectId();
      const email = 'email@example.com';
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateEmail(userId, email)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return success if email update is valid', async () => {
      const userId = new ObjectId();
      const email = 'email@example.com';
      const user = { _id: userId, email: 'oldEmail@example.com' };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user as any);

      const result = await service.updateEmail(userId, email);
      expect(result).toEqual({ success: true });
    });
  });

  describe('updatePreferences', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      const userId = new ObjectId();
      const preferences = ['preference1', 'preference2'];
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.updatePreferences(userId, preferences),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return success if preferences update is valid', async () => {
      const userId = new ObjectId();
      const preferences = ['preference1', 'preference2'];
      const user = { _id: userId, preferences: [] };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user as any);

      const result = await service.updatePreferences(userId, preferences);
      expect(result).toEqual({ success: true });
    });
  });

  describe('deleteAccount', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      const userId = new ObjectId();
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.deleteAccount(userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return success if account deletion is valid', async () => {
      const userId = new ObjectId();
      const user = { _id: userId };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
      jest.spyOn(userRepository, 'delete').mockResolvedValue({} as any);

      const result = await service.deleteAccount(userId);
      expect(result).toEqual({ success: true });
    });
  });
});
