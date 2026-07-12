import { prisma } from '../../lib/prisma';

export const driverService = {
  async findAll() {
    return prisma.driver.findMany({ orderBy: { createdAt: 'desc' } });
  },

  async findEligible() {
    // Eligible = AVAILABLE status + license not expired
    // TODO: implement in Phase 2
    return prisma.driver.findMany({
      where: {
        status: 'AVAILABLE',
        licenseExpiryDate: { gt: new Date() },
      },
    });
  },

  async findById(id: string) {
    return prisma.driver.findUnique({ where: { id } });
  },

  async create(data: unknown) {
    // TODO: implement in Phase 2 — validate with Zod
    throw new Error('Not implemented');
  },

  async update(id: string, data: unknown) {
    // TODO: implement in Phase 2
    throw new Error('Not implemented');
  },
};
