import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { message: 'Too many login attempts, please try again in a minute' },
  standardHeaders: true,
  legacyHeaders: false,
});
