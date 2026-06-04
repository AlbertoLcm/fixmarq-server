import { IsArray, IsOptional, IsString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BudgetItemDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'uuid', description: 'ID del concepto (omitir para crear uno nuevo)', required: false })
  id?: string;

  @IsString()
  @ApiProperty({ example: 'Demolición y limpieza', description: 'Descripción del concepto' })
  description: string;

  @IsNumber()
  @ApiProperty({ example: 1, description: 'Cantidad' })
  quantity: number;

  @IsString()
  @ApiProperty({ example: 'Pza', description: 'Unidad de medida' })
  unit: string;

  @IsNumber()
  @ApiProperty({ example: 100.0, description: 'Precio unitario' })
  price: number;
}

export class UpdateBudgetItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetItemDto)
  @ApiProperty({
    type: [BudgetItemDto],
    description: 'Lista completa de conceptos del presupuesto (reemplaza todos los existentes)',
  })
  items: BudgetItemDto[];
}
