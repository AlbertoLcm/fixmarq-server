import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from '../prisma.service';
@Injectable()
export class PaymentsService {
  constructor(private readonly prismaService: PrismaService) { }
  async create(createPaymentDto: CreatePaymentDto) {
    const { budget_id, amount, description, payment_date } = createPaymentDto;
    return this.prismaService.$transaction(async (prisma) => {
      const budget = await prisma.budgets.findUnique({
        where: { id: budget_id },
      });
      if (!budget) {
        throw new NotFoundException('Presupuesto no encontrado');
      }
      const payment = await prisma.budget_payments.create({
        data: {
          budget_id,
          amount,
          description: description || 'Abono a cuenta de obra',
          payment_date: payment_date ? new Date(payment_date) : undefined,
        },
      });
      // Recalcular paid_amount del presupuesto
      const aggregate = await prisma.budget_payments.aggregate({
        where: { budget_id },
        _sum: {
          amount: true,
        },
      });
      const newPaidAmount = aggregate._sum.amount ?? 0;
      // Determinar nuevo status del presupuesto
      let status = budget.status;
      const totalAmount = Number(budget.total_amount);
      const paidAmount = Number(newPaidAmount);
      if (paidAmount >= totalAmount) {
        status = 'paid';
      } else if (paidAmount > 0) {
        status = 'ongoing';
      } else {
        status = 'pending';
      }
      await prisma.budgets.update({
        where: { id: budget_id },
        data: {
          paid_amount: newPaidAmount,
          status,
        },
      });
      return {
        id: payment.id,
        budget_id: payment.budget_id,
        amount: Number(payment.amount),
        description: payment.description,
        date: payment.payment_date.toISOString().split('T')[0],
      };
    });
  }
  async findAll() {
    const payments = await this.prismaService.budget_payments.findMany({
      orderBy: { payment_date: 'desc' },
    });
    return payments.map(payment => ({
      id: payment.id,
      budget_id: payment.budget_id,
      amount: Number(payment.amount),
      description: payment.description,
      date: payment.payment_date.toISOString().split('T')[0],
    }));
  }
  async findOne(id: string) {
    const payment = await this.prismaService.budget_payments.findUnique({
      where: { id },
    });
    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }
    return {
      id: payment.id,
      budget_id: payment.budget_id,
      amount: Number(payment.amount),
      description: payment.description,
      date: payment.payment_date.toISOString().split('T')[0],
    };
  }
  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    return this.prismaService.$transaction(async (prisma) => {
      const payment = await prisma.budget_payments.findUnique({
        where: { id },
      });
      if (!payment) {
        throw new NotFoundException('Pago no encontrado');
      }
      const budgetId = payment.budget_id;
      const updatedPayment = await prisma.budget_payments.update({
        where: { id },
        data: {
          amount: updatePaymentDto.amount,
          description: updatePaymentDto.description,
          payment_date: updatePaymentDto.payment_date ? new Date(updatePaymentDto.payment_date) : undefined,
        },
      });
      // Recalcular paid_amount del presupuesto
      const aggregate = await prisma.budget_payments.aggregate({
        where: { budget_id: budgetId },
        _sum: {
          amount: true,
        },
      });
      const newPaidAmount = aggregate._sum.amount ?? 0;
      const budget = await prisma.budgets.findUnique({
        where: { id: budgetId },
      });
      if (budget) {
        let status = budget.status;
        const totalAmount = Number(budget.total_amount);
        const paidAmount = Number(newPaidAmount);
        if (paidAmount >= totalAmount) {
          status = 'paid';
        } else if (paidAmount > 0) {
          status = 'ongoing';
        } else {
          status = 'pending';
        }
        await prisma.budgets.update({
          where: { id: budgetId },
          data: {
            paid_amount: newPaidAmount,
            status,
          },
        });
      }
      return {
        id: updatedPayment.id,
        budget_id: updatedPayment.budget_id,
        amount: Number(updatedPayment.amount),
        description: updatedPayment.description,
        date: updatedPayment.payment_date.toISOString().split('T')[0],
      };
    });
  }
  async remove(id: string) {
    return this.prismaService.$transaction(async (prisma) => {
      const payment = await prisma.budget_payments.findUnique({
        where: { id },
      });
      if (!payment) {
        throw new NotFoundException('Pago no encontrado');
      }
      const budgetId = payment.budget_id;
      await prisma.budget_payments.delete({
        where: { id },
      });
      // Recalcular paid_amount del presupuesto
      const aggregate = await prisma.budget_payments.aggregate({
        where: { budget_id: budgetId },
        _sum: {
          amount: true,
        },
      });
      const newPaidAmount = aggregate._sum.amount ?? 0;
      const budget = await prisma.budgets.findUnique({
        where: { id: budgetId },
      });
      if (budget) {
        let status = budget.status;
        const totalAmount = Number(budget.total_amount);
        const paidAmount = Number(newPaidAmount);
        if (paidAmount >= totalAmount) {
          status = 'paid';
        } else if (paidAmount > 0) {
          status = 'ongoing';
        } else {
          status = 'pending';
        }
        await prisma.budgets.update({
          where: { id: budgetId },
          data: {
            paid_amount: newPaidAmount,
            status,
          },
        });
      }
      return {
        id: payment.id,
        budget_id: payment.budget_id,
        amount: Number(payment.amount),
        description: payment.description,
        date: payment.payment_date.toISOString().split('T')[0],
      };
    });
  }
}