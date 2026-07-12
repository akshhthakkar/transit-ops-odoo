import { prisma } from '../../lib/prisma';

export const maintenanceService = {
  async findAll() {
    return prisma.maintenanceLog.findMany({
      include: { vehicle: true },
      orderBy: { startedAt: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.maintenanceLog.findUnique({
      where: { id },
      include: { vehicle: true },
    });
  },

  async create(data: unknown) {
    // TODO: implement in Phase 4
    // Use prisma.$transaction:
    //   1. Create MaintenanceLog (status: ACTIVE)
    //   2. Set vehicle.status = IN_SHOP
    throw new Error('Not implemented');
  },

  async close(id: string) {
    // TODO: implement in Phase 4
    // Use prisma.$transaction:
    //   1. Set MaintenanceLog.status = CLOSED, closedAt = now()
    //   2. Set vehicle.status = AVAILABLE (unless RETIRED)
    throw new Error('Not implemented');
  },
};
