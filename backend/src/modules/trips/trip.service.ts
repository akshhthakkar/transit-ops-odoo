import { prisma } from '../../lib/prisma';

/**
 * Trip service — this is where the state machine / rule engine will live.
 * All state transitions (dispatch, complete, cancel) MUST use prisma.$transaction
 * to keep vehicle + driver statuses in sync atomically.
 *
 * Business rules to enforce here (Phase 3):
 *   - Vehicle must be AVAILABLE to dispatch
 *   - Driver must be AVAILABLE + license not expired to dispatch
 *   - cargoWeight <= vehicle.maxLoadCapacity
 *   - Dispatch:  vehicle + driver → ON_TRIP   (atomic)
 *   - Complete:  vehicle + driver → AVAILABLE (atomic)
 *   - Cancel:    vehicle + driver → AVAILABLE (atomic)
 */
export const tripService = {
  async findAll() {
    return prisma.trip.findMany({
      include: { vehicle: true, driver: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true, fuelLogs: true },
    });
  },

  async create(data: unknown) {
    // TODO: implement in Phase 3
    // 1. Validate input (Zod)
    // 2. Check vehicle AVAILABLE, driver AVAILABLE + license valid
    // 3. Check cargoWeight <= vehicle.maxLoadCapacity
    // 4. Create trip with status DRAFT
    throw new Error('Not implemented');
  },

  async dispatch(id: string) {
    // TODO: implement in Phase 3 — use prisma.$transaction
    throw new Error('Not implemented');
  },

  async complete(id: string, data: unknown) {
    // TODO: implement in Phase 3 — use prisma.$transaction
    throw new Error('Not implemented');
  },

  async cancel(id: string) {
    // TODO: implement in Phase 3 — use prisma.$transaction
    throw new Error('Not implemented');
  },
};
