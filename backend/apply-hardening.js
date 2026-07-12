const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Applying DB-level constraints & hardening indexes...');
  try {
    // 1. Unique index: vehicle can only have one active/draft/dispatched trip
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_trip_vehicle_active
        ON "Trip" ("vehicleId")
        WHERE status IN ('DRAFT', 'DISPATCHED');
    `);
    console.log('✅ Created unique active vehicle index');

    // 2. Unique index: driver can only have one active/draft/dispatched trip
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_trip_driver_active
        ON "Trip" ("driverId")
        WHERE status IN ('DRAFT', 'DISPATCHED');
    `);
    console.log('✅ Created unique active driver index');

    // 3. Positive check constraints
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Vehicle" ADD CONSTRAINT chk_capacity_positive CHECK ("maxLoadCapacity" > 0);
      `);
      console.log('✅ Added chk_capacity_positive to Vehicle');
    } catch (e) {
      console.log('   - chk_capacity_positive check constraint already exists or skipped');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Trip" ADD CONSTRAINT chk_cargo_positive CHECK ("cargoWeight" > 0);
      `);
      console.log('✅ Added chk_cargo_positive to Trip');
    } catch (e) {
      console.log('   - chk_cargo_positive check constraint already exists or skipped');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Driver" ADD CONSTRAINT chk_safety_score_range CHECK ("safetyScore" BETWEEN 0 AND 100);
      `);
      console.log('✅ Added chk_safety_score_range to Driver');
    } catch (e) {
      console.log('   - chk_safety_score_range check constraint already exists or skipped');
    }

    console.log('\n🎉 DB HARDENING COMPLETE!');
  } catch (err) {
    console.error('❌ Hardening error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
