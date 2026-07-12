import { Router } from 'express';
import * as driverController from './driver.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { asyncHandler } from '../../utils/async-handler';

export const driverRouter = Router();

driverRouter.use(authenticate);

// GET /api/drivers/eligible  — for trip creation dropdown (must come before /:id)
driverRouter.get('/eligible', asyncHandler(driverController.getEligible));

// GET /api/drivers
driverRouter.get('/', asyncHandler(driverController.getAll));

// GET /api/drivers/:id
driverRouter.get('/:id', asyncHandler(driverController.getById));

// POST /api/drivers
driverRouter.post('/', requireRole('FLEET_MANAGER'), asyncHandler(driverController.create));

// PATCH /api/drivers/:id
driverRouter.patch('/:id', requireRole('FLEET_MANAGER'), asyncHandler(driverController.update));
