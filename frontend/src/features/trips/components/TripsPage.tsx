import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useTrips, useCreateTrip } from '../hooks';
import { useAvailableVehicles } from '../../vehicles/hooks';
import { useEligibleDrivers } from '../../drivers/hooks';
import { useAuthStore } from '../../../store/auth.store';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
export type TripStatus = 'DRAFT' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';

const createSchema = z.object({
  source: z.string().min(1, 'Source is required'),
  destination: z.string().min(1, 'Destination is required'),
  vehicleId: z.string().uuid('Please select a vehicle'),
  driverId: z.string().uuid('Please select a driver'),
  cargoWeight: z.number().positive('Must be positive'),
  plannedDistance: z.number().positive('Must be positive'),
});

type CreateFormValues = z.infer<typeof createSchema>;

export function TripsPage() {
  const { user } = useAuthStore();
  // Fleet Managers and Drivers are allowed to schedule trips
  const isAuthorized = user?.role === 'FLEET_MANAGER' || user?.role === 'DRIVER';

  // Filters state
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Queries
  const { data, isLoading, error } = useTrips({
    page,
    limit: 10,
    status: status ? (status as TripStatus) : undefined,
  });

  const { data: availableVehicles = [], isLoading: isLoadingVehicles } = useAvailableVehicles();
  const { data: eligibleDrivers = [], isLoading: isLoadingDrivers } = useEligibleDrivers();

  // Create Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
  });

  const createMutation = useCreateTrip();

  const onSubmit = (values: CreateFormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        reset();
        setIsModalOpen(false);
      },
    });
  };

  const statuses = [
    { value: '', label: 'All Trips' },
    { value: 'DRAFT', label: 'Drafts' },
    { value: 'DISPATCHED', label: 'Dispatched' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const columns = [
    {
      key: 'tripNumber',
      header: 'Trip Number',
      render: (row: any) => (
        <Link
          to={`/trips/${row.id}`}
          className="text-brand-500 hover:text-brand-400 font-mono font-bold transition-colors"
        >
          {row.tripNumber?.substring(0, 8) || row.id.substring(0, 8)}
        </Link>
      ),
    },
    {
      key: 'route',
      header: 'Route',
      render: (row: any) => `${row.source} ➔ ${row.destination}`,
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (row: any) => (
        <Link to={`/vehicles/${row.vehicle.id}`} className="text-gray-400 hover:text-white transition-colors">
          {row.vehicle.registrationNumber}
        </Link>
      ),
    },
    {
      key: 'driver',
      header: 'Driver',
      render: (row: any) => (
        <Link to={`/drivers/${row.driver.id}`} className="text-gray-400 hover:text-white transition-colors">
          {row.driver.name}
        </Link>
      ),
    },
    {
      key: 'cargoWeight',
      header: 'Cargo',
      render: (row: any) => `${row.cargoWeight.toLocaleString()} kg`,
    },
    {
      key: 'plannedDistance',
      header: 'Distance',
      render: (row: any) => `${row.plannedDistance.toLocaleString()} km`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: any) => <StatusBadge status={row.status} />,
    },
  ];

  const apiError = createMutation.error as any;
  const createErrorMessage =
    apiError?.response?.data?.message || apiError?.message || 'Failed to create trip';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Trips</h1>
          <p className="text-gray-400 text-sm mt-1">Manage dispatch schedules and status transitions</p>
        </div>
        {isAuthorized && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 hover:-translate-y-0.5"
          >
            Create Trip
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-800 space-x-6 overflow-x-auto pb-px">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => {
              setStatus(s.value);
              setPage(1);
            }}
            className={`pb-4 text-sm font-medium transition-all relative ${
              status === s.value
                ? 'text-brand-500 font-bold border-b-2 border-brand-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Trips DataTable */}
      {error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-center text-sm">
          Failed to fetch trip logs. Please verify database availability.
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.items || []}
          isLoading={isLoading}
          emptyMessage="No trips matching the filters were found."
          pagination={
            data
              ? {
                  page: data.page,
                  limit: data.limit,
                  total: data.total,
                  onPageChange: setPage,
                }
              : undefined
          }
        />
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Create New Trip</h2>
              <button
                onClick={() => {
                  reset();
                  createMutation.reset();
                  setIsModalOpen(false);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Source Location
                  </label>
                  <input
                    {...register('source')}
                    placeholder="e.g. Warehouse 4"
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  {errors.source && (
                    <p className="text-rose-500 text-[10px] mt-1">{errors.source.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Destination Location
                  </label>
                  <input
                    {...register('destination')}
                    placeholder="e.g. Client Site"
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  {errors.destination && (
                    <p className="text-rose-500 text-[10px] mt-1">{errors.destination.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Select Vehicle (AVAILABLE)
                </label>
                <select
                  {...register('vehicleId')}
                  disabled={isLoadingVehicles}
                  className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                >
                  <option value="">Select a vehicle...</option>
                  {availableVehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} — {v.name} ({v.type}, Cap: {v.maxLoadCapacity}kg)
                    </option>
                  ))}
                </select>
                {errors.vehicleId && (
                  <p className="text-rose-500 text-[10px] mt-1">{errors.vehicleId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Select Driver (ELIGIBLE)
                </label>
                <select
                  {...register('driverId')}
                  disabled={isLoadingDrivers}
                  className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                >
                  <option value="">Select a driver...</option>
                  {eligibleDrivers.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name} (License: {d.licenseCategory}, Safety: {d.safetyScore}/100)
                    </option>
                  ))}
                </select>
                {errors.driverId && (
                  <p className="text-rose-500 text-[10px] mt-1">{errors.driverId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Cargo Weight (kg)
                  </label>
                  <input
                    {...register('cargoWeight', { valueAsNumber: true })}
                    type="number"
                    placeholder="e.g. 500"
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  {errors.cargoWeight && (
                    <p className="text-rose-500 text-[10px] mt-1">{errors.cargoWeight.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Planned Distance (km)
                  </label>
                  <input
                    {...register('plannedDistance', { valueAsNumber: true })}
                    type="number"
                    placeholder="e.g. 150"
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  {errors.plannedDistance && (
                    <p className="text-rose-500 text-[10px] mt-1">
                      {errors.plannedDistance.message}
                    </p>
                  )}
                </div>
              </div>

              {createMutation.isError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg text-center font-medium">
                  {createErrorMessage}
                </div>
              )}

              <div className="pt-4 border-t border-gray-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    createMutation.reset();
                    setIsModalOpen(false);
                  }}
                  className="bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Scheduling...' : 'Schedule Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
