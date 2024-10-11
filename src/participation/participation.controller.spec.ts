import { Test, TestingModule } from '@nestjs/testing';
import { ParticipationController } from './participation.controller';
import { ParticipationService } from './participation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('ParticipationController', () => {
  let controller: ParticipationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipationController],
      providers: [
        {
          provide: ParticipationService,
          useValue: {
            createParticipation: jest.fn(),
            requestParticipation: jest.fn(),
            acceptParticipationRequest: jest.fn(),
            rejectParticipationRequest: jest.fn(),
            cancelParticipationRequest: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ParticipationController>(ParticipationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
