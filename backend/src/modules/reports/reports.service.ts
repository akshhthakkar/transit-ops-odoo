import { prisma } from '../../lib/prisma';

/**
 * All values computed on read — never stored.
 *
 * Derived formulas (Phase 5):
 *   totalOperationalCost(v) = sum(fuelLogs.cost) + sum(maintenanceLogs.cost)
 *   fuelEfficiency(v)       = sum(trips.actualDistance) / sum(fuelLogs.liters)
 *   fleetUtilization        = ON_TRIP vehicles / total non-RETIRED vehicles
 *   roi(v)                  = (sum(trips.revenue) - totalOpCost) / acquisitionCost
 */
export const reportsService = {
  async getDashboardKpis() {
    // TODO: implement in Phase 5
    // Return: active vehicles, on-trip vehicles, in-shop vehicles,
    //         active trips, pending trips, drivers on duty, utilization %
    throw new Error('Not implemented');
  },

  async getVehicleReport() {
    // TODO: implement in Phase 5
    throw new Error('Not implemented');
  },

  async getTripReport() {
    // TODO: implement in Phase 5
    return prisma.trip.findMany({
      include: { vehicle: true, driver: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getRoiReport() {
    // TODO: implement in Phase 5
    throw new Error('Not implemented');
  },

  async exportCsv(type: string) {
    // TODO: implement in Phase 5 — stringify relevant Prisma results as CSV
    throw new Error('Not implemented');
  },
};
