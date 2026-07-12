import { Request, Response } from 'express';
import { driverService } from './driver.service';

export async function getAll(req: Request, res: Response): Promise<void> {
  const drivers = await driverService.findAll();
  res.json(drivers);
}

export async function getEligible(req: Request, res: Response): Promise<void> {
  const drivers = await driverService.findEligible();
  res.json(drivers);
}

export async function getById(req: Request, res: Response): Promise<void> {
  const driver = await driverService.findById(req.params.id);
  if (!driver) { res.status(404).json({ message: 'Driver not found' }); return; }
  res.json(driver);
}

export async function create(req: Request, res: Response): Promise<void> {
  const driver = await driverService.create(req.body);
  res.status(201).json(driver);
}

export async function update(req: Request, res: Response): Promise<void> {
  const driver = await driverService.update(req.params.id, req.body);
  res.json(driver);
}
