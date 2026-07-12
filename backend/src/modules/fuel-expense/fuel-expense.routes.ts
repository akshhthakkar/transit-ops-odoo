import { Router } from 'express';
import * as fuelExpenseController from './fuel-expense.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { asyncHandler } from '../../utils/async-handler';

export const fuelExpenseRouter = Router();

fuelExpenseRouter.use(authenticate);

// ── Fuel logs ────────────────────────────────────────────────────────────────
// GET  /api/fuel?vehicleId=
fuelExpenseRouter.get('/logs', requireRole('FLEET_MANAGER', 'DRIVER', 'FINANCIAL_ANALYST'), asyncHandler(fuelExpenseController.getFuelLogs));

// POST /api/fuel/logs
fuelExpenseRouter.post(
  '/logs',
  requireRole('FLEET_MANAGER', 'DRIVER'),
  asyncHandler(fuelExpenseController.createFuelLog)
);

// ── Expenses ─────────────────────────────────────────────────────────────────
// GET  /api/fuel/expenses?vehicleId=
fuelExpenseRouter.get('/expenses', requireRole('FLEET_MANAGER', 'DRIVER', 'FINANCIAL_ANALYST'), asyncHandler(fuelExpenseController.getExpenses));

// POST /api/fuel/expenses
fuelExpenseRouter.post(
  '/expenses',
  requireRole('FLEET_MANAGER', 'DRIVER'),
  asyncHandler(fuelExpenseController.createExpense)
);
