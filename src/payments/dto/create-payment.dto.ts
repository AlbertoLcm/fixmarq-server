import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @IsString()
  @ApiProperty({ example: 'uuid', description: 'ID del presupuesto' })
  budget_id: string;
  @IsNumber()
  @ApiProperty({ example: 1500.00, description: 'Monto del pago' })
  amount: number;
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Abono a cuenta de obra', description: 'Descripción o notas del pago' })
  description?: string;
  @IsOptional()
  @IsString()
  @ApiProperty({ example: '2026-06-04', description: 'Fecha del pago' })
  payment_date?: string;
}