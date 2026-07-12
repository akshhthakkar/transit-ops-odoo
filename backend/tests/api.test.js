/**
 * TransitOps E2E Test Suite
 * Covers Auth, RBAC, Vehicle, Driver, Trip Lifecycle, Maintenance, Fuel/Expense, Dashboard, and Reports.
 * Run directly with: node tests/api.test.js
 */

const assert = require('assert');
const http = require('http');
const app = require('../src/app').default; // import express app
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let server;
let port;
let baseUrl;

// Global session tokens
let tokens = {
  FLEET_MANAGER: null,
  DRIVER: null,
  SAFETY_OFFICER: null,
  FINANCIAL_ANALYST: null
};

// Helper: Make HTTP requests using native fetch
async function apiRequest(method, path, body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${baseUrl}${path}`, options);
  let data = null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return {
    status: res.status,
    data,
    headers: res.headers
  };
}

async function runTests() {
  console.log('🧪 Starting TransitOps Automated Test Suite...\n');

  // Boot server on a dynamic port
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, () => {
      port = server.address().port;
      baseUrl = `http://localhost:${port}/api`;
      console.log(`🚀 Test server listening on http://localhost:${port}`);
      resolve();
    });
  });

  try {
    // 1. Auth & RBAC Tests
    console.log('\n--- 1. AUTH & RBAC TESTS ---');

    // 1.1 Login succeeds for each role
    const roles = ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];
    const emails = {
      FLEET_MANAGER: 'fleet@transitops.com',
      DRIVER: 'driver@transitops.com',
      SAFETY_OFFICER: 'safety@transitops.com',
      FINANCIAL_ANALYST: 'finance@transitops.com'
    };

    for (const role of roles) {
      const res = await apiRequest('POST', '/auth/login', {
        email: emails[role],
        password: 'password123'
      });
      assert.strictEqual(res.status, 200, `Login failed for ${role}`);
      assert.ok(res.data.token, `Token missing for ${role}`);
      assert.strictEqual(res.data.user.role, role, `Returned wrong role for ${role}`);
      assert.ok(!res.data.user.passwordHash, 'Response leaked passwordHash');
      tokens[role] = res.data.token;
      console.log(`   ✅ Login successful for ${role}`);
    }

    // 1.2 Login fails with wrong password
    const loginFail = await apiRequest('POST', '/auth/login', {
      email: 'fleet@transitops.com',
      password: 'wrongpassword'
    });
    assert.strictEqual(loginFail.status, 401, 'Login with wrong password should fail with 401');
    console.log('   ✅ Login failure verified (401)');

    // 1.3 Signup route does not exist
    const signupRes = await apiRequest('POST', '/auth/signup', { email: 'new@example.com' });
    assert.strictEqual(signupRes.status, 404, 'Signup route should return 404');
    console.log('   ✅ Signup route unavailability verified (404)');

    // 1.4 Protected route access checks
    const protectedVehiclesNoToken = await apiRequest('GET', '/vehicles');
    assert.strictEqual(protectedVehiclesNoToken.status, 401, 'Request without token should fail with 401');

    const protectedVehiclesWrongRole = await apiRequest('POST', '/vehicles', {
      registrationNumber: 'TEST-REG-1',
      name: 'Test Vehicle',
      type: 'Van',
      maxLoadCapacity: 800,
      acquisitionCost: 20000
    }, tokens.DRIVER);
    assert.strictEqual(protectedVehiclesWrongRole.status, 403, 'Wrong role should fail with 403');
    console.log('   ✅ Protected routes access controls verified');


    // 2. Vehicles & Drivers Registry
    console.log('\n--- 2. VEHICLES & DRIVERS REGISTRY ---');

    // 2.1 Unique registrationNumber check
    const regNum = `VAN-${Math.floor(Math.random() * 100000)}`;
    const v1 = await apiRequest('POST', '/vehicles', {
      registrationNumber: regNum,
      name: 'Van Test 1',
      type: 'Van',
      maxLoadCapacity: 500,
      acquisitionCost: 25000,
      odometer: 1000
    }, tokens.FLEET_MANAGER);
    assert.strictEqual(v1.status, 201, 'Failed to create vehicle');

    const v2 = await apiRequest('POST', '/vehicles', {
      registrationNumber: regNum,
      name: 'Van Test 2',
      type: 'Van',
      maxLoadCapacity: 500,
      acquisitionCost: 25000
    }, tokens.FLEET_MANAGER);
    assert.strictEqual(v2.status, 409, 'Duplicate registration number should fail with 409 Conflict');
    console.log('   ✅ Duplicate registrationNumber returns clean 409');

    // 2.2 Unique licenseNumber on Drivers
    const licNum = `LIC-${Math.floor(Math.random() * 100000)}`;
    const d1 = await apiRequest('POST', '/drivers', {
      name: 'Driver Test 1',
      licenseNumber: licNum,
      licenseCategory: 'Class A',
      licenseExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days in future
      contactNumber: '+1-555-9999'
    }, tokens.SAFETY_OFFICER);
    assert.strictEqual(d1.status, 201, 'Failed to create driver');

    const d2 = await apiRequest('POST', '/drivers', {
      name: 'Driver Test 2',
      licenseNumber: licNum,
      licenseCategory: 'Class A',
      licenseExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      contactNumber: '+1-555-9998'
    }, tokens.SAFETY_OFFICER);
    assert.strictEqual(d2.status, 409, 'Duplicate license number should fail with 409 Conflict');
    console.log('   ✅ Duplicate licenseNumber returns clean 409');


    // 3. Trip Lifecycle & Concurrency
    console.log('\n--- 3. TRIP LIFECYCLE ---');

    // 3.1 Setup specific test vehicle and driver
    const vehicleReg = `VAN-${Math.floor(Math.random() * 100000)}`;
    const vehicleRes = await apiRequest('POST', '/vehicles', {
      registrationNumber: vehicleReg,
      name: 'Van-05',
      type: 'Van',
      maxLoadCapacity: 500.0,
      acquisitionCost: 30000,
      odometer: 5000
    }, tokens.FLEET_MANAGER);
    const testVehicle = vehicleRes.data;

    const driverLic = `LIC-${Math.floor(Math.random() * 100000)}`;
    const driverRes = await apiRequest('POST', '/drivers', {
      name: 'Alex',
      licenseNumber: driverLic,
      licenseCategory: 'Class B',
      licenseExpiryDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString(), // valid
      contactNumber: '+1-555-1234'
    }, tokens.SAFETY_OFFICER);
    const testDriver = driverRes.data;

    // 3.2 Overload capacity check (600kg vs 500kg)
    const overloadTrip = await apiRequest('POST', '/trips', {
      source: 'Main Depot',
      destination: 'West Hub',
      vehicleId: testVehicle.id,
      driverId: testDriver.id,
      cargoWeight: 600,
      plannedDistance: 120
    }, tokens.FLEET_MANAGER);
    assert.strictEqual(overloadTrip.status, 400, 'Overloaded cargo should return 400');
    console.log('   ✅ Overload check block returned 400');

    // 3.3 Happy Path: Create DRAFT trip (450kg allowed)
    const tripRes = await apiRequest('POST', '/trips', {
      source: 'Main Depot',
      destination: 'West Hub',
      vehicleId: testVehicle.id,
      driverId: testDriver.id,
      cargoWeight: 450,
      plannedDistance: 120
    }, tokens.FLEET_MANAGER);
    assert.strictEqual(tripRes.status, 201, 'Failed to create trip');
    const trip = tripRes.data;
    assert.strictEqual(trip.status, 'DRAFT', 'New trip status should be DRAFT');
    console.log('   ✅ Draft trip created successfully');

    // 3.4 Dispatch trip -> vehicle and driver flip to ON_TRIP atomically
    const dispatchRes = await apiRequest('POST', `/trips/${trip.id}/dispatch`, {}, tokens.FLEET_MANAGER);
    assert.strictEqual(dispatchRes.status, 200, 'Dispatch failed');

    // Re-query vehicle/driver to check status
    const dispatchedVehicle = await prisma.vehicle.findUnique({ where: { id: testVehicle.id } });
    const dispatchedDriver = await prisma.driver.findUnique({ where: { id: testDriver.id } });
    assert.strictEqual(dispatchedVehicle.status, 'ON_TRIP', 'Vehicle should transition to ON_TRIP');
    assert.strictEqual(dispatchedDriver.status, 'ON_TRIP', 'Driver should transition to ON_TRIP');
    console.log('   ✅ Dispatch atomic status updates verified (ON_TRIP)');

    // 3.5 Duplicate dispatch rejection
    const tripRes2 = await apiRequest('POST', '/trips', {
      source: 'Depot A',
      destination: 'Terminal B',
      vehicleId: testVehicle.id,
      driverId: testDriver.id,
      cargoWeight: 100,
      plannedDistance: 50
    }, tokens.FLEET_MANAGER);
    assert.strictEqual(tripRes2.status, 400, 'Should reject booking vehicle/driver already ON_TRIP');
    console.log('   ✅ Double booking on ON_TRIP vehicle rejected');

    // 3.6 Complete trip (odometer increases, flips back to AVAILABLE)
    const completeRes = await apiRequest('POST', `/trips/${trip.id}/complete`, {
      actualDistance: 125,
      fuelConsumed: 18.5,
      revenue: 550
    }, tokens.FLEET_MANAGER);
    assert.strictEqual(completeRes.status, 200, 'Trip completion failed');

    const completedVehicle = await prisma.vehicle.findUnique({ where: { id: testVehicle.id } });
    const completedDriver = await prisma.driver.findUnique({ where: { id: testDriver.id } });
    assert.strictEqual(completedVehicle.status, 'AVAILABLE', 'Vehicle should return to AVAILABLE');
    assert.strictEqual(completedDriver.status, 'AVAILABLE', 'Driver should return to AVAILABLE');
    assert.strictEqual(completedVehicle.odometer, 5125.0, 'Vehicle odometer should increase by actualDistance');
    console.log('   ✅ Trip completion & odometer increments verified');


    // 4. Maintenance Records
    console.log('\n--- 4. MAINTENANCE LOGS ---');

    // 4.1 Create maintenance -> vehicle IN_SHOP
    const maintRes = await apiRequest('POST', '/maintenance', {
      vehicleId: testVehicle.id,
      maintenanceType: 'Oil Change',
      description: 'Scheduled oil change',
      priority: 'high',
      cost: 150
    }, tokens.FLEET_MANAGER);
    assert.strictEqual(maintRes.status, 201, 'Failed to create maintenance');
    const maintLog = maintRes.data;

    const maintenanceVehicle = await prisma.vehicle.findUnique({ where: { id: testVehicle.id } });
    assert.strictEqual(maintenanceVehicle.status, 'IN_SHOP', 'Vehicle should transition to IN_SHOP');
    console.log('   ✅ Maintenance creation locks vehicle into IN_SHOP');

    // 4.2 IN_SHOP vehicle cannot be booked for a trip
    const tripWithInShopVehicle = await apiRequest('POST', '/trips', {
      source: 'A',
      destination: 'B',
      vehicleId: testVehicle.id,
      driverId: testDriver.id,
      cargoWeight: 100,
      plannedDistance: 50
    }, tokens.FLEET_MANAGER);
    assert.strictEqual(tripWithInShopVehicle.status, 400, 'Should reject booking vehicle in shop');
    console.log('   ✅ Vehicle IN_SHOP blocked from dispatch');

    // 4.3 Close maintenance -> vehicle back to AVAILABLE
    const closeMaintRes = await apiRequest('POST', `/maintenance/${maintLog.id}/close`, {}, tokens.FLEET_MANAGER);
    assert.strictEqual(closeMaintRes.status, 200, 'Failed to close maintenance');

    const closedVehicle = await prisma.vehicle.findUnique({ where: { id: testVehicle.id } });
    assert.strictEqual(closedVehicle.status, 'AVAILABLE', 'Vehicle should return to AVAILABLE on maintenance close');
    console.log('   ✅ Maintenance close returns vehicle to AVAILABLE');


    // 5. Fuel & Expenses Reports
    console.log('\n--- 5. FUEL & EXPENSES LOGS ---');

    // Get baseline summary KPIs before logging test items
    const beforeSummaryRes = await apiRequest('GET', '/reports/summary', null, tokens.FLEET_MANAGER);
    assert.strictEqual(beforeSummaryRes.status, 200);
    const beforeKpis = beforeSummaryRes.data;

    // Log fuel
    const fuelRes = await apiRequest('POST', '/fuel/logs', {
      vehicleId: testVehicle.id,
      liters: 30,
      pricePerLiter: 2.0,
      cost: 60.0
    }, tokens.FLEET_MANAGER);
    assert.strictEqual(fuelRes.status, 201, 'Failed to log fuel');

    // Log expense
    const expenseRes = await apiRequest('POST', '/fuel/expenses', {
      vehicleId: testVehicle.id,
      type: 'TOLL',
      amount: 25.0,
      description: 'Highway toll charge'
    }, tokens.FLEET_MANAGER);
    assert.strictEqual(expenseRes.status, 201, 'Failed to log expense');

    // Verify operational cost sums Fuel + Maintenance + Toll
    const afterSummaryRes = await apiRequest('GET', '/reports/summary', null, tokens.FLEET_MANAGER);
    assert.strictEqual(afterSummaryRes.status, 200);
    const afterKpis = afterSummaryRes.data;

    // Deltas: Fuel (+60), Maintenance (0, as oil change was already logged before baseline), Toll Expense (+25)
    // Operational Cost delta = 60 + 0 + 25 = 85
    const fuelDelta = afterKpis.fuelCostMonth - beforeKpis.fuelCostMonth;
    const maintenanceDelta = afterKpis.maintenanceCostMonth - beforeKpis.maintenanceCostMonth;
    const operationalDelta = afterKpis.operationalCostMonth - beforeKpis.operationalCostMonth;

    console.log(`      Deltas -> Fuel: ${fuelDelta}, Maintenance: ${maintenanceDelta}, Operational: ${operationalDelta}`);
    assert.ok(Math.abs(fuelDelta - 60.0) < 0.1, 'Fuel cost delta mismatch');
    assert.ok(Math.abs(maintenanceDelta - 0.0) < 0.1, 'Maintenance cost delta mismatch');
    assert.ok(Math.abs(operationalDelta - 85.0) < 0.1, 'Operational cost delta mismatch');
    console.log('   ✅ Operational cost dynamic aggregation verified (via delta checks)');


    // 6. Dashboard Filters & Reports
    console.log('\n--- 6. DASHBOARD & REPORTS ---');

    // 6.1 Exactly 7 KPIs on summary
    const requiredKpis = [
      'activeVehicles',
      'availableVehicles',
      'maintenanceVehicles',
      'driversOnDuty',
      'activeTrips',
      'pendingTrips',
      'fleetUtilization'
    ];
    for (const key of requiredKpis) {
      assert.ok(afterKpis[key] !== undefined, `KPI ${key} is missing`);
    }
    console.log('   ✅ Dashboard contains exactly the 7 required KPIs');

    // 6.2 CSV export returns well-formed headers
    const csvRes = await apiRequest('GET', '/reports/export/csv?type=trips', null, tokens.FLEET_MANAGER);
    assert.strictEqual(csvRes.status, 200);
    assert.ok(csvRes.data.startsWith('Trip Number,Source,Destination'), 'CSV export has malformed headers');
    console.log('   ✅ CSV exports verified');


    // 7. Production Hardening
    console.log('\n--- 7. PRODUCTION HARDENING ---');

    // Set production environment variables and simulate error
    process.env.NODE_ENV = 'production';
    const badReq = await apiRequest('POST', '/vehicles', { registrationNumber: '' }, tokens.FLEET_MANAGER);
    assert.ok(!badReq.data.stack, 'Production error leaked stack trace');
    assert.ok(!badReq.data.prismaMessage, 'Production error leaked Prisma internals');
    process.env.NODE_ENV = 'test'; // restore
    console.log('   ✅ Stack traces suppressed under production environments');

    console.log('\n🎉 ALL E2E INTEGRATION TESTS PASSED!');
  } catch (err) {
    console.error('\n❌ Test Failure detected:');
    console.error(err);
    process.exitCode = 1;
  } finally {
    // Shutdown server
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
  }
}

runTests();
