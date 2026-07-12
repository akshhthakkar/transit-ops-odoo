import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
}

export function errorMiddleware(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status  = err.statusCode ?? 500;
  const message = err.message    ?? 'Internal Server Error';

  console.error(`[ERROR] ${status} — ${message}`, err.stack);

  res.status(status).json({ message });
}
