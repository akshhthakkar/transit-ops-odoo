import { prisma } from '../../lib/prisma';
import { DriverStatus } from '@prisma/client';

export interface DriverFilters {
  page?: number;
  limit?: number;
  status?: DriverStatus;
  licenseCategory?: string;
}

export const driverService = {
  async findAll(filters: DriverFilters = {}) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.licenseCategory) {
      where.licenseCategory = { contains: filters.licenseCategory, mode: 'insensitive' };
    }

    const [total, items] = await Promise.all([
      prisma.driver.count({ where }),
      prisma.driver.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      total,
      page,
      limit,
      items,
    };
  },

  async findEligible() {
    return prisma.driver.findMany({
      where: {
        status: 'AVAILABLE',
        licenseExpiryDate: { gt: new Date() },
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.driver.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        trips: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            vehicle: {
              select: { id: true, registrationNumber: true, name: true },
            },
          },
        },
      },
    });
  },

  async create(data: {
    name: string;
    licenseNumber: string;
    licenseCategory: string;
    licenseExpiryDate: Date;
    contactNumber: string;
  }) {
    const existing = await prisma.driver.findFirst({
      where: {
        licenseNumber: data.licenseNumber,
        deletedAt: null,
      },
    });

    if (existing) {
      throw Object.assign(new Error('Driver license number is already in use'), { statusCode: 409 });
    }

    return prisma.driver.create({
      data,
    });
  },

  async update(
    id: string,
    data: Partial<{
      name: string;
      licenseNumber: string;
      licenseCategory: string;
      licenseExpiryDate: Date;
      contactNumber: string;
      safetyScore: number;
      status: DriverStatus;
    }>
  ) {
    const driver = await prisma.driver.findFirst({
      where: { id, deletedAt: null },
    });

    if (!driver) {
      throw Object.assign(new Error('Driver not found'), { statusCode: 404 });
    }

    if (data.licenseNumber && data.licenseNumber !== driver.licenseNumber) {
      const existing = await prisma.driver.findFirst({
        where: {
          licenseNumber: data.licenseNumber,
          deletedAt: null,
        },
      });

      if (existing) {
        throw Object.assign(new Error('Driver license number is already in use'), { statusCode: 409 });
      }
    }

    return prisma.driver.update({
      where: { id },
      data,
    });
  },

  async remove(id: string) {
    const driver = await prisma.driver.findFirst({
      where: { id, deletedAt: null },
    });

    if (!driver) {
      throw Object.assign(new Error('Driver not found'), { statusCode: 404 });
    }

    if (driver.status === 'ON_TRIP') {
      throw Object.assign(new Error('Cannot delete a driver while they are currently on a trip'), { statusCode: 400 });
    }

    return prisma.driver.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'OFF_DUTY',
      },
    });
  },
};
