import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDriver } from '../hooks';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: driver, isLoading, error } = useDriver(id || '');

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

  const apiError = error as any;
  if (error || !driver) {
    const errorMsg = apiError?.response?.data?.message || 'Driver profile not found or access forbidden.';
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-xl text-center">
        <h2 className="font-bold text-lg">Access Denied / Not Found</h2>
        <p className="text-xs text-gray-500 mt-1">{errorMsg}</p>
        <Link to="/drivers" className="inline-block mt-4 text-xs font-semibold text-brand-500 hover:text-brand-400">
          ← Back to Drivers List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Title */}
      <div className="flex flex-col gap-2">
        <Link to="/drivers" className="text-xs text-gray-500 hover:text-brand-500 transition-colors">
          ← Back to Drivers Crew
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white">{driver.name}</h1>
            <StatusBadge status={driver.status} />
          </div>
          <span className="text-sm font-semibold text-gray-400 bg-gray-900/60 border border-gray-800 px-3 py-1 rounded-lg">
            Safety Score: {driver.safetyScore}/100
          </span>
        </div>
      </div>

      {/* Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900/40 border border-gray-800 p-5 rounded-xl">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">License Verification</p>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">License Number:</span>
              <span className="text-white font-medium">{driver.licenseNumber}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Category / Class:</span>
              <span className="text-white font-medium">{driver.licenseCategory}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Expiry Date:</span>
              <span className={`font-semibold ${new Date(driver.licenseExpiryDate).getTime() < Date.now() ? 'text-rose-500' : 'text-white'}`}>
                {new Date(driver.licenseExpiryDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/40 border border-gray-800 p-5 rounded-xl">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contact & Registration</p>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Mobile No:</span>
              <span className="text-white font-medium">{driver.contactNumber}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Registered On:</span>
              <span className="text-white font-medium">{new Date(driver.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Last Active:</span>
              <span className="text-white font-medium">{new Date(driver.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/40 border border-gray-800 p-5 rounded-xl">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Login Account</p>
          <div className="mt-3 space-y-2">
            {driver.user ? (
              <>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white font-medium">{driver.user.email}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Role Authority:</span>
                  <span className="text-brand-500 font-semibold">{driver.user.role}</span>
                </div>
              </>
            ) : (
              <div className="text-xs text-gray-500 py-3 text-center">
                No user credentials linked to this driver profile.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trips History */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Recent Assigned Trips</h2>
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Trip Number</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Route</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Cargo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Distance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Assigned Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 bg-transparent text-sm text-gray-300">
              {driver.trips.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No historical trip assignments found.
                  </td>
                </tr>
              ) : (
                driver.trips.map((trip: any) => (
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
                    <td className="px-6 py-4">{trip.vehicle?.registrationNumber || 'Unassigned'}</td>
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
    </div>
  );
}
