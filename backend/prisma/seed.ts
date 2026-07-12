import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // ── Drivers (4) ──────────────────────────────────────────────────────────
  const drivers = await Promise.all([
    prisma.driver.upsert({
      where: { licenseNumber: 'LIC-001' },
      update: {},
      create: {
        name: 'Alex Johnson',
        licenseNumber: 'LIC-001',
        licenseCategory: 'Class B',
        licenseExpiryDate: new Date('2027-06-30'),
        contactNumber: '+1-555-0101',
        safetyScore: 98,
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

  // Find Alex Johnson to link with the Driver user
  const alexDriver = drivers.find(d => d.name === 'Alex Johnson')!;

  // ── Users (one per role) ──────────────────────────────────────────────────
  const [fleetMgr, driverUser, safetyOfficer, financialAnalyst] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'fleet@transitops.com' },
      update: {},
      create: { email: 'fleet@transitops.com', passwordHash, name: 'Fleet Manager', role: 'FLEET_MANAGER' },
    }),
    prisma.user.upsert({
      where: { email: 'driver@transitops.com' },
      update: { driverId: alexDriver.id },
      create: { email: 'driver@transitops.com', passwordHash, name: 'Alex Driver', role: 'DRIVER', driverId: alexDriver.id },
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
