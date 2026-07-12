import { Router } from 'express';
import * as vehicleController from './vehicle.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { asyncHandler } from '../../utils/async-handler';

export const vehicleRouter = Router();

vehicleRouter.use(authenticate);

// GET  /api/vehicles/available  — eligible vehicles for trip creation
vehicleRouter.get('/available', asyncHandler(vehicleController.getAvailable));

// GET  /api/vehicles
vehicleRouter.get('/', asyncHandler(vehicleController.getAll));

// GET  /api/vehicles/:id
vehicleRouter.get('/:id', asyncHandler(vehicleController.getById));

// POST /api/vehicles  — Fleet Manager only
vehicleRouter.post('/', requireRole('FLEET_MANAGER'), asyncHandler(vehicleController.create));

// PATCH /api/vehicles/:id  — Fleet Manager only
vehicleRouter.patch('/:id', requireRole('FLEET_MANAGER'), asyncHandler(vehicleController.update));

// DELETE /api/vehicles/:id  — Fleet Manager only
vehicleRouter.delete('/:id', requireRole('FLEET_MANAGER'), asyncHandler(vehicleController.remove));
