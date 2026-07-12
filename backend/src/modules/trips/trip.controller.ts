import { Request, Response } from 'express';
import { tripService } from './trip.service';

export async function getAll(req: Request, res: Response): Promise<void> {
  const trips = await tripService.findAll();
  res.json(trips);
}

export async function getById(req: Request, res: Response): Promise<void> {
  const trip = await tripService.findById(req.params.id);
  if (!trip) { res.status(404).json({ message: 'Trip not found' }); return; }
  res.json(trip);
}

export async function create(req: Request, res: Response): Promise<void> {
  const trip = await tripService.create(req.body);
  res.status(201).json(trip);
}

export async function dispatch(req: Request, res: Response): Promise<void> {
  const trip = await tripService.dispatch(req.params.id);
  res.json(trip);
}

export async function complete(req: Request, res: Response): Promise<void> {
  const trip = await tripService.complete(req.params.id, req.body);
  res.json(trip);
}

export async function cancel(req: Request, res: Response): Promise<void> {
  const trip = await tripService.cancel(req.params.id);
  res.json(trip);
}
