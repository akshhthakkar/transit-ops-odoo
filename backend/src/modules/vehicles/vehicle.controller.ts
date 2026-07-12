import { Request, Response } from 'express';
import { vehicleService } from './vehicle.service';

export async function getAll(req: Request, res: Response): Promise<void> {
  const vehicles = await vehicleService.findAll();
  res.json(vehicles);
}

export async function getAvailable(req: Request, res: Response): Promise<void> {
  const vehicles = await vehicleService.findAvailable();
  res.json(vehicles);
}

export async function getById(req: Request, res: Response): Promise<void> {
  const vehicle = await vehicleService.findById(req.params.id);
  if (!vehicle) { res.status(404).json({ message: 'Vehicle not found' }); return; }
  res.json(vehicle);
}

export async function create(req: Request, res: Response): Promise<void> {
  const vehicle = await vehicleService.create(req.body);
  res.status(201).json(vehicle);
}

export async function update(req: Request, res: Response): Promise<void> {
  const vehicle = await vehicleService.update(req.params.id, req.body);
  res.json(vehicle);
}

export async function remove(req: Request, res: Response): Promise<void> {
  await vehicleService.remove(req.params.id);
  res.status(204).send();
}
