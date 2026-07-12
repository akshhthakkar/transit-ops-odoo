import { Router } from 'express';
import * as tripController from './trip.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { asyncHandler } from '../../utils/async-handler';

export const tripRouter = Router();

tripRouter.use(authenticate);

// GET  /api/trips
tripRouter.get('/', asyncHandler(tripController.getAll));

// GET  /api/trips/:id
tripRouter.get('/:id', asyncHandler(tripController.getById));

// POST /api/trips  — create a DRAFT trip
tripRouter.post(
  '/',
  requireRole('FLEET_MANAGER', 'DRIVER'),
  asyncHandler(tripController.create)
);

// POST /api/trips/:id/dispatch
tripRouter.post(
  '/:id/dispatch',
  requireRole('FLEET_MANAGER', 'DRIVER'),
  asyncHandler(tripController.dispatch)
);

// POST /api/trips/:id/complete
tripRouter.post(
  '/:id/complete',
  requireRole('FLEET_MANAGER', 'DRIVER'),
  asyncHandler(tripController.complete)
);

// POST /api/trips/:id/cancel
tripRouter.post(
  '/:id/cancel',
  requireRole('FLEET_MANAGER', 'DRIVER'),
  asyncHandler(tripController.cancel)
);
