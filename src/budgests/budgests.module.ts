import { Module } from '@nestjs/common';
import { BudgestsService } from './budgests.service';
import { BudgestsController } from './budgests.controller';

@Module({
  controllers: [BudgestsController],
  providers: [BudgestsService],
})
export class BudgestsModule {}
