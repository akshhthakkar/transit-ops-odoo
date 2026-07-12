import { prisma } from '../../lib/prisma';
import { MaintenanceStatus } from '@prisma/client';

export const maintenanceService = {
  async findAll() {
    return prisma.maintenanceLog.findMany({
      where: { deletedAt: null },
      include: {
        vehicle: {
          select: { id: true, registrationNumber: true, name: true, status: true },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.maintenanceLog.findFirst({
      where: { id, deletedAt: null },
      include: {
        vehicle: true,
      },
    });
  },

  async create(
    data: {
      vehicleId: string;
      maintenanceType?: string;
      description: string;
      priority?: string;
      cost: number;
    },
    reqUser: any
  ) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: data.vehicleId, deletedAt: null },
    });

    if (!vehicle) {
      throw Object.assign(new Error('Vehicle not found'), { statusCode: 404 });
    }

    if (vehicle.status === 'ON_TRIP') {
      throw Object.assign(new Error('Cannot send a vehicle currently on a trip to maintenance'), { statusCode: 400 });
    }

    return prisma.$transaction(async (tx) => {
      // Create maintenance log
      const log = await tx.maintenanceLog.create({
        data: {
          vehicleId: data.vehicleId,
          maintenanceType: data.maintenanceType,
          description: data.description,
          priority: data.priority,
          cost: data.cost,
          status: 'ACTIVE',
          createdById: reqUser.id,
        },
        include: { vehicle: true },
      });

      // Update vehicle status
      await tx.vehicle.update({
        where: { id: data.vehicleId },
        data: { status: 'IN_SHOP' },
      });

      return log;
    }, { timeout: 15000 });
  },

  async close(id: string, reqUser: any) {
    const log = await prisma.maintenanceLog.findFirst({
      where: { id, deletedAt: null },
    });

    if (!log) {
      throw Object.assign(new Error('Maintenance log not found'), { statusCode: 404 });
    }

    if (log.status === 'CLOSED') {
      throw Object.assign(new Error('Maintenance log is already closed'), { statusCode: 400 });
    }

    return prisma.$transaction(async (tx) => {
      // Close log
      const updatedLog = await tx.maintenanceLog.update({
        where: { id },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
          updatedById: reqUser.id,
        },
        include: { vehicle: true },
      });

      // Update vehicle status back to AVAILABLE unless it is RETIRED
      const vehicle = await tx.vehicle.findUnique({
        where: { id: log.vehicleId },
      });

      if (vehicle && vehicle.status !== 'RETIRED') {
        await tx.vehicle.update({
          where: { id: log.vehicleId },
          data: { status: 'AVAILABLE' },
        });
      }

      return updatedLog;
    }, { timeout: 15000 });
  },
};
