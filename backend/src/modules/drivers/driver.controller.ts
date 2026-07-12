import { Request, Response } from 'express';
import { driverService } from './driver.service';
import { z } from 'zod';
import { DriverStatus } from '@prisma/client';

const queryFilterSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  status: z.nativeEnum(DriverStatus).optional(),
  licenseCategory: z.string().optional(),
});

const createDriverSchema = z.object({
  name: z.string().min(1, 'Name is required').transform(val => val.trim()),
  licenseNumber: z
    .string()
    .min(1, 'License number is required')
    .transform(val => val.trim().toUpperCase()),
  licenseCategory: z.string().min(1, 'License category is required').transform(val => val.trim()),
  licenseExpiryDate: z
    .string()
    .min(1, 'License expiry date is required')
    .transform(val => new Date(val)),
  contactNumber: z.string().min(1, 'Contact number is required').transform(val => val.trim()),
});

const updateDriverSchema = createDriverSchema.partial().extend({
  safetyScore: z.number().min(0).max(100).optional(),
  status: z.nativeEnum(DriverStatus).optional(),
});

export async function getAll(req: Request, res: Response): Promise<void> {
  const filters = queryFilterSchema.parse(req.query);
  const result = await driverService.findAll(filters);
  res.json(result);
}

export async function getEligible(req: Request, res: Response): Promise<void> {
  const drivers = await driverService.findEligible();
  res.json(drivers);
}

export async function getById(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const { id } = req.params;

  // Driver role can only access their own details
  if (user.role === 'DRIVER' && user.driverId !== id) {
    throw Object.assign(new Error('Forbidden: You can only view your own driver profile'), { statusCode: 403 });
  }

  const driver = await driverService.findById(id);
  if (!driver) {
    throw Object.assign(new Error('Driver not found'), { statusCode: 404 });
  }
  res.json(driver);
}

export async function create(req: Request, res: Response): Promise<void> {
  const body = createDriverSchema.parse(req.body);
  const driver = await driverService.create(body);
  res.status(201).json(driver);
}

export async function update(req: Request, res: Response): Promise<void> {
  const body = updateDriverSchema.parse(req.body);
  const driver = await driverService.update(req.params.id, body);
  res.json(driver);
}

export async function remove(req: Request, res: Response): Promise<void> {
  await driverService.remove(req.params.id);
  res.status(204).send();
}
