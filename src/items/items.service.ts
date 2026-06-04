import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PrismaService } from '../prisma.service';
@Injectable()
export class ItemsService {
  constructor(private readonly prismaService: PrismaService) { }
  async create(createItemDto: CreateItemDto) {
    const { budget_id, description, quantity, unit, price } = createItemDto;
    return this.prismaService.$transaction(async (prisma) => {
      const budget = await prisma.budgets.findUnique({
        where: { id: budget_id },
      });
      if (!budget) {
        throw new NotFoundException('Presupuesto no encontrado');
      }
      const item = await prisma.budget_items.create({
        data: {
          budget_id,
          description,
          quantity: quantity ?? 1,
          unit: unit ?? 'Pza',
          price: price ?? 0,
        },
      });
      // Recalcular total_amount del presupuesto
      const items = await prisma.budget_items.findMany({
        where: { budget_id },
      });
      const newTotalAmount = items.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0;
        const prc = Number(item.price) || 0;
        return sum + (qty * prc);
      }, 0);
      const paidAmount = Number(budget.paid_amount);
      let status = budget.status;
      if (paidAmount >= newTotalAmount) {
        status = 'paid';
      } else if (paidAmount > 0) {
        status = 'ongoing';
      } else {
        status = 'pending';
      }
      await prisma.budgets.update({
        where: { id: budget_id },
        data: {
          total_amount: newTotalAmount,
          status,
        },
      });
      return {
        ...item,
        quantity: Number(item.quantity),
        price: Number(item.price),
        total: Number(item.total),
      };
    });
  }
  async findAll() {
    const items = await this.prismaService.budget_items.findMany();
    return items.map(item => ({
      ...item,
      quantity: Number(item.quantity),
      price: Number(item.price),
      total: Number(item.total),
    }));
  }
  async findOne(id: string) {
    const item = await this.prismaService.budget_items.findUnique({
      where: { id },
    });
    if (!item) {
      throw new NotFoundException('Concepto no encontrado');
    }
    return {
      ...item,
      quantity: Number(item.quantity),
      price: Number(item.price),
      total: Number(item.total),
    };
  }
  async update(id: string, updateItemDto: UpdateItemDto) {
    return this.prismaService.$transaction(async (prisma) => {
      const item = await prisma.budget_items.findUnique({
        where: { id },
      });
      if (!item) {
        throw new NotFoundException('Concepto no encontrado');
      }
      const budgetId = item.budget_id;
      const updatedItem = await prisma.budget_items.update({
        where: { id },
        data: {
          description: updateItemDto.description,
          quantity: updateItemDto.quantity,
          unit: updateItemDto.unit,
          price: updateItemDto.price,
        },
      });
      // Recalcular total_amount del presupuesto
      const items = await prisma.budget_items.findMany({
        where: { budget_id: budgetId },
      });
      const newTotalAmount = items.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0;
        const prc = Number(item.price) || 0;
        return sum + (qty * prc);
      }, 0);
      const budget = await prisma.budgets.findUnique({
        where: { id: budgetId },
      });
      if (budget) {
        const paidAmount = Number(budget.paid_amount);
        let status = budget.status;
        if (paidAmount >= newTotalAmount) {
          status = 'paid';
        } else if (paidAmount > 0) {
          status = 'ongoing';
        } else {
          status = 'pending';
        }
        await prisma.budgets.update({
          where: { id: budgetId },
          data: {
            total_amount: newTotalAmount,
            status,
          },
        });
      }
      return {
        ...updatedItem,
        quantity: Number(updatedItem.quantity),
        price: Number(updatedItem.price),
        total: Number(updatedItem.total),
      };
    });
  }
  async remove(id: string) {
    return this.prismaService.$transaction(async (prisma) => {
      const item = await prisma.budget_items.findUnique({
        where: { id },
      });
      if (!item) {
        throw new NotFoundException('Concepto no encontrado');
      }
      const budgetId = item.budget_id;
      await prisma.budget_items.delete({
        where: { id },
      });
      // Recalcular total_amount del presupuesto
      const items = await prisma.budget_items.findMany({
        where: { budget_id: budgetId },
      });
      const newTotalAmount = items.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0;
        const prc = Number(item.price) || 0;
        return sum + (qty * prc);
      }, 0);
      const budget = await prisma.budgets.findUnique({
        where: { id: budgetId },
      });
      if (budget) {
        const paidAmount = Number(budget.paid_amount);
        let status = budget.status;
        if (paidAmount >= newTotalAmount) {
          status = 'paid';
        } else if (paidAmount > 0) {
          status = 'ongoing';
        } else {
          status = 'pending';
        }
        await prisma.budgets.update({
          where: { id: budgetId },
          data: {
            total_amount: newTotalAmount,
            status,
          },
        });
      }
      return {
        ...item,
        quantity: Number(item.quantity),
        price: Number(item.price),
        total: Number(item.total),
      };
    });
  }
}