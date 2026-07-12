import { prisma } from '../../lib/prisma';

export const fuelExpenseService = {
  async findFuelLogs(vehicleId?: string) {
    return prisma.fuelLog.findMany({
      where: vehicleId ? { vehicleId } : undefined,
      include: { vehicle: true, trip: true },
      orderBy: { date: 'desc' },
    });
  },

  async createFuelLog(data: unknown) {
    // TODO: implement in Phase 4 — validate with Zod
    throw new Error('Not implemented');
  },

  async findExpenses(vehicleId?: string) {
    return prisma.expense.findMany({
      where: vehicleId ? { vehicleId } : undefined,
      include: { vehicle: true },
      orderBy: { date: 'desc' },
    });
  },

  async createExpense(data: unknown) {
    // TODO: implement in Phase 4 — validate with Zod
    throw new Error('Not implemented');
  },
};
