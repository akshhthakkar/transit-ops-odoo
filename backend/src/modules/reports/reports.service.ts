import { prisma } from '../../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export const reportsService = {
  async getDashboardKpis(filters: { type?: string; status?: string; region?: string } = {}) {
    const vehicleWhere: any = { deletedAt: null };
    if (filters.type) {
      vehicleWhere.type = filters.type;
    }
    if (filters.status) {
      vehicleWhere.status = filters.status;
    }
    if (filters.region) {
      vehicleWhere.region = filters.region;
    }

    const activeVehicles = await prisma.vehicle.count({
      where: { ...vehicleWhere, status: filters.status ? (filters.status === 'ON_TRIP' ? 'ON_TRIP' : 'invalid-status') : 'ON_TRIP' },
    });

    const availableVehicles = await prisma.vehicle.count({
      where: { ...vehicleWhere, status: filters.status ? (filters.status === 'AVAILABLE' ? 'AVAILABLE' : 'invalid-status') : 'AVAILABLE' },
    });

    const inShopVehicles = await prisma.vehicle.count({
      where: { ...vehicleWhere, status: filters.status ? (filters.status === 'IN_SHOP' ? 'IN_SHOP' : 'invalid-status') : 'IN_SHOP' },
    });

    // Trips (Active: DISPATCHED, Pending: DRAFT)
    const tripWhere: any = { deletedAt: null };
    if (filters.type || filters.region || filters.status) {
      tripWhere.vehicle = { deletedAt: null };
      if (filters.type) tripWhere.vehicle.type = filters.type;
      if (filters.region) tripWhere.vehicle.region = filters.region;
      if (filters.status) tripWhere.vehicle.status = filters.status;
    }

    const activeTrips = await prisma.trip.count({
      where: { ...tripWhere, status: 'DISPATCHED' },
    });

    const pendingTrips = await prisma.trip.count({
      where: { ...tripWhere, status: 'DRAFT' },
    });

    // Drivers on duty
    const driverWhere: any = { deletedAt: null, status: 'ON_TRIP' };
    if (filters.type || filters.region || filters.status) {
      driverWhere.trips = {
        some: {
          status: 'DISPATCHED',
          deletedAt: null,
          vehicle: {
            deletedAt: null,
          }
        }
      };
      if (filters.type) driverWhere.trips.some.vehicle.type = filters.type;
      if (filters.region) driverWhere.trips.some.vehicle.region = filters.region;
      if (filters.status) driverWhere.trips.some.vehicle.status = filters.status;
    }
    const driversOnDuty = await prisma.driver.count({
      where: driverWhere,
    });

    const totalNonRetiredVehicles = await prisma.vehicle.count({
      where: {
        ...vehicleWhere,
        status: filters.status ? (filters.status !== 'RETIRED' ? filters.status : 'invalid-status') : { not: 'RETIRED' },
      },
    });

    const fleetUtilization = totalNonRetiredVehicles > 0
      ? Math.round((activeVehicles / totalNonRetiredVehicles) * 100)
      : 0;

    // Fuel cost sum
    const fuelWhere: any = { deletedAt: null };
    if (filters.type || filters.region || filters.status) {
      fuelWhere.vehicle = { deletedAt: null };
      if (filters.type) fuelWhere.vehicle.type = filters.type;
      if (filters.region) fuelWhere.vehicle.region = filters.region;
      if (filters.status) fuelWhere.vehicle.status = filters.status;
    }
    const fuelCostAggregate = await prisma.fuelLog.aggregate({
      where: fuelWhere,
      _sum: { cost: true },
    });
    const fuelCostMonth = Number(fuelCostAggregate._sum.cost ?? 0);

    // Maintenance cost sum
    const maintWhere: any = { deletedAt: null };
    if (filters.type || filters.region || filters.status) {
      maintWhere.vehicle = { deletedAt: null };
      if (filters.type) maintWhere.vehicle.type = filters.type;
      if (filters.region) maintWhere.vehicle.region = filters.region;
      if (filters.status) maintWhere.vehicle.status = filters.status;
    }
    const maintenanceCostAggregate = await prisma.maintenanceLog.aggregate({
      where: maintWhere,
      _sum: { cost: true },
    });
    const maintenanceCostMonth = Number(maintenanceCostAggregate._sum.cost ?? 0);

    // Expense cost sum (excluding type = MAINTENANCE)
    const expWhere: any = { type: { not: 'MAINTENANCE' }, deletedAt: null };
    if (filters.type || filters.region || filters.status) {
      expWhere.vehicle = { deletedAt: null };
      if (filters.type) expWhere.vehicle.type = filters.type;
      if (filters.region) expWhere.vehicle.region = filters.region;
      if (filters.status) expWhere.vehicle.status = filters.status;
    }
    const expenseCostAggregate = await prisma.expense.aggregate({
      where: expWhere,
      _sum: { amount: true },
    });
    const expenseCostSum = Number(expenseCostAggregate._sum.amount ?? 0);

    const operationalCostMonth = fuelCostMonth + maintenanceCostMonth + expenseCostSum;

    return {
      activeVehicles,
      availableVehicles,
      maintenanceVehicles: inShopVehicles,
      driversOnDuty,
      activeTrips,
      pendingTrips,
      fleetUtilization,
      fuelCostMonth,
      maintenanceCostMonth,
      operationalCostMonth,
    };
  },

  async getVehicleReport() {
    const vehicles = await prisma.vehicle.findMany({
      where: { deletedAt: null },
      include: {
        fuelLogs: { where: { deletedAt: null } },
        maintenanceLogs: { where: { deletedAt: null } },
        expenses: {
          where: {
            type: { not: 'MAINTENANCE' },
            deletedAt: null,
          },
        },
        trips: {
          where: {
            status: 'COMPLETED',
            deletedAt: null,
          },
        },
      },
    });

    return vehicles.map((v) => {
      const fuelCost = v.fuelLogs.reduce((sum, log) => sum + Number(log.cost), 0);
      const maintenanceCost = v.maintenanceLogs.reduce((sum, log) => sum + Number(log.cost), 0);
      const otherExpenses = v.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      const totalOperationalCost = fuelCost + maintenanceCost + otherExpenses;

      const totalLiters = v.fuelLogs.reduce((sum, log) => sum + log.liters, 0);
      const totalDistance = v.trips.reduce((sum, trip) => sum + (trip.actualDistance ?? 0), 0);
      const fuelEfficiency = totalLiters > 0 ? (totalDistance / totalLiters) : 0;

      let utilizationRate = 0;
      if (v.status === 'ON_TRIP') {
        utilizationRate = 90;
      } else if (v.status === 'AVAILABLE') {
        utilizationRate = 50;
      }

      return {
        id: v.id,
        registrationNumber: v.registrationNumber,
        name: v.name,
        type: v.type,
        status: v.status,
        region: v.region,
        totalOperationalCost,
        fuelEfficiency,
        utilizationRate,
      };
    });
  },

  async getRoiReport() {
    const vehicles = await prisma.vehicle.findMany({
      where: { deletedAt: null },
      include: {
        fuelLogs: { where: { deletedAt: null } },
        maintenanceLogs: { where: { deletedAt: null } },
        expenses: {
          where: {
            type: { not: 'MAINTENANCE' },
            deletedAt: null,
          },
        },
        trips: {
          where: {
            status: 'COMPLETED',
            deletedAt: null,
          },
        },
      },
    });

    return vehicles.map((v) => {
      const fuelCost = v.fuelLogs.reduce((sum, log) => sum + Number(log.cost), 0);
      const maintenanceCost = v.maintenanceLogs.reduce((sum, log) => sum + Number(log.cost), 0);
      const otherExpenses = v.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      const totalOperationalCost = fuelCost + maintenanceCost + otherExpenses;

      const totalRevenue = v.trips.reduce((sum, trip) => sum + Number(trip.revenue ?? 0), 0);
      const netProfit = totalRevenue - totalOperationalCost;
      const acquisitionCost = Number(v.acquisitionCost);

      const roi = acquisitionCost > 0 ? (netProfit / acquisitionCost) * 100 : 0;

      return {
        id: v.id,
        registrationNumber: v.registrationNumber,
        name: v.name,
        acquisitionCost,
        totalRevenue,
        totalOperationalCost,
        roi,
      };
    });
  },

  async getTripReport() {
    return prisma.trip.findMany({
      where: { deletedAt: null },
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async exportCsv(type: string) {
    if (type === 'vehicles') {
      const reports = await this.getVehicleReport();
      const headers = ['Registration Number', 'Name', 'Type', 'Status', 'Region', 'Total Operational Cost ($)', 'Fuel Efficiency (km/L)', 'Utilization Rate (%)'];
      const rows = reports.map((r) => [
        r.registrationNumber,
        r.name,
        r.type,
        r.status,
        r.region ?? '—',
        r.totalOperationalCost.toFixed(2),
        r.fuelEfficiency.toFixed(2),
        r.utilizationRate,
      ]);
      return [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
    }

    // Default: export trips history
    const trips = await prisma.trip.findMany({
      where: { deletedAt: null },
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['Trip Number', 'Source', 'Destination', 'Vehicle', 'Driver', 'Cargo Weight (kg)', 'Planned Distance (km)', 'Actual Distance (km)', 'Fuel Consumed (L)', 'Revenue ($)', 'Status', 'Dispatched At', 'Completed At'];
    const rows = trips.map((t) => [
      t.tripNumber,
      t.source ?? '—',
      t.destination ?? '—',
      t.vehicle?.registrationNumber ?? '—',
      t.driver?.name ?? '—',
      t.cargoWeight,
      t.plannedDistance,
      t.actualDistance ?? '—',
      t.fuelConsumed ?? '—',
      t.revenue ? Number(t.revenue).toFixed(2) : '—',
      t.status,
      t.dispatchedAt ? t.dispatchedAt.toISOString() : '—',
      t.completedAt ? t.completedAt.toISOString() : '—',
    ]);

    return [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
  },
};
