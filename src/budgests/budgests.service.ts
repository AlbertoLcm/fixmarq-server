import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBudgestDto } from './dto/create-budgest.dto';
import { UpdateBudgestDto } from './dto/update-budgest.dto';
import { UpdateBudgetItemsDto } from './dto/update-budget-items.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BudgestsService {
  constructor(private readonly prismaService: PrismaService) { }

  async create(createBudgestDto: CreateBudgestDto) {
    try {
      const { items, ...budgetData } = createBudgestDto;

      const budget = await this.prismaService.$transaction(async (prisma) => {
        // Ignorar valores financieros enviados por el cliente; la DB los calcula
        const { total_amount: _ta, paid_amount: _pa, status: _st, ...cleanBudgetData } = budgetData;
        const createdBudget = await prisma.budgets.create({
          data: {
            ...cleanBudgetData,
            paid_amount: 0.00,
            status: 'pending',
          }
        });

        // Insertar los items — los triggers actualizan total_amount y status automáticamente
        if (items && items.length > 0) {
          await Promise.all(
            items.map((item) =>
              prisma.budget_items.create({
                data: {
                  budget_id: createdBudget.id,
                  description: item.description,
                  quantity: item.quantity,
                  unit: item.unit,
                  price: item.price,
                },
              }),
            ),
          );
        }

        return createdBudget;
      });

      return this.findOne(budget.id);

    } catch (error) {
      console.error('Error al crear el presupuesto:', error);
      throw error;
    }
  }

  async findAll(withStats: boolean = false) {
    if (withStats) {
      const analytics = await this.prismaService.view_budget_analytics.findMany({ orderBy: { created_at: 'desc' } });
      return analytics.map(b => ({
        id: b.id,
        project_name: b.project_name,
        client_name: b.client_name,
        created_at: b.created_at,
        total_amount: Number(b.total_amount),
        paid_amount: Number(b.paid_amount),
        balance_due: Number(b.balance_due),
        percent_paid: Number(b.percent_paid),
        status: b.status,
      }));
    }

    const budgets = await this.prismaService.budgets.findMany({ orderBy: { created_at: 'desc' } });
    return budgets.map(b => ({
      id: b.id,
      project_name: b.project_name,
      client_name: b.client_name,
      budget_date: b.budget_date ? b.budget_date.toISOString().split('T')[0] : '',
      total_amount: Number(b.total_amount),
      paid_amount: Number(b.paid_amount),
      status: b.status,
      created_at: b.created_at,
      updated_at: b.updated_at,
    }));
  }

  async findOne(id: string) {
    try {
      const budget = await this.prismaService.budgets.findUnique({
        where: { id },
        include: {
          budget_items: {
            orderBy: { created_at: 'asc' }
          },
          budget_payments: {
            orderBy: { payment_date: 'asc' }
          },
        }
      });

      if (!budget) {
        throw new NotFoundException('Presupuesto no encontrado');
      }

      return {
        id: budget.id,
        project_name: budget.project_name,
        client_name: budget.client_name,
        budget_date: budget.budget_date ? budget.budget_date.toISOString().split('T')[0] : '',
        total_amount: Number(budget.total_amount),
        paid_amount: Number(budget.paid_amount),
        status: budget.status,
        created_at: budget.created_at,
        updated_at: budget.updated_at,
        payments: budget.budget_payments.map(p => ({
          id: p.id,
          budget_id: p.budget_id,
          amount: Number(p.amount),
          description: p.description,
          date: p.payment_date ? p.payment_date.toISOString().split('T')[0] : '',
        })),
        items: budget.budget_items.map(item => ({
          id: item.id,
          budget_id: item.budget_id,
          description: item.description,
          quantity: Number(item.quantity),
          unit: item.unit,
          price: Number(item.price),
          total: Number(item.total),
        })),
      };

    } catch (error) {
      console.error('Error al obtener el presupuesto:', error);
      throw error;
    }
  }

  async update(id: string, updateBudgestDto: UpdateBudgestDto) {
    const { items, ...budgetData } = updateBudgestDto;
    await this.prismaService.budgets.update({
      where: { id },
      data: budgetData as any,
    });
    return this.findOne(id);
  }

  async updateItems(budgetId: string, dto: UpdateBudgetItemsDto) {
    // Verificar que el presupuesto existe
    const budget = await this.prismaService.budgets.findUnique({ where: { id: budgetId } });
    if (!budget) {
      throw new NotFoundException('Presupuesto no encontrado');
    }

    await this.prismaService.$transaction(async (prisma) => {
      // Obtener IDs actuales en la DB
      const currentItems = await prisma.budget_items.findMany({
        where: { budget_id: budgetId },
        select: { id: true },
      });
      const currentIds = new Set(currentItems.map((i) => i.id));

      // IDs que llegan con id existente (actualizar) vs. sin id (crear)
      const incomingWithId = dto.items.filter((i) => i.id && currentIds.has(i.id));
      const incomingNew = dto.items.filter((i) => !i.id || !currentIds.has(i.id));
      const incomingIds = new Set(incomingWithId.map((i) => i.id!));

      // Eliminar los que ya no están en la lista entrante
      const toDelete = [...currentIds].filter((id) => !incomingIds.has(id));
      if (toDelete.length > 0) {
        await prisma.budget_items.deleteMany({ where: { id: { in: toDelete } } });
      }

      // Actualizar los existentes
      for (const item of incomingWithId) {
        await prisma.budget_items.update({
          where: { id: item.id },
          data: {
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            price: item.price,
          },
        });
      }

      // Crear los nuevos
      if (incomingNew.length > 0) {
        await prisma.budget_items.createMany({
          data: incomingNew.map((item) => ({
            budget_id: budgetId,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            price: item.price,
          })),
        });
      }

      // Los triggers de la DB recalculan total_amount y status automáticamente
      // al hacer INSERT/UPDATE/DELETE en budget_items
    });

    return this.findOne(budgetId);
  }

  async remove(id: string) {
    const deleted = await this.prismaService.budgets.delete({
      where: { id },
    });
    return deleted;
  }
}
