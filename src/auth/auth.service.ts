import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { MongoRepository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginBodyDto, SignupRequestDto } from './dto';
import jwtConstants from './constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: MongoRepository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(userDto: LoginBodyDto) {
    const username = userDto.username;
    const password = userDto.password;
    const user = await this.userRepository.findOne({
      select: ['_id', 'username', 'password'],
      where: { username },
    });

    if (!user) {
      throw new BadRequestException({
        success: false,
        message: 'Bad credentials',
      });
    }

    if (!password) {
      throw new BadRequestException({
        success: false,
        message: 'Bad credentials',
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new BadRequestException({
        success: false,
        message: 'Bad credentials',
      });
    }

    const token = await this.generateToken(user._id.toString());

    return token;
  }

  async signUp(signupRequestDto: SignupRequestDto) {
    const username = signupRequestDto.username;
    const password = signupRequestDto.password;
    const email = signupRequestDto.email;

    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (user) {
      throw new BadRequestException({
        success: false,
        message: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const newUser = this.userRepository.create({
        username,
        password: hashedPassword,
        email,
        preferences: [],
        participations: [],
      });

      await this.userRepository.save(newUser);

      const token = await this.generateToken(newUser._id.toString());

      return token;
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: 'Signup failed',
      });
    }
  }

  async validateUser(userDto: LoginBodyDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      select: ['_id', 'username', 'password'], // we need the password
      where: { username: userDto.username },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const passwordEquals = await bcrypt.compare(
      userDto.password,
      user.password,
    );

    if (passwordEquals) return user;

    throw new BadRequestException('Invalid credentials');
  }

  verifyAccessToken(accessToken: string) {
    try {
      const payload = this.jwtService.verify(accessToken, {
        secret: jwtConstants.secret,
      });

      return payload;
    } catch (err) {
      return null;
    }
  }

  private async generateToken(id: string) {
    const payload = { id };

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
      expiresIn: jwtConstants.accessTokenExpirationTime,
    });

    return accessToken;
  }
}
