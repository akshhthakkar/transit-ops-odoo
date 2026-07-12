import { Request, Response } from 'express';
import { fuelExpenseService } from './fuel-expense.service';
import { z } from 'zod';
import { ExpenseType } from '@prisma/client';

const queryFilterSchema = z.object({
  vehicleId: z.string().uuid().optional(),
  type: z.nativeEnum(ExpenseType).optional(),
});

const createFuelLogSchema = z.object({
  vehicleId: z.string().uuid('Invalid Vehicle ID'),
  tripId: z.string().uuid('Invalid Trip ID').optional().nullable().transform(v => v === null ? undefined : v),
  liters: z.number().positive('Liters must be positive'),
  pricePerLiter: z.number().positive('Price per liter must be positive').optional().nullable().transform(v => v === null ? undefined : v),
  cost: z.number().positive('Cost must be positive'),
  vendorId: z.string().uuid('Invalid Vendor ID').optional().nullable().transform(v => v === null ? undefined : v),
  odometer: z.number().positive('Odometer must be positive').optional().nullable().transform(v => v === null ? undefined : v),
  date: z.string().datetime({ precision: 3 }).optional(),
});

const createExpenseSchema = z.object({
  vehicleId: z.string().uuid('Invalid Vehicle ID'),
  tripId: z.string().uuid('Invalid Trip ID').optional().nullable().transform(v => v === null ? undefined : v),
  type: z.nativeEnum(ExpenseType),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().datetime({ precision: 3 }).optional(),
});

export async function getFuelLogs(req: Request, res: Response): Promise<void> {
  const filters = queryFilterSchema.parse(req.query);
  const logs = await fuelExpenseService.findFuelLogs(req.user!, filters.vehicleId);
  res.json(logs);
}

export async function createFuelLog(req: Request, res: Response): Promise<void> {
  const body = createFuelLogSchema.parse(req.body);
  const log = await fuelExpenseService.createFuelLog(body, req.user!);
  res.status(201).json(log);
}

export async function getExpenses(req: Request, res: Response): Promise<void> {
  const filters = queryFilterSchema.parse(req.query);
  const expenses = await fuelExpenseService.findExpenses(req.user!, filters.vehicleId, filters.type);
  res.json(expenses);
}

export async function createExpense(req: Request, res: Response): Promise<void> {
  const body = createExpenseSchema.parse(req.body);
  const expense = await fuelExpenseService.createExpense(body, req.user!);
  res.status(201).json(expense);
}
