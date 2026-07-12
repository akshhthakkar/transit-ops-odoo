import { Request, Response } from 'express';
import { maintenanceService } from './maintenance.service';
import { z } from 'zod';

const createLogSchema = z.object({
  vehicleId: z.string().uuid('Invalid Vehicle ID'),
  maintenanceType: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  vendorId: z.string().uuid('Invalid Vendor ID').optional().nullable().transform(v => v === null ? undefined : v),
  priority: z.string().optional(),
  cost: z.number().nonnegative('Cost cannot be negative'),
});

export async function getAll(req: Request, res: Response): Promise<void> {
  const logs = await maintenanceService.findAll();
  res.json(logs);
}

export async function getById(req: Request, res: Response): Promise<void> {
  const log = await maintenanceService.findById(req.params.id);
  if (!log) {
    res.status(404).json({ message: 'Maintenance log not found' });
    return;
  }
  res.json(log);
}

export async function create(req: Request, res: Response): Promise<void> {
  const body = createLogSchema.parse(req.body);
  const log = await maintenanceService.create(body, req.user!);
  res.status(201).json(log);
}

export async function close(req: Request, res: Response): Promise<void> {
  const log = await maintenanceService.close(req.params.id, req.user!);
  res.json(log);
}
