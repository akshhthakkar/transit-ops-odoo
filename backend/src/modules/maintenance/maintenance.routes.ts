import { Router } from 'express';
import * as maintenanceController from './maintenance.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { asyncHandler } from '../../utils/async-handler';

export const maintenanceRouter = Router();

maintenanceRouter.use(authenticate);

// GET /api/maintenance
maintenanceRouter.get('/', asyncHandler(maintenanceController.getAll));

// GET /api/maintenance/:id
maintenanceRouter.get('/:id', asyncHandler(maintenanceController.getById));

// POST /api/maintenance  — creates log + sets vehicle → IN_SHOP (transaction)
maintenanceRouter.post(
  '/',
  requireRole('FLEET_MANAGER'),
  asyncHandler(maintenanceController.create)
);

// POST /api/maintenance/:id/close  — closes log + sets vehicle → AVAILABLE (transaction)
maintenanceRouter.post(
  '/:id/close',
  requireRole('FLEET_MANAGER'),
  asyncHandler(maintenanceController.close)
);
