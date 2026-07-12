import { Request, Response } from 'express';
import { maintenanceService } from './maintenance.service';

export async function getAll(req: Request, res: Response): Promise<void> {
  const logs = await maintenanceService.findAll();
  res.json(logs);
}

export async function getById(req: Request, res: Response): Promise<void> {
  const log = await maintenanceService.findById(req.params.id);
  if (!log) { res.status(404).json({ message: 'Maintenance log not found' }); return; }
  res.json(log);
}

export async function create(req: Request, res: Response): Promise<void> {
  const log = await maintenanceService.create(req.body);
  res.status(201).json(log);
}

export async function close(req: Request, res: Response): Promise<void> {
  const log = await maintenanceService.close(req.params.id);
  res.json(log);
}
