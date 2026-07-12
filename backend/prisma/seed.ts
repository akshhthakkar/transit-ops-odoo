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

  // ── Locations (3) ────────────────────────────────────────────────────────
  const locations = await Promise.all([
    prisma.location.upsert({
      where: { name: 'Main Depot' },
      update: {},
      create: { name: 'Main Depot', address: '123 Logistics Way, New York, NY' },
    }),
    prisma.location.upsert({
      where: { name: 'South Terminal' },
      update: {},
      create: { name: 'South Terminal', address: '456 Port Road, Houston, TX' },
    }),
    prisma.location.upsert({
      where: { name: 'West Hub' },
      update: {},
      create: { name: 'West Hub', address: '789 Highway 10, Los Angeles, CA' },
    }),
  ]);

  console.log('✅ Locations seeded:', locations.map(l => l.name));

  // ── Vendors (3) ──────────────────────────────────────────────────────────
  const vendors = await Promise.all([
    prisma.vendor.upsert({
      where: { name: 'FleetCare Mechanics' },
      update: {},
      create: { name: 'FleetCare Mechanics', contactInfo: 'info@fleetcare.com' },
    }),
    prisma.vendor.upsert({
      where: { name: 'Tire World' },
      update: {},
      create: { name: 'Tire World', contactInfo: 'sales@tireworld.com' },
    }),
    prisma.vendor.upsert({
      where: { name: 'Metro Fuel Station' },
      update: {},
      create: { name: 'Metro Fuel Station', contactInfo: 'metro@fuel.com' },
    }),
  ]);

  console.log('✅ Vendors seeded:', vendors.map(v => v.name));

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
