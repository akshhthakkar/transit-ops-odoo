import { Router } from 'express';
import * as reportsController from './reports.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { asyncHandler } from '../../utils/async-handler';

export const reportsRouter = Router();

reportsRouter.use(authenticate);
reportsRouter.use(requireRole('FLEET_MANAGER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'));

// GET /api/reports/dashboard / /api/reports/summary — KPI tiles
reportsRouter.get('/dashboard', asyncHandler(reportsController.getDashboard));
reportsRouter.get('/summary', asyncHandler(reportsController.getDashboard));

// GET /api/reports/vehicles    — per-vehicle cost, efficiency, utilization
reportsRouter.get('/vehicles', asyncHandler(reportsController.getVehicleReport));

// GET /api/reports/trips       — trip history
reportsRouter.get('/trips', asyncHandler(reportsController.getTripReport));

// GET /api/reports/roi         — per-vehicle ROI
reportsRouter.get('/roi', asyncHandler(reportsController.getRoiReport));

// GET /api/reports/export/csv  — CSV export
reportsRouter.get('/export/csv', asyncHandler(reportsController.exportCsv));
