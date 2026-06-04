import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBudgestDto } from './dto/create-budgest.dto';
import { UpdateBudgestDto } from './dto/update-budgest.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BudgestsService {
  constructor(private readonly prismaService: PrismaService) { }

  async create(createBudgestDto: CreateBudgestDto) {
    try {
      const { items, ...budgetData } = createBudgestDto;

      // Calcular total_amount a partir de los items
      const totalAmount = items ? items.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        return sum + (qty * price);
      }, 0) : 0;

      const budget = await this.prismaService.$transaction(async (prisma) => {
        // Extract only valid budget fields, ignoring any client-provided financial values
        const { total_amount: _ta, paid_amount: _pa, status: _st, ...cleanBudgetData } = budgetData;
        const createdBudget = await prisma.budgets.create({
          data: {
            ...cleanBudgetData,
            total_amount: totalAmount,
            paid_amount: 0.00,
            status: 'pending',
          }
        });

        // crear los items del presupuesto
        if (items) {
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

  async remove(id: string) {
    const deleted = await this.prismaService.budgets.delete({
      where: { id },
    });
    return deleted;
  }
}
