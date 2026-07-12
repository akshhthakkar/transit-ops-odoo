import { prisma } from '../../lib/prisma';
import { TripStatus } from '@prisma/client';

export interface TripFilters {
  page?: number;
  limit?: number;
  status?: TripStatus;
}

function verifyOwnership(driverId: string | null, reqUser: any) {
  if (reqUser.role === 'DRIVER') {
    if (!reqUser.driverId || reqUser.driverId !== driverId) {
      throw Object.assign(new Error('Forbidden: You do not have access to this resource'), { statusCode: 403 });
    }
  }
}

export const tripService = {
  async findAll(reqUser: any, filters: TripFilters = {}) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    // Scoping check: Drivers see only their own trips
    if (reqUser.role === 'DRIVER') {
      where.driverId = reqUser.driverId || 'non-existent-uuid';
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const [total, items] = await Promise.all([
      prisma.trip.count({ where }),
      prisma.trip.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vehicle: {
            select: { id: true, registrationNumber: true, name: true },
          },
          driver: {
            select: { id: true, name: true },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      items,
    };
  },

  async findById(id: string, reqUser: any) {
    const trip = await prisma.trip.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        vehicle: true,
        driver: true,
        fuelLogs: {
          where: { deletedAt: null },
        },
        expenses: {
          where: { deletedAt: null },
        },
      },
    });

    if (!trip) {
      throw Object.assign(new Error('Trip not found'), { statusCode: 404 });
    }

    verifyOwnership(trip.driverId, reqUser);

    return trip;
  },

  async create(data: {
    source: string;
    destination: string;
    vehicleId: string;
    driverId: string;
    cargoWeight: number;
    plannedDistance: number;
  }) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: data.vehicleId, deletedAt: null },
    });
    if (!vehicle) {
      throw Object.assign(new Error('Vehicle not found'), { statusCode: 404 });
    }
    if (vehicle.status !== 'AVAILABLE') {
      throw Object.assign(new Error(`Vehicle ${vehicle.registrationNumber} is not available (status: ${vehicle.status})`), { statusCode: 400 });
    }
    if (data.cargoWeight > vehicle.maxLoadCapacity) {
      throw Object.assign(
        new Error(`Cargo weight (${data.cargoWeight} kg) exceeds vehicle maximum capacity (${vehicle.maxLoadCapacity} kg)`),
        { statusCode: 400 }
      );
    }

    const driver = await prisma.driver.findFirst({
      where: { id: data.driverId, deletedAt: null },
    });
    if (!driver) {
      throw Object.assign(new Error('Driver not found'), { statusCode: 404 });
    }
    if (driver.status !== 'AVAILABLE') {
      throw Object.assign(new Error(`Driver ${driver.name} is not available (status: ${driver.status})`), { statusCode: 400 });
    }
    if (new Date(driver.licenseExpiryDate).getTime() < Date.now()) {
      throw Object.assign(new Error(`Driver ${driver.name} has an expired license`), { statusCode: 400 });
    }

    return prisma.trip.create({
      data: {
        source: data.source,
        destination: data.destination,
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        cargoWeight: data.cargoWeight,
        plannedDistance: data.plannedDistance,
        status: 'DRAFT',
      },
    });
  },

  async dispatch(id: string, reqUser: any) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findFirst({
        where: { id, deletedAt: null },
      });
      if (!trip) {
        throw Object.assign(new Error('Trip not found'), { statusCode: 404 });
      }
      verifyOwnership(trip.driverId, reqUser);

      if (trip.status !== 'DRAFT') {
        throw Object.assign(new Error(`Trip is not in DRAFT state (current state: ${trip.status})`), { statusCode: 400 });
      }

      // Verify availability fresh inside the transaction
      const vehicle = await tx.vehicle.findFirst({
        where: { id: trip.vehicleId, deletedAt: null },
      });
      if (!vehicle || vehicle.status !== 'AVAILABLE') {
        throw Object.assign(new Error('Vehicle is no longer available'), { statusCode: 400 });
      }

      const driver = await tx.driver.findFirst({
        where: { id: trip.driverId, deletedAt: null },
      });
      if (!driver || driver.status !== 'AVAILABLE') {
        throw Object.assign(new Error('Driver is no longer available'), { statusCode: 400 });
      }

      // Update statuses atomically
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'ON_TRIP' },
      });

      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: 'ON_TRIP' },
      });

      return tx.trip.update({
        where: { id },
        data: {
          status: 'DISPATCHED',
          dispatchedAt: new Date(),
        },
        include: { vehicle: true, driver: true },
      });
    }, { timeout: 15000 });
  },

  async complete(
    id: string,
    data: {
      actualDistance: number;
      fuelConsumed: number;
      revenue?: number;
    },
    reqUser: any
  ) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findFirst({
        where: { id, deletedAt: null },
      });
      if (!trip) {
        throw Object.assign(new Error('Trip not found'), { statusCode: 404 });
      }
      verifyOwnership(trip.driverId, reqUser);

      if (trip.status !== 'DISPATCHED') {
        throw Object.assign(new Error(`Trip is not active (current state: ${trip.status})`), { statusCode: 400 });
      }

      // Update vehicle odometer and availability
      const vehicle = await tx.vehicle.findUnique({
        where: { id: trip.vehicleId },
      });
      if (vehicle) {
        await tx.vehicle.update({
          where: { id: trip.vehicleId },
          data: {
            status: 'AVAILABLE',
            odometer: vehicle.odometer + data.actualDistance,
          },
        });
      }

      // Update driver availability
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: 'AVAILABLE' },
      });

      // Complete trip
      return tx.trip.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          actualDistance: data.actualDistance,
          fuelConsumed: data.fuelConsumed,
          revenue: data.revenue ?? 0,
        },
        include: { vehicle: true, driver: true },
      });
    }, { timeout: 15000 });
  },

  async cancel(id: string, reqUser: any) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findFirst({
        where: { id, deletedAt: null },
      });
      if (!trip) {
        throw Object.assign(new Error('Trip not found'), { statusCode: 404 });
      }
      verifyOwnership(trip.driverId, reqUser);

      if (trip.status !== 'DISPATCHED') {
        throw Object.assign(new Error('A draft trip should be edited or deleted. Only dispatched trips can be cancelled.'), { statusCode: 400 });
      }

      // Revert vehicle status
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'AVAILABLE' },
      });

      // Revert driver status
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: 'AVAILABLE' },
      });

      return tx.trip.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
        include: { vehicle: true, driver: true },
      });
    }, { timeout: 15000 });
  },
};
