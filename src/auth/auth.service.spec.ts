import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
import { MongoRepository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginBodyDto, SignupRequestDto } from './dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: MongoRepository<UserEntity>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: MongoRepository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<MongoRepository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should throw BadRequestException if username is missing', async () => {
      const loginData: LoginBodyDto = { username: '', password: 'password' };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      await expect(service.signIn(loginData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if password is missing', async () => {
      const loginData: LoginBodyDto = { username: 'username', password: '' };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      await expect(service.signIn(loginData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if user does not exist', async () => {
      const loginData: LoginBodyDto = {
        username: 'nonexistentuser',
        password: 'password',
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.signIn(loginData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if password is incorrect', async () => {
      const loginData: LoginBodyDto = {
        username: 'username',
        password: 'wrongpassword',
      };
      const user = {
        _id: 'user_id',
        username: 'username',
        password: await bcrypt.hash('password', 10),
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);

      await expect(service.signIn(loginData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return token if login data is valid', async () => {
      const loginData: LoginBodyDto = {
        username: 'username',
        password: 'password',
      };
      const user = {
        _id: 'user_id',
        username: 'username',
        password: await bcrypt.hash('password', 10),
      };
      const token = 'valid_token';
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await service.signIn(loginData);
      expect(result).toEqual(token);
    });
  });

  describe('signUp', () => {
    it('should throw BadRequestException if username is missing', async () => {
      const signupData: SignupRequestDto = {
        username: '',
        password: 'password',
        email: 'email@example.com',
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      await expect(service.signUp(signupData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if password is missing', async () => {
      const signupData: SignupRequestDto = {
        username: 'username',
        password: '',
        email: 'email@example.com',
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      await expect(service.signUp(signupData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if email is missing', async () => {
      const signupData: SignupRequestDto = {
        username: 'username',
        password: 'password',
        email: '',
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      await expect(service.signUp(signupData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if user already exists', async () => {
      const signupData: SignupRequestDto = {
        username: 'existinguser',
        password: 'password',
        email: 'email@example.com',
      };
      const existingUser = { _id: 'user_id', username: 'existinguser' };
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(existingUser as any);

      await expect(service.signUp(signupData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return token if signup data is valid', async () => {
      const signupData: SignupRequestDto = {
        username: 'newuser',
        password: 'password',
        email: 'email@example.com',
      };
      const newUser = { _id: 'user_id', username: 'newuser' };
      const token = 'valid_token';
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue(newUser as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(newUser as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await service.signUp(signupData);
      expect(result).toEqual(token);
    });
  });
});
