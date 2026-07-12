import { Request, Response } from 'express';
import { authService } from './auth.service';

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json(result);
}

export async function getMe(req: Request, res: Response): Promise<void> {
  // req.user is attached by authenticate middleware
  res.json({ user: req.user });
}
