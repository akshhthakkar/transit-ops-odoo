import { Request, Response } from 'express';
import { tripService } from './trip.service';
import { z } from 'zod';
import { TripStatus } from '@prisma/client';

const queryFilterSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  status: z.nativeEnum(TripStatus).optional(),
});

const createTripSchema = z.object({
  source: z.string().min(1, 'Source is required'),
  destination: z.string().min(1, 'Destination is required'),
  vehicleId: z.string().uuid('Invalid Vehicle ID'),
  driverId: z.string().uuid('Invalid Driver ID'),
  cargoWeight: z.number().positive('Cargo weight must be positive'),
  plannedDistance: z.number().positive('Planned distance must be positive'),
});

const completeTripSchema = z.object({
  actualDistance: z.number().positive('Actual distance must be positive'),
  fuelConsumed: z.number().positive('Fuel consumed must be positive'),
  revenue: z.number().nonnegative('Revenue cannot be negative').optional(),
});

export async function getAll(req: Request, res: Response): Promise<void> {
  const filters = queryFilterSchema.parse(req.query);
  const result = await tripService.findAll(req.user!, filters);
  res.json(result);
}

export async function getById(req: Request, res: Response): Promise<void> {
  const trip = await tripService.findById(req.params.id, req.user!);
  res.json(trip);
}

export async function create(req: Request, res: Response): Promise<void> {
  const body = createTripSchema.parse(req.body);
  const trip = await tripService.create(body, req.user!);
  res.status(201).json(trip);
}

export async function dispatch(req: Request, res: Response): Promise<void> {
  const trip = await tripService.dispatch(req.params.id, req.user!);
  res.json(trip);
}

export async function complete(req: Request, res: Response): Promise<void> {
  const body = completeTripSchema.parse(req.body);
  const trip = await tripService.complete(req.params.id, body, req.user!);
  res.json(trip);
}

export async function cancel(req: Request, res: Response): Promise<void> {
  const trip = await tripService.cancel(req.params.id, req.user!);
  res.json(trip);
}
