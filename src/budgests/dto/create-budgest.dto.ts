import { IsString, IsEnum, IsOptional, IsNumber, IsArray } from "class-validator";
import { budget_status } from "../../../generated/prisma/enums.js";
import { ApiProperty } from "@nestjs/swagger";

interface BudgetItem {
  description: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

export class CreateBudgestDto {
  @IsString()
  @ApiProperty({ example: "Proyecto 1", description: "Nombre del proyecto" })
  project_name: string;

  @IsString()
  @ApiProperty({ example: "Cliente 1", description: "Nombre del cliente" })
  client_name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: "2022-01-01", description: "Fecha del presupuesto" })
  budget_date?: string;

  @IsArray()
  @ApiProperty({ example: [{ description: "Concepto 1", quantity: 1, unit: "Pza", price: 100, total: 100 }], description: "Conceptos del presupuesto" })
  items: BudgetItem[];

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 100, description: "Monto total del presupuesto" })
  total_amount?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 100, description: "Monto pagado del presupuesto" })
  paid_amount?: number;

  @IsOptional()
  @IsEnum(budget_status)
  @ApiProperty({ example: budget_status.pending, description: "Estado del presupuesto" })
  status?: budget_status;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: "2022-01-01", description: "Fecha de creación" })
  created_at?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: "2022-01-01", description: "Fecha de actualización" })
  updated_at?: string;
}