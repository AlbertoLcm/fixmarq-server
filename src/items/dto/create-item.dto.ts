import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemDto {
  @IsString()
  @ApiProperty({ example: 'uuid', description: 'ID del presupuesto asociado' })
  budget_id: string;
  @IsString()
  @ApiProperty({ example: 'Demolición y limpieza', description: 'Descripción del concepto' })
  description: string;
  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 1, description: 'Cantidad' })
  quantity?: number;
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Pza', description: 'Unidad de medida' })
  unit?: string;
  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 100, description: 'Precio unitario' })
  price?: number;
}