import { prisma } from '../../lib/prisma';
import { ExpenseType } from '@prisma/client';

export const fuelExpenseService = {
  async findFuelLogs(reqUser: any, vehicleId?: string) {
    const where: any = {
      deletedAt: null,
    };

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    // RBAC: Drivers only see fuel logs for their own trips
    if (reqUser.role === 'DRIVER') {
      where.trip = {
        driverId: reqUser.driverId || 'non-existent-uuid',
      };
    }

    // RBAC: Safety Officers are blocked
    if (reqUser.role === 'SAFETY_OFFICER') {
      throw Object.assign(new Error('Forbidden: Access denied'), { statusCode: 403 });
    }

    return prisma.fuelLog.findMany({
      where,
      include: {
        vehicle: {
          select: { id: true, registrationNumber: true, name: true },
        },
        trip: {
          select: {
            id: true,
            tripNumber: true,
            sourceLocation: { select: { name: true } },
            destinationLocation: { select: { name: true } },
          },
        },
        vendor: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  },

  async createFuelLog(
    data: {
      vehicleId: string;
      tripId?: string;
      liters: number;
      pricePerLiter?: number;
      cost: number;
      vendorId?: string;
      odometer?: number;
      date?: string;
    },
    reqUser: any
  ) {
    // RBAC check: Drivers can only log fuel for their own trips
    if (reqUser.role === 'DRIVER') {
      if (!data.tripId) {
        throw Object.assign(new Error('Driver must specify a Trip ID to log fuel'), { statusCode: 400 });
      }

      const trip = await prisma.trip.findUnique({
        where: { id: data.tripId },
      });

      if (!trip || trip.driverId !== reqUser.driverId) {
        throw Object.assign(new Error('Forbidden: You can only log fuel for your own trips'), { statusCode: 403 });
      }
    }

    // Validate vehicle
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: data.vehicleId, deletedAt: null },
    });
    if (!vehicle) {
      throw Object.assign(new Error('Vehicle not found'), { statusCode: 404 });
    }

    // Validate trip if provided
    if (data.tripId) {
      const trip = await prisma.trip.findFirst({
        where: { id: data.tripId, deletedAt: null },
      });
      if (!trip) {
        throw Object.assign(new Error('Trip not found'), { statusCode: 404 });
      }
    }

    // Validate vendor
    if (data.vendorId) {
      const vendor = await prisma.vendor.findUnique({ where: { id: data.vendorId } });
      if (!vendor) {
        throw Object.assign(new Error('Vendor not found'), { statusCode: 404 });
      }
    }

    return prisma.fuelLog.create({
      data: {
        vehicleId: data.vehicleId,
        tripId: data.tripId,
        liters: data.liters,
        pricePerLiter: data.pricePerLiter,
        cost: data.cost,
        vendorId: data.vendorId,
        odometer: data.odometer,
        date: data.date ? new Date(data.date) : undefined,
        createdById: reqUser.id,
      },
      include: { vehicle: true, trip: true, vendor: true },
    });
  },

  async findExpenses(reqUser: any, vehicleId?: string, type?: ExpenseType) {
    const where: any = {
      deletedAt: null,
    };

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    if (type) {
      where.type = type;
    }

    // RBAC: Drivers only see expenses for their own trips
    if (reqUser.role === 'DRIVER') {
      where.trip = {
        driverId: reqUser.driverId || 'non-existent-uuid',
      };
    }

    // RBAC: Safety Officers are blocked
    if (reqUser.role === 'SAFETY_OFFICER') {
      throw Object.assign(new Error('Forbidden: Access denied'), { statusCode: 403 });
    }

    return prisma.expense.findMany({
      where,
      include: {
        vehicle: {
          select: { id: true, registrationNumber: true, name: true },
        },
        trip: {
          select: {
            id: true,
            tripNumber: true,
            sourceLocation: { select: { name: true } },
            destinationLocation: { select: { name: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  },

  async createExpense(
    data: {
      vehicleId: string;
      tripId?: string;
      type: ExpenseType;
      amount: number;
      description: string;
      date?: string;
    },
    reqUser: any
  ) {
    // Validate vehicle
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: data.vehicleId, deletedAt: null },
    });
    if (!vehicle) {
      throw Object.assign(new Error('Vehicle not found'), { statusCode: 404 });
    }

    // Validate trip if provided
    if (data.tripId) {
      const trip = await prisma.trip.findFirst({
        where: { id: data.tripId, deletedAt: null },
      });
      if (!trip) {
        throw Object.assign(new Error('Trip not found'), { statusCode: 404 });
      }
    }

    return prisma.expense.create({
      data: {
        vehicleId: data.vehicleId,
        tripId: data.tripId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        date: data.date ? new Date(data.date) : undefined,
        createdById: reqUser.id,
      },
      include: { vehicle: true, trip: true },
    });
  },
};
