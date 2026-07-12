import { Request, Response, NextFunction } from 'express';

/**
 * Factory that returns middleware requiring the authenticated user's role
 * to be in the provided list.
 *
 * Usage: router.use(requireRole('FLEET_MANAGER', 'SAFETY_OFFICER'))
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ message: 'Forbidden: insufficient role' });
      return;
    }
    next();
  };
}
