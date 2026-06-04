import { Test, TestingModule } from '@nestjs/testing';
import { BudgestsService } from './budgests.service';

describe('BudgestsService', () => {
  let service: BudgestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BudgestsService],
    }).compile();

    service = module.get<BudgestsService>(BudgestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
