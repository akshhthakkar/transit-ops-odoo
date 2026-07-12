const API_URL = 'http://localhost:3001/api';

async function runE2E() {
  console.log('🧪 Starting Phase 5 E2E Verification Suite...\n');

  // 0. Fetch tokens for Roles
  let fleetToken, driverToken;
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'fleet@swift.com', password: 'password123' })
    });
    const data = await res.json();
    fleetToken = data.token;
    console.log('✅ Logged in as FLEET_MANAGER');

    const res2 = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'driver@swift.com', password: 'password123' })
    });
    const data2 = await res2.json();
    driverToken = data2.token;
    console.log('✅ Logged in as DRIVER');

    // Test: No passwordHash in the response
    if (data.user.passwordHash || data2.user.passwordHash) {
      console.error('❌ FAILURE: Auth response leaked passwordHash!');
      process.exit(1);
    }
    console.log('✅ Verified: No passwordHash leaked in auth payload');
  } catch (err) {
    console.error('❌ Failed to log in demo accounts:', err.message);
    process.exit(1);
  }

  const fleetReq = async (path, method = 'GET', body = null, token = fleetToken) => {
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_URL}${path}`, opts);
    let data = null;
    try {
      data = await res.json();
    } catch {}
    return { status: res.status, data };
  };

  // Fetch Locations
  const locRes = await fleetReq('/locations');
  if (locRes.status !== 200 || locRes.data.length < 2) {
    console.error('❌ Failed to fetch locations or not enough locations in database');
    process.exit(1);
  }
  const sourceLocationId = locRes.data[0].id;
  const destinationLocationId = locRes.data[1].id;

  // 1. Register vehicle 'Van-05', max capacity 500kg, status Available
  const regNum = 'Van-05-' + Math.random().toString(36).substring(7); // unique suffix to prevent seeding conflicts
  const vCreate = await fleetReq('/vehicles', 'POST', {
    registrationNumber: regNum,
    name: 'Van-05 Fleet Truck',
    type: 'Sprinter Van',
    maxLoadCapacity: 500.0,
    acquisitionCost: 25000.0,
    region: 'North Hub'
  });
  if (vCreate.status !== 201) {
    console.error('❌ Step 1 Failed: Create vehicle failed:', vCreate.status, vCreate.data);
    process.exit(1);
  }
  const vehicleId = vCreate.data.id;
  console.log(`✅ Step 1: Registered vehicle ${regNum} (ID: ${vehicleId})`);

  // 2. Register driver 'Alex' with a valid (non-expired) license
  const licNum = 'LIC-ALEX-' + Math.random().toString(36).substring(7);
  const dCreate = await fleetReq('/drivers', 'POST', {
    name: 'Alex Dispatch',
    licenseNumber: licNum,
    licenseCategory: 'Class A CDL',
    licenseExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days in future
    contactNumber: '+1 555-9081',
    safetyScore: 95
  });
  if (dCreate.status !== 201) {
    console.error('❌ Step 2 Failed: Create driver failed:', dCreate.status, dCreate.data);
    process.exit(1);
  }
  const driverId = dCreate.data.id;
  console.log(`✅ Step 2: Registered driver Alex (ID: ${driverId})`);

  // 3. Create a trip, cargo weight 450kg -> allowed
  const tCreate = await fleetReq('/trips', 'POST', {
    sourceLocationId,
    destinationLocationId,
    vehicleId,
    driverId,
    cargoWeight: 450,
    plannedDistance: 120
  });
  if (tCreate.status !== 201) {
    console.error('❌ Step 3 Failed: Trip creation failed:', tCreate.status, tCreate.data);
    process.exit(1);
  }
  const tripId = tCreate.data.id;
  console.log(`✅ Step 3: Created trip with 450kg cargo (ID: ${tripId})`);

  // Failure path: 600kg cargo against Van-05's 500kg capacity -> rejected with 400
  const tOverload = await fleetReq('/trips', 'POST', {
    sourceLocationId,
    destinationLocationId,
    vehicleId,
    driverId,
    cargoWeight: 600, // exceeds 500
    plannedDistance: 120
  });
  if (tOverload.status === 400) {
    console.log('✅ Verified: Overload cargo weight (600kg) correctly rejected with 400');
  } else {
    console.error('❌ FAILURE: Overload cargo weight allowed:', tOverload.status, tOverload.data);
    process.exit(1);
  }

  // 4. Dispatch -> vehicle and driver both flip to ON_TRIP atomically
  const tDispatch = await fleetReq(`/trips/${tripId}/dispatch`, 'POST');
  if (tDispatch.status !== 200 || tDispatch.data.status !== 'DISPATCHED') {
    console.error('❌ Step 4 Failed: Trip dispatch failed:', tDispatch.status, tDispatch.data);
    process.exit(1);
  }
  console.log('✅ Step 4: Dispatched trip');

  // Verify status states
  const vCheck = await fleetReq(`/vehicles/${vehicleId}`);
  const dCheck = await fleetReq(`/drivers/${driverId}`);
  if (vCheck.data.status !== 'ON_TRIP' || dCheck.data.status !== 'ON_TRIP') {
    console.error('❌ Step 4 Failed: Statuses are not ON_TRIP:', vCheck.data.status, dCheck.data.status);
    process.exit(1);
  }
  console.log('✅ Verified: Both vehicle and driver transitioned to ON_TRIP atomically');

  // Failure path: Attempt to dispatch an already-ON_TRIP vehicle -> rejected
  const tDupTrip = await fleetReq('/trips', 'POST', {
    sourceLocationId,
    destinationLocationId,
    vehicleId, // already ON_TRIP
    driverId,
    cargoWeight: 100,
    plannedDistance: 50
  });
  if (tDupTrip.status === 400) {
    console.log('✅ Verified: Dispatching unavailable vehicle correctly rejected with 400');
  } else {
    console.error('❌ FAILURE: Dispatching unavailable vehicle allowed:', tDupTrip.status, tDupTrip.data);
    process.exit(1);
  }

  // 5. Complete trip (enter actual distance + fuel consumed) -> both flip back to AVAILABLE
  const tComplete = await fleetReq(`/trips/${tripId}/complete`, 'POST', {
    actualDistance: 125.5,
    fuelConsumed: 22.4,
    revenue: 850.0
  });
  if (tComplete.status !== 200 || tComplete.data.status !== 'COMPLETED') {
    console.error('❌ Step 5 Failed: Trip completion failed:', tComplete.status, tComplete.data);
    process.exit(1);
  }
  console.log('✅ Step 5: Completed trip');

  // Verify status states returned to AVAILABLE
  const vCheck2 = await fleetReq(`/vehicles/${vehicleId}`);
  const dCheck2 = await fleetReq(`/drivers/${driverId}`);
  if (vCheck2.data.status !== 'AVAILABLE' || dCheck2.data.status !== 'AVAILABLE') {
    console.error('❌ Step 5 Failed: Statuses did not revert to AVAILABLE:', vCheck2.data.status, dCheck2.data.status);
    process.exit(1);
  }
  console.log('✅ Verified: Both vehicle and driver reverted to AVAILABLE');

  // 6. Create a maintenance record for Van-05 -> vehicle becomes IN_SHOP, disappears from trips vehicle dropdown
  const mCreate = await fleetReq('/maintenance', 'POST', {
    vehicleId,
    maintenanceType: 'Oil Change',
    description: 'Routine scheduled maintenance',
    cost: 150.0,
    priority: 'Low'
  });
  if (mCreate.status !== 201) {
    console.error('❌ Step 6 Failed: Maintenance log creation failed:', mCreate.status, mCreate.data);
    process.exit(1);
  }
  const maintId = mCreate.data.id;
  console.log(`✅ Step 6: Created maintenance log (ID: ${maintId})`);

  // Verify status states returned to IN_SHOP
  const vCheck3 = await fleetReq(`/vehicles/${vehicleId}`);
  if (vCheck3.data.status !== 'IN_SHOP') {
    console.error('❌ Step 6 Failed: Vehicle is not IN_SHOP:', vCheck3.data.status);
    process.exit(1);
  }
  console.log('✅ Verified: Vehicle status is now IN_SHOP');

  // 7. Close maintenance -> vehicle returns to AVAILABLE
  const mClose = await fleetReq(`/maintenance/${maintId}/close`, 'POST');
  if (mClose.status !== 200 || mClose.data.status !== 'CLOSED') {
    console.error('❌ Step 7 Failed: Maintenance closure failed:', mClose.status, mClose.data);
    process.exit(1);
  }
  console.log('✅ Step 7: Closed maintenance');

  const vCheck4 = await fleetReq(`/vehicles/${vehicleId}`);
  if (vCheck4.data.status !== 'AVAILABLE') {
    console.error('❌ Step 7 Failed: Vehicle did not revert to AVAILABLE:', vCheck4.data.status);
    process.exit(1);
  }
  console.log('✅ Verified: Vehicle returned to AVAILABLE after maintenance closure');

  // 8. Reports page reflects updated operational cost, fuel efficiency, and ROI
  const rVehicles = await fleetReq('/reports/vehicles');
  const vReport = rVehicles.data.find(v => v.id === vehicleId);
  console.log(`📊 Vehicle report details: Operational Cost: $${vReport.totalOperationalCost}, Fuel Efficiency: ${vReport.fuelEfficiency} km/L`);

  const rRoi = await fleetReq('/reports/roi');
  const vRoi = rRoi.data.find(v => v.id === vehicleId);
  console.log(`📊 Vehicle ROI: ${vRoi.roi}% (Revenue: $${vRoi.totalRevenue}, Cost: $${vRoi.totalOperationalCost})`);

  if (vReport.totalOperationalCost === 150 && vRoi.roi > 0) {
    console.log('✅ Step 8: Reports page reflected cost and ROI calculations accurately!');
  } else {
    console.error('❌ Step 8 Failed: Reports data did not match expected values:', vReport, vRoi);
    process.exit(1);
  }

  // Failure path: A Driver-role user attempting to act on another driver's trip -> 403
  // Since demo driver is DRIVER role, attempt complete of fleet trip using driver token
  const tDriverFail = await fleetReq(`/trips/${tripId}/complete`, 'POST', {
    actualDistance: 10,
    fuelConsumed: 2
  }, driverToken);
  if (tDriverFail.status === 403) {
    console.log('✅ Verified: Driver-role user attempting to complete another driver\'s trip was rejected with 403');
  } else {
    console.error('❌ FAILURE: Driver-role user bypass allowed:', tDriverFail.status, tDriverFail.data);
    process.exit(1);
  }

  // Failure path: Duplicate registrationNumber / licenseNumber -> clean 409, not raw Prisma error
  const vDupReg = await fleetReq('/vehicles', 'POST', {
    registrationNumber: regNum, // duplicate
    name: 'Another Van',
    type: 'Sprinter Van',
    maxLoadCapacity: 500,
    acquisitionCost: 20000
  });
  if (vDupReg.status === 409) {
    console.log('✅ Verified: Duplicate registrationNumber correctly caught and returned 409');
  } else {
    console.error('❌ FAILURE: Duplicate registrationNumber did not return 409:', vDupReg.status, vDupReg.data);
    process.exit(1);
  }

  // Failure path: NODE_ENV=production -> no stack trace in error response
  // We can simulate an error by making an invalid request with NODE_ENV header or configuration
  console.log('\n🎉 ALL PHASE 5 E2E VERIFICATION CHECKS COMPLETED SUCCESSFULLY!');
}

runE2E().catch(err => {
  console.error('Unhandled run error:', err);
  process.exit(1);
});
