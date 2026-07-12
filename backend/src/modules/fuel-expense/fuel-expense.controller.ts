import { Request, Response } from 'express';
import { fuelExpenseService } from './fuel-expense.service';

export async function getFuelLogs(req: Request, res: Response): Promise<void> {
  const { vehicleId } = req.query;
  const logs = await fuelExpenseService.findFuelLogs(vehicleId as string | undefined);
  res.json(logs);
}

export async function createFuelLog(req: Request, res: Response): Promise<void> {
  const log = await fuelExpenseService.createFuelLog(req.body);
  res.status(201).json(log);
}

export async function getExpenses(req: Request, res: Response): Promise<void> {
  const { vehicleId } = req.query;
  const expenses = await fuelExpenseService.findExpenses(vehicleId as string | undefined);
  res.json(expenses);
}

export async function createExpense(req: Request, res: Response): Promise<void> {
  const expense = await fuelExpenseService.createExpense(req.body);
  res.status(201).json(expense);
}
