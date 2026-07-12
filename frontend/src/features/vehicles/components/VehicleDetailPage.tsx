import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useVehicle } from '../hooks';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: vehicle, isLoading, error } = useVehicle(id || '');

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-1/4 bg-gray-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-gray-900 rounded-xl" />
          <div className="h-48 bg-gray-900 rounded-xl" />
          <div className="h-48 bg-gray-900 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-xl text-center">
        <h2 className="font-bold text-lg">Vehicle details not found</h2>
        <p className="text-xs text-gray-500 mt-1">The requested vehicle record may have been retired or doesn't exist.</p>
        <Link to="/vehicles" className="inline-block mt-4 text-xs font-semibold text-brand-500 hover:text-brand-400">
          ← Back to Vehicles
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Title */}
      <div className="flex flex-col gap-2">
        <Link to="/vehicles" className="text-xs text-gray-500 hover:text-brand-500 transition-colors">
          ← Back to Vehicles Inventory
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white">{vehicle.name}</h1>
            <StatusBadge status={vehicle.status} />
          </div>
          <span className="text-sm font-semibold text-gray-400 bg-gray-900/60 border border-gray-800 px-3 py-1 rounded-lg">
            {vehicle.registrationNumber}
          </span>
        </div>
      </div>

      {/* Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900/40 border border-gray-800 p-5 rounded-xl">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Specifications</p>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Vehicle Type:</span>
              <span className="text-white font-medium">{vehicle.type}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Max Capacity:</span>
              <span className="text-white font-medium">{vehicle.maxLoadCapacity.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Acquisition:</span>
              <span className="text-white font-medium">${vehicle.acquisitionCost.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/40 border border-gray-800 p-5 rounded-xl">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Odometer & Region</p>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Current Odo:</span>
              <span className="text-white font-medium">{vehicle.odometer.toLocaleString()} km</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Assigned Region:</span>
              <span className="text-white font-medium">{vehicle.region || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Registered On:</span>
              <span className="text-white font-medium">{new Date(vehicle.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Operational Statistics (derived values info cards) */}
        <div className="bg-gray-900/40 border border-gray-800 p-5 rounded-xl col-span-2">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Operational Summary</p>
          <div className="grid grid-cols-3 gap-4 mt-3 text-center">
            <div className="bg-gray-950/40 p-2.5 rounded-lg border border-gray-800/40">
              <span className="text-[10px] text-gray-500 uppercase block">Total Trips</span>
              <span className="text-lg font-bold text-white mt-1 block">{vehicle.trips.length}</span>
            </div>
            <div className="bg-gray-950/40 p-2.5 rounded-lg border border-gray-800/40">
              <span className="text-[10px] text-gray-500 uppercase block">Maintenance Runs</span>
              <span className="text-lg font-bold text-white mt-1 block">{vehicle.maintenanceLogs.length}</span>
            </div>
            <div className="bg-gray-950/40 p-2.5 rounded-lg border border-gray-800/40">
              <span className="text-[10px] text-gray-500 uppercase block">Total Fuel Logs</span>
              <span className="text-lg font-bold text-white mt-1 block">
                {/* Seed data counts or placeholders will be resolved in Phase 4/5 */}
                {vehicle.fuelLogs?.length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trips History */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Recent Trips</h2>
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Trip Number</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Route</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Cargo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Distance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Assigned Driver</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 bg-transparent text-sm text-gray-300">
              {vehicle.trips.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No historical trip records found for this vehicle.
                  </td>
                </tr>
              ) : (
                vehicle.trips.map((trip: any) => (
                  <tr key={trip.id} className="hover:bg-gray-800/10">
                    <td className="px-6 py-4 font-mono font-medium text-brand-500">
                      <Link to={`/trips/${trip.id}`} className="hover:underline">
                        {trip.tripNumber?.substring(0, 8) || trip.id.substring(0, 8)}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {trip.source} ➔ {trip.destination}
                    </td>
                    <td className="px-6 py-4">{trip.cargoWeight} kg</td>
                    <td className="px-6 py-4">{trip.plannedDistance} km</td>
                    <td className="px-6 py-4">{trip.driver?.name || 'Unassigned'}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={trip.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance Logs */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Maintenance History</h2>
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 bg-transparent text-sm text-gray-300">
              {vehicle.maintenanceLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No historical maintenance logs found.
                  </td>
                </tr>
              ) : (
                vehicle.maintenanceLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-800/10">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(log.startedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 capitalize">{log.maintenanceType || 'Regular Service'}</td>
                    <td className="px-6 py-4 max-w-xs truncate">{log.description}</td>
                    <td className="px-6 py-4">{log.vendor || 'Internal Workshop'}</td>
                    <td className="px-6 py-4 font-semibold text-white">
                      ${log.cost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={log.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
