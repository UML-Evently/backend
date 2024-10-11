import { Test, TestingModule } from '@nestjs/testing';
import { PasskitService } from './passkit.service';

describe('PasskitService', () => {
  let service: PasskitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasskitService],
    }).compile();

    service = module.get<PasskitService>(PasskitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
