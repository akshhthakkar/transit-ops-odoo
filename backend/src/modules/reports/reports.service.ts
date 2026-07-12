import { prisma } from '../../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export const reportsService = {
  async getDashboardKpis() {
    const activeVehicles = await prisma.vehicle.count({
      where: { status: 'ON_TRIP', deletedAt: null },
    });

    const availableVehicles = await prisma.vehicle.count({
      where: { status: 'AVAILABLE', deletedAt: null },
    });

    const inShopVehicles = await prisma.vehicle.count({
      where: { status: 'IN_SHOP', deletedAt: null },
    });

    const driversOnDuty = await prisma.driver.count({
      where: { status: 'ON_TRIP', deletedAt: null },
    });

    const activeTrips = await prisma.trip.count({
      where: { status: 'DISPATCHED', deletedAt: null },
    });

    const pendingTrips = await prisma.trip.count({
      where: {
        status: 'DRAFT',
        deletedAt: null,
      },
    });

    const totalNonRetiredVehicles = await prisma.vehicle.count({
      where: {
        status: { not: 'RETIRED' },
        deletedAt: null,
      },
    });

    const fleetUtilization = totalNonRetiredVehicles > 0
      ? Math.round((activeVehicles / totalNonRetiredVehicles) * 100)
      : 0;

    // Fuel cost sum
    const fuelCostAggregate = await prisma.fuelLog.aggregate({
      where: { deletedAt: null },
      _sum: { cost: true },
    });
    const fuelCostMonth = Number(fuelCostAggregate._sum.cost ?? 0);

    // Maintenance cost sum
    const maintenanceCostAggregate = await prisma.maintenanceLog.aggregate({
      where: { deletedAt: null },
      _sum: { cost: true },
    });
    const maintenanceCostMonth = Number(maintenanceCostAggregate._sum.cost ?? 0);

    // Expense cost sum (excluding type = MAINTENANCE to avoid double-counting)
    const expenseCostAggregate = await prisma.expense.aggregate({
      where: {
        type: { not: 'MAINTENANCE' },
        deletedAt: null,
      },
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
