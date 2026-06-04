import { PartialType } from '@nestjs/mapped-types';
import { CreateBudgestDto } from './create-budgest.dto';

export class UpdateBudgestDto extends PartialType(CreateBudgestDto) {}
