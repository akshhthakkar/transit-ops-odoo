import { prisma } from '../../lib/prisma';
import { VehicleStatus } from '@prisma/client';

export interface VehicleFilters {
  page?: number;
  limit?: number;
  status?: VehicleStatus;
  type?: string;
  region?: string;
}

export const vehicleService = {
  async findAll(filters: VehicleFilters = {}) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.type) {
      where.type = { contains: filters.type, mode: 'insensitive' };
    }
    if (filters.region) {
      where.region = { contains: filters.region, mode: 'insensitive' };
    }

    const [total, items] = await Promise.all([
      prisma.vehicle.count({ where }),
      prisma.vehicle.findMany({
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

  async findAvailable() {
    return prisma.vehicle.findMany({
      where: {
        status: 'AVAILABLE',
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.vehicle.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        trips: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            driver: {
              select: { id: true, name: true },
            },
          },
        },
        maintenanceLogs: {
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
      },
    });
  },

  async create(data: {
    registrationNumber: string;
    name: string;
    type: string;
    maxLoadCapacity: number;
    acquisitionCost: number;
    region?: string | null;
    odometer?: number;
  }) {
    const existing = await prisma.vehicle.findFirst({
      where: {
        registrationNumber: data.registrationNumber,
        deletedAt: null, // Allow re-registration of soft deleted vehicles if needed, or enforce strict globally. Let's make it strict.
      },
    });

    if (existing) {
      throw Object.assign(new Error('Vehicle registration number is already in use'), { statusCode: 409 });
    }

    return prisma.vehicle.create({
      data,
    });
  },

  async update(
    id: string,
    data: Partial<{
      registrationNumber: string;
      name: string;
      type: string;
      maxLoadCapacity: number;
      acquisitionCost: number;
      region?: string | null;
      status: VehicleStatus;
      odometer: number;
    }>
  ) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id, deletedAt: null },
    });

    if (!vehicle) {
      throw Object.assign(new Error('Vehicle not found'), { statusCode: 404 });
    }

    if (data.registrationNumber && data.registrationNumber !== vehicle.registrationNumber) {
      const existing = await prisma.vehicle.findFirst({
        where: {
          registrationNumber: data.registrationNumber,
          deletedAt: null,
        },
      });

      if (existing) {
        throw Object.assign(new Error('Vehicle registration number is already in use'), { statusCode: 409 });
      }
    }

    return prisma.vehicle.update({
      where: { id },
      data,
    });
  },

  async remove(id: string) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id, deletedAt: null },
    });

    if (!vehicle) {
      throw Object.assign(new Error('Vehicle not found'), { statusCode: 404 });
    }

    if (vehicle.status === 'ON_TRIP') {
      throw Object.assign(new Error('Cannot delete a vehicle while it is currently on a trip'), { statusCode: 400 });
    }

    // Soft delete
    return prisma.vehicle.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'RETIRED', // retirees aren't available
      },
    });
  },
};
