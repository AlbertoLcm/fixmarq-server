import { Test, TestingModule } from '@nestjs/testing';
import { BudgestsController } from './budgests.controller';
import { BudgestsService } from './budgests.service';

describe('BudgestsController', () => {
  let controller: BudgestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgestsController],
      providers: [BudgestsService],
    }).compile();

    controller = module.get<BudgestsController>(BudgestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
