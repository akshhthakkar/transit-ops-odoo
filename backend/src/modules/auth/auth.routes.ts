import { Router } from 'express';
import { login, getMe } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/async-handler';
import { loginLimiter } from '../../middleware/rate-limiter.middleware';

export const authRouter = Router();

// POST /api/auth/login
authRouter.post('/login', loginLimiter, asyncHandler(login));

// GET /api/auth/me  — requires valid JWT
authRouter.get('/me', authenticate, asyncHandler(getMe));
