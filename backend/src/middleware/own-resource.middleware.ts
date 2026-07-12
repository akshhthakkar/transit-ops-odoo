import { Request } from 'express';

/**
 * Checks if the logged-in user has the permission to modify or read a resource.
 * If the user's role is DRIVER, they are only authorized if the resource's
 * driverId matches their linked driverId.
 *
 * Usage in service/controller layers:
 * checkOwnership(trip.driverId, req)
 */
export function checkOwnership(resourceDriverId: string | null, req: Request): void {
  const user = req.user;
  if (!user) {
    throw Object.assign(new Error('Unauthenticated'), { statusCode: 401 });
  }

  // Drivers can only access their own resources.
  if (user.role === 'DRIVER') {
    if (!user.driverId || user.driverId !== resourceDriverId) {
      throw Object.assign(new Error('Forbidden: Not authorized to access this resource'), { statusCode: 403 });
    }
  }
}
