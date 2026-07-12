import { Request, Response } from 'express';
import { vehicleService } from './vehicle.service';
import { z } from 'zod';
import { VehicleStatus } from '@prisma/client';

const queryFilterSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  status: z.nativeEnum(VehicleStatus).optional(),
  type: z.string().optional(),
  region: z.string().optional(),
});

const createVehicleSchema = z.object({
  registrationNumber: z
    .string()
    .min(1, 'Registration number is required')
    .transform(val => val.trim().toUpperCase()),
  name: z.string().min(1, 'Name is required').transform(val => val.trim()),
  type: z.string().min(1, 'Type is required').transform(val => val.trim()),
  maxLoadCapacity: z.number().positive('Max load capacity must be positive'),
  acquisitionCost: z.number().nonnegative('Acquisition cost must be positive or zero'),
  region: z
    .string()
    .optional()
    .transform(val => val?.trim() || null),
});

const updateVehicleSchema = createVehicleSchema.partial().extend({
  status: z.nativeEnum(VehicleStatus).optional(),
  odometer: z.number().nonnegative('Odometer reading must be positive or zero').optional(),
});

export async function getAll(req: Request, res: Response): Promise<void> {
  const filters = queryFilterSchema.parse(req.query);
  const result = await vehicleService.findAll(filters);
  res.json(result);
}

export async function getAvailable(req: Request, res: Response): Promise<void> {
  const vehicles = await vehicleService.findAvailable();
  res.json(vehicles);
}

export async function getById(req: Request, res: Response): Promise<void> {
  const vehicle = await vehicleService.findById(req.params.id);
  if (!vehicle) {
    throw Object.assign(new Error('Vehicle not found'), { statusCode: 404 });
  }
  res.json(vehicle);
}

export async function create(req: Request, res: Response): Promise<void> {
  const body = createVehicleSchema.parse(req.body);
  const vehicle = await vehicleService.create(body);
  res.status(201).json(vehicle);
}

export async function update(req: Request, res: Response): Promise<void> {
  const body = updateVehicleSchema.parse(req.body);
  const vehicle = await vehicleService.update(req.params.id, body);
  res.json(vehicle);
}

export async function remove(req: Request, res: Response): Promise<void> {
  await vehicleService.remove(req.params.id);
  res.status(204).send();
}
