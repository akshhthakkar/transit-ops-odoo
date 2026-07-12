import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTrip, useDispatchTrip, useCompleteTrip, useCancelTrip } from '../hooks';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useAuthStore } from '../../../store/auth.store';

const completeSchema = z.object({
  actualDistance: z.number().positive('Must be positive'),
  fuelConsumed: z.number().positive('Must be positive'),
  revenue: z.number().nonnegative('Cannot be negative').optional(),
});

type CompleteFormValues = z.infer<typeof completeSchema>;

export function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const isAuthorized = user?.role === 'FLEET_MANAGER' || user?.role === 'DRIVER';

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Queries & Mutations
  const { data: trip, isLoading, error } = useTrip(id || '');
  const dispatchMutation = useDispatchTrip();
  const completeMutation = useCompleteTrip();
  const cancelMutation = useCancelTrip();

  // Complete Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompleteFormValues>({
    resolver: zodResolver(completeSchema),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-1/4 bg-gray-800 rounded" />
        <div className="h-48 bg-gray-900 rounded-xl" />
      </div>
    );
  }

  const apiError = error as any;
  if (error || !trip) {
    const errorMsg = apiError?.response?.data?.message || "Trip logs not found or access forbidden.";
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-xl text-center">
        <h2 className="font-bold text-lg">Access Denied / Not Found</h2>
        <p className="text-xs text-gray-500 mt-1">{errorMsg}</p>
        <Link to="/trips" className="inline-block mt-4 text-xs font-semibold text-brand-500 hover:text-brand-400">
          ← Back to Trips
        </Link>
      </div>
    );
  }

  const onDispatch = () => {
    if (confirm('Are you sure you want to dispatch this trip? The vehicle and driver will be set to ON_TRIP.')) {
      dispatchMutation.mutate(trip.id);
    }
  };

  const onCancel = () => {
    if (confirm('Are you sure you want to cancel this active trip? The vehicle and driver will return to AVAILABLE.')) {
      cancelMutation.mutate(trip.id);
    }
  };

  const onCompleteSubmit = (values: CompleteFormValues) => {
    completeMutation.mutate(
      {
        id: trip.id,
        data: values,
      },
      {
        onSuccess: () => {
          reset();
          setIsModalOpen(false);
        },
      }
    );
  };

  // Derived Performance Metrics
  const economy =
    trip.actualDistance && trip.fuelConsumed
      ? ((trip.fuelConsumed / trip.actualDistance) * 100).toFixed(1)
      : null;

  const roi =
    trip.revenue && trip.vehicle?.acquisitionCost
      ? ((trip.revenue / trip.vehicle.acquisitionCost) * 100).toFixed(2)
      : null;

  const completeApiError = completeMutation.error as any;
  const completeErrorMessage =
    completeApiError?.response?.data?.message || completeApiError?.message || 'Failed to complete trip';

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <div className="flex flex-col gap-2">
        <Link to="/trips" className="text-xs text-gray-500 hover:text-brand-500 transition-colors">
          ← Back to Trips Schedule
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white">
              {trip.source} ➔ {trip.destination}
            </h1>
            <StatusBadge status={trip.status} />
          </div>
          <span className="text-xs font-bold font-mono text-gray-400 bg-gray-900 border border-gray-800 px-3 py-1 rounded-lg">
            No: {trip.tripNumber?.substring(0, 8) || trip.id.substring(0, 8)}
          </span>
        </div>
      </div>

      {/* Main Details Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Assets & Personnel */}
        <div className="bg-gray-900/40 border border-gray-800 p-5 rounded-xl space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Resources</h2>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Assigned Vehicle</p>
              <Link
                to={`/vehicles/${trip.vehicle.id}`}
                className="text-sm font-semibold text-brand-500 hover:text-brand-400 block mt-0.5"
              >
                {trip.vehicle.registrationNumber} — {trip.vehicle.name}
              </Link>
              <span className="text-[10px] text-gray-500">
                Odometer: {trip.vehicle.odometer.toLocaleString()} km
              </span>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Assigned Driver</p>
              <Link
                to={`/drivers/${trip.driver.id}`}
                className="text-sm font-semibold text-brand-500 hover:text-brand-400 block mt-0.5"
              >
                {trip.driver.name}
              </Link>
              <span className="text-[10px] text-gray-500">
                Safety Score: {trip.driver.safetyScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-gray-900/40 border border-gray-800 p-5 rounded-xl space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Parameters</h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Cargo Weight:</span>
              <span className="text-white font-medium">{trip.cargoWeight.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Planned Distance:</span>
              <span className="text-white font-medium">{trip.plannedDistance.toLocaleString()} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Created At:</span>
              <span className="text-white font-medium">
                {new Date(trip.createdAt).toLocaleString()}
              </span>
            </div>
            {trip.dispatchedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Dispatched At:</span>
                <span className="text-white font-medium font-mono text-[10px]">
                  {new Date(trip.dispatchedAt).toLocaleString()}
                </span>
              </div>
            )}
            {trip.completedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Completed At:</span>
                <span className="text-white font-medium font-mono text-[10px]">
                  {new Date(trip.completedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions or Financial Metrics */}
        <div className="bg-gray-900/40 border border-gray-800 p-5 rounded-xl flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              {trip.status === 'COMPLETED' ? 'Performance Insights' : 'Actions'}
            </h2>

            {trip.status === 'COMPLETED' ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Actual Distance:</span>
                  <span className="text-white font-medium">{trip.actualDistance} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fuel Consumed:</span>
                  <span className="text-white font-medium">{trip.fuelConsumed} Liters</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fuel Economy:</span>
                  <span className="text-emerald-400 font-semibold">{economy} L/100km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Revenue Logged:</span>
                  <span className="text-white font-medium">${trip.revenue?.toLocaleString()}</span>
                </div>
                {roi && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Acquisition ROI:</span>
                    <span className="text-brand-400 font-semibold">{roi}%</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                Transition states using buttons below. Modifying states will sync database logs.
              </p>
            )}
          </div>

          {isAuthorized && (
            <div className="mt-6 flex flex-col gap-2">
              {trip.status === 'DRAFT' && (
                <button
                  onClick={onDispatch}
                  disabled={dispatchMutation.isPending}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-lg text-xs font-semibold tracking-wide transition-all shadow shadow-brand-500/10"
                >
                  {dispatchMutation.isPending ? 'Dispatching...' : 'Dispatch Trip'}
                </button>
              )}

              {trip.status === 'DISPATCHED' && (
                <>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors"
                  >
                    Complete Trip
                  </button>
                  <button
                    onClick={onCancel}
                    disabled={cancelMutation.isPending}
                    className="w-full bg-transparent border border-gray-800 hover:bg-gray-800/40 text-rose-500 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors"
                  >
                    {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Trip'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Complete Trip Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Log Completion Metrics</h2>
              <button
                onClick={() => {
                  reset();
                  completeMutation.reset();
                  setIsModalOpen(false);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onCompleteSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Actual Distance Traveled (km)
                </label>
                <input
                  {...register('actualDistance', { valueAsNumber: true })}
                  type="number"
                  step="any"
                  placeholder="e.g. 152.4"
                  className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
                {errors.actualDistance && (
                  <p className="text-rose-500 text-[10px] mt-1">{errors.actualDistance.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Actual Fuel Consumed (Liters)
                </label>
                <input
                  {...register('fuelConsumed', { valueAsNumber: true })}
                  type="number"
                  step="any"
                  placeholder="e.g. 18.5"
                  className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
                {errors.fuelConsumed && (
                  <p className="text-rose-500 text-[10px] mt-1">{errors.fuelConsumed.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Revenue Generated ($) (Optional)
                </label>
                <input
                  {...register('revenue', { valueAsNumber: true })}
                  type="number"
                  step="any"
                  placeholder="e.g. 450"
                  className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
                {errors.revenue && (
                  <p className="text-rose-500 text-[10px] mt-1">{errors.revenue.message}</p>
                )}
              </div>

              {completeMutation.isError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg text-center font-medium">
                  {completeErrorMessage}
                </div>
              )}

              <div className="pt-4 border-t border-gray-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    completeMutation.reset();
                    setIsModalOpen(false);
                  }}
                  className="bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={completeMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {completeMutation.isPending ? 'Submitting...' : 'Complete Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
