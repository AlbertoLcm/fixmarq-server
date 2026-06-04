import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Query } from '@nestjs/common';
import { BudgestsService } from './budgests.service';
import { CreateBudgestDto } from './dto/create-budgest.dto';
import { UpdateBudgestDto } from './dto/update-budgest.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FindAllBudgetsDto } from './dto/find-all-budgest.dto';

@Controller('budgets')
export class BudgestsController {
  constructor(private readonly budgestsService: BudgestsService) { }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear un presupuesto' })
  @ApiResponse({ status: 201, description: 'Presupuesto creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createBudgestDto: CreateBudgestDto) {
    return this.budgestsService.create(createBudgestDto);
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Obtener todos los presupuestos' })
  @ApiResponse({ status: 200, description: 'Presupuestos obtenidos exitosamente' })
  findAll(@Query() params: FindAllBudgetsDto) {
    return this.budgestsService.findAll(params.stats);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un presupuesto por ID' })
  @ApiResponse({ status: 200, description: 'Presupuesto obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  findOne(@Param('id') id: string) {
    return this.budgestsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un presupuesto' })
  @ApiResponse({ status: 200, description: 'Presupuesto actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  update(@Param('id') id: string, @Body() updateBudgestDto: UpdateBudgestDto) {
    return this.budgestsService.update(id, updateBudgestDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un presupuesto' })
  @ApiResponse({ status: 200, description: 'Presupuesto eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  remove(@Param('id') id: string) {
    return this.budgestsService.remove(id);
  }
}
