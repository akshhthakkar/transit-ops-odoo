import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // ── Users (one per role) ──────────────────────────────────────────────────
  const [fleetMgr, driverUser, safetyOfficer, financialAnalyst] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'fleet@transitops.com' },
      update: {},
      create: { email: 'fleet@transitops.com', passwordHash, name: 'Fleet Manager', role: 'FLEET_MANAGER' },
    }),
    prisma.user.upsert({
      where: { email: 'driver@transitops.com' },
      update: {},
      create: { email: 'driver@transitops.com', passwordHash, name: 'Alex Driver', role: 'DRIVER' },
    }),
    prisma.user.upsert({
      where: { email: 'safety@transitops.com' },
      update: {},
      create: { email: 'safety@transitops.com', passwordHash, name: 'Safety Officer', role: 'SAFETY_OFFICER' },
    }),
    prisma.user.upsert({
      where: { email: 'finance@transitops.com' },
      update: {},
      create: { email: 'finance@transitops.com', passwordHash, name: 'Financial Analyst', role: 'FINANCIAL_ANALYST' },
    }),
  ]);

  console.log('✅ Users seeded:', [fleetMgr, driverUser, safetyOfficer, financialAnalyst].map(u => u.email));

  // ── Drivers (4) ──────────────────────────────────────────────────────────
  const drivers = await Promise.all([
    prisma.driver.upsert({
      where: { licenseNumber: 'LIC-001' },
      update: { userId: driverUser.id },
      create: {
        name: 'Alex Johnson',
        licenseNumber: 'LIC-001',
        licenseCategory: 'Class B',
        licenseExpiryDate: new Date('2027-06-30'),
        contactNumber: '+1-555-0101',
        safetyScore: 98,
        userId: driverUser.id,
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: 'LIC-002' },
      update: {},
      create: {
        name: 'Maria Garcia',
        licenseNumber: 'LIC-002',
        licenseCategory: 'Class A',
        licenseExpiryDate: new Date('2026-12-31'),
        contactNumber: '+1-555-0102',
        safetyScore: 95,
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: 'LIC-003' },
      update: {},
      create: {
        name: 'James Wilson',
        licenseNumber: 'LIC-003',
        licenseCategory: 'Class B',
        licenseExpiryDate: new Date('2027-03-15'),
        contactNumber: '+1-555-0103',
        safetyScore: 92,
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: 'LIC-004' },
      update: {},
      create: {
        name: 'Sara Chen',
        licenseNumber: 'LIC-004',
        licenseCategory: 'Class A',
        licenseExpiryDate: new Date('2028-01-20'),
        contactNumber: '+1-555-0104',
        safetyScore: 99,
      },
    }),
  ]);

  console.log('✅ Drivers seeded:', drivers.map(d => d.name));

  // ── Vehicles (5) ─────────────────────────────────────────────────────────
  const vehicles = await Promise.all([
    prisma.vehicle.upsert({
      where: { registrationNumber: 'VAN-01' },
      update: {},
      create: { registrationNumber: 'VAN-01', name: 'Van Alpha', type: 'Van', maxLoadCapacity: 1000, acquisitionCost: 35000, odometer: 12000 },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: 'VAN-02' },
      update: {},
      create: { registrationNumber: 'VAN-02', name: 'Van Beta', type: 'Van', maxLoadCapacity: 1200, acquisitionCost: 38000, odometer: 8500 },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: 'TRK-01' },
      update: {},
      create: { registrationNumber: 'TRK-01', name: 'Truck Titan', type: 'Truck', maxLoadCapacity: 5000, acquisitionCost: 85000, odometer: 45000, region: 'North' },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: 'TRK-02' },
      update: {},
      create: { registrationNumber: 'TRK-02', name: 'Truck Atlas', type: 'Truck', maxLoadCapacity: 4500, acquisitionCost: 78000, odometer: 32000, region: 'South' },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: 'VAN-05' },
      update: {},
      create: { registrationNumber: 'VAN-05', name: 'Van Five', type: 'Van', maxLoadCapacity: 800, acquisitionCost: 30000, odometer: 5000 },
    }),
  ]);

  console.log('✅ Vehicles seeded:', vehicles.map(v => v.registrationNumber));

  // ── Trips, Fuel, Maintenance, & Expense Mock Data (Phase 5 Analytics) ────────
  console.log('🌱 Seeding trips, fuel logs, and expenses...');

  // User attribution references
  const creatorId = fleetMgr.id;

  // Seed completed trips (this sets values in reports without locking assets)
  const trip1 = await prisma.trip.create({
    data: {
      tripNumber: 'TRP-101-UUID',
      source: 'Main Depot',
      destination: 'South Terminal',
      vehicleId: vehicles[0].id, // VAN-01
      driverId: drivers[0].id, // Alex Johnson
      cargoWeight: 600,
      plannedDistance: 320.0,
      actualDistance: 325.5,
      startingOdometer: 12000.0,
      endingOdometer: 12325.5,
      fuelConsumed: 48.2,
      revenue: 950.0,
      status: 'COMPLETED',
      dispatchedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      createdById: creatorId,
    }
  });

  const trip2 = await prisma.trip.create({
    data: {
      tripNumber: 'TRP-102-UUID',
      source: 'South Terminal',
      destination: 'West Hub',
      vehicleId: vehicles[2].id, // TRK-01
      driverId: drivers[1].id, // Maria Garcia
      cargoWeight: 4200,
      plannedDistance: 450.0,
      actualDistance: 450.0,
      startingOdometer: 45000.0,
      endingOdometer: 45450.0,
      fuelConsumed: 95.0,
      revenue: 1450.0,
      status: 'COMPLETED',
      dispatchedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      createdById: creatorId,
    }
  });

  // Seed Fuel logs for trips
  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicles[0].id,
      tripId: trip1.id,
      liters: 48.2,
      pricePerLiter: 1.85,
      cost: 89.17, // 48.2 * 1.85
      odometer: 12325.5,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      createdById: creatorId,
    }
  });

  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicles[2].id,
      tripId: trip2.id,
      liters: 95.0,
      pricePerLiter: 1.90,
      cost: 180.50,
      odometer: 45450.0,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdById: creatorId,
    }
  });

  // Seed maintenance record & lock vehicle 2 (VAN-02) into IN_SHOP status
  await prisma.maintenanceLog.create({
    data: {
      vehicleId: vehicles[1].id, // VAN-02
      cost: 320.0,
      maintenanceType: 'Brake Service',
      description: 'Rear brake pads replaced during scheduled service',
      status: 'ACTIVE',
      startedAt: new Date(),
      createdById: creatorId,
    }
  });

  await prisma.vehicle.update({
    where: { id: vehicles[1].id },
    data: { status: 'IN_SHOP' }
  });

  // Create general Expenses (tolls and parts)
  await prisma.expense.create({
    data: {
      vehicleId: vehicles[0].id,
      tripId: trip1.id,
      type: 'TOLL',
      amount: 45.0,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      description: 'E-ZPass NY toll charges',
      createdById: creatorId,
    }
  });

  await prisma.expense.create({
    data: {
      vehicleId: vehicles[1].id,
      type: 'MAINTENANCE',
      amount: 320.0,
      date: new Date(),
      description: 'Brake pads replacement expense invoice',
      createdById: creatorId,
    }
  });

  console.log('✅ Completed mock data seeded.');

  console.log('\n🎉 Seed complete!');
  console.log('\nLogin credentials (all use password: password123):');
  console.log('  fleet@transitops.com     → FLEET_MANAGER');
  console.log('  driver@transitops.com    → DRIVER (linked to Alex Johnson)');
  console.log('  safety@transitops.com    → SAFETY_OFFICER');
  console.log('  finance@transitops.com   → FINANCIAL_ANALYST');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
