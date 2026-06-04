import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class FindAllBudgetsDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  stats?: boolean;
}