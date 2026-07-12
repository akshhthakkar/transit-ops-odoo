import { prisma } from '../../lib/prisma';

export const vehicleService = {
  async findAll() {
    // TODO: implement in Phase 2
    return prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } });
  },

  async findAvailable() {
    // Returns only AVAILABLE vehicles — used by trip creation dropdown
    // TODO: implement in Phase 2
    return prisma.vehicle.findMany({ where: { status: 'AVAILABLE' } });
  },

  async findById(id: string) {
    // TODO: implement in Phase 2
    return prisma.vehicle.findUnique({ where: { id } });
  },

  async create(data: unknown) {
    // TODO: implement in Phase 2 — validate with Zod before passing to Prisma
    throw new Error('Not implemented');
  },

  async update(id: string, data: unknown) {
    // TODO: implement in Phase 2
    throw new Error('Not implemented');
  },

  async remove(id: string) {
    // TODO: implement in Phase 2
    throw new Error('Not implemented');
  },
};
