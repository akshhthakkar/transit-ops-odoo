import { Request, Response } from 'express';
import { authService } from './auth.service';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = loginSchema.parse(req.body);
  const result = await authService.login(email, password);
  res.json(result);
}

export async function getMe(req: Request, res: Response): Promise<void> {
  // req.user is attached by authenticate middleware
  if (!req.user) {
    throw Object.assign(new Error('Unauthenticated'), { statusCode: 401 });
  }
  res.json({ user: req.user });
}
