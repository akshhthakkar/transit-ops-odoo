import { Request, Response } from 'express';
import { reportsService } from './reports.service';

export async function getDashboard(req: Request, res: Response): Promise<void> {
  const data = await reportsService.getDashboardKpis();
  res.json(data);
}

export async function getVehicleReport(req: Request, res: Response): Promise<void> {
  const data = await reportsService.getVehicleReport();
  res.json(data);
}

export async function getTripReport(req: Request, res: Response): Promise<void> {
  const data = await reportsService.getTripReport();
  res.json(data);
}

export async function getRoiReport(req: Request, res: Response): Promise<void> {
  const data = await reportsService.getRoiReport();
  res.json(data);
}

export async function exportCsv(req: Request, res: Response): Promise<void> {
  const { type = 'trips' } = req.query;
  const csv = await reportsService.exportCsv(type as string);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${type}-export.csv"`);
  res.send(csv);
}
