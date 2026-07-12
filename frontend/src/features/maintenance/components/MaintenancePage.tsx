import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMaintenance, useCreateMaintenance, useCloseMaintenance } from '../hooks';
import { useVehicles } from '../../vehicles/hooks';
import { useVendors } from '../../trips/hooks';
import { useAuthStore } from '../../../store/auth.store';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';

const MAINTENANCE_TYPES = ['Routine Service', 'Repair', 'Inspection', 'Tire Change', 'Oil Change', 'Brake Service', 'Electrical', 'Other'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const createSchema = z.object({
  vehicleId: z.string().uuid('Please select a vehicle'),
  maintenanceType: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  vendorId: z.string().uuid().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  priority: z.string().optional(),
  cost: z.coerce.number().nonnegative('Cost must be non-negative'),
});

type CreateFormValues = z.input<typeof createSchema>;

export function MaintenancePage() {
  const { user } = useAuthStore();
  const isFleetManager = user?.role === 'FLEET_MANAGER';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);

  const { data: logs = [], isLoading, error } = useMaintenance();
  const { data: vendors = [] } = useVendors();

  // For the modal vehicle picker: show non-ON_TRIP vehicles
  const { data: allVehiclesData } = useVehicles({ page: 1, limit: 100 });
  const pickableVehicles: any[] = (allVehiclesData?.data ?? []).filter(
    (v: any) => v.status !== 'ON_TRIP' && v.status !== 'RETIRED'
  );

  const createMutation = useCreateMaintenance();
  const closeMutation = useCloseMaintenance();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFormValues>({ resolver: zodResolver(createSchema) });

  const onSubmit = (values: z.output<typeof createSchema>) => {
    createMutation.mutate(values as any, {
      onSuccess: () => {
        reset();
        setIsModalOpen(false);
      },
    });
  };

  const handleClose = (id: string) => {
    if (!confirm('Mark this maintenance log as closed and return the vehicle to service?')) return;
    setClosingId(id);
    closeMutation.mutate(id, { onSettled: () => setClosingId(null) });
  };

  const columns = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (row: any) => (
        <span className="font-mono text-xs font-semibold text-white">
          {row.vehicle?.registrationNumber}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row: any) => (
        <span className="text-gray-300 text-xs">{row.maintenanceType || 'General'}</span>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (row: any) => {
        const priority = row.priority ?? 'MEDIUM';
        const colorMap: Record<string, string> = {
          LOW: 'text-emerald-400',
          MEDIUM: 'text-amber-400',
          HIGH: 'text-orange-400',
          CRITICAL: 'text-rose-500',
        };
        return (
          <span className={`text-xs font-bold ${colorMap[priority] ?? 'text-gray-400'}`}>
            {priority}
          </span>
        );
      },
    },
    {
      key: 'vendor',
      header: 'Vendor',
      render: (row: any) => (
        <span className="text-gray-400 text-xs">{row.vendor?.name ?? '—'}</span>
      ),
    },
    {
      key: 'cost',
      header: 'Cost',
      render: (row: any) => (
        <span className="text-white font-semibold text-xs">
          ${Number(row.cost ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: any) => <StatusBadge status={row.status} />,
    },
    {
      key: 'startedAt',
      header: 'Opened',
      render: (row: any) => (
        <span className="text-gray-400 text-xs font-mono">
          {new Date(row.startedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'closedAt',
      header: 'Closed',
      render: (row: any) =>
        row.closedAt ? (
          <span className="text-gray-400 text-xs font-mono">
            {new Date(row.closedAt).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-gray-600 text-xs">—</span>
        ),
    },
    ...(isFleetManager
      ? [
          {
            key: 'actions',
            header: 'Actions',
            render: (row: any) =>
              row.status === 'ACTIVE' ? (
                <button
                  onClick={() => handleClose(row.id)}
                  disabled={closingId === row.id}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 border border-emerald-800 hover:border-emerald-600 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                >
                  {closingId === row.id ? 'Closing…' : 'Close'}
                </button>
              ) : (
                <span className="text-gray-600 text-xs">Closed</span>
              ),
          },
        ]
      : []),
  ];

  const createApiError = createMutation.error as any;
  const createErrorMessage =
    createApiError?.response?.data?.message || createApiError?.message || null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Maintenance Logs</h1>
          <p className="text-gray-400 text-sm mt-1">
            Vehicle shop status, maintenance history, and service records.
          </p>
        </div>
        {isFleetManager && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-brand-500/20"
          >
            + Open Maintenance
          </button>
        )}
      </div>

      {/* Summary Counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['ACTIVE', 'CLOSED'] as const).map((s) => {
          const count = logs.filter((l: any) => l.status === s).length;
          const colors: Record<string, string> = {
            ACTIVE: 'border-amber-700 bg-amber-900/20',
            CLOSED: 'border-emerald-800 bg-emerald-900/20',
          };
          return (
            <div key={s} className={`border rounded-xl p-4 ${colors[s]}`}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{s}</p>
              <p className="text-3xl font-extrabold text-white mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-rose-500 text-sm bg-rose-950/30 border border-rose-900 rounded-lg p-3">
          {(error as any).message || 'Failed to load maintenance logs'}
        </p>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        emptyMessage="No maintenance logs found."
      />

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Open Maintenance Log</h2>
              <button
                onClick={() => { reset(); createMutation.reset(); setIsModalOpen(false); }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit as any)} className="p-6 space-y-4">
              {/* Vehicle */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Vehicle (excludes ON_TRIP)
                </label>
                <select
                  {...register('vehicleId')}
                  className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                >
                  <option value="">Select a vehicle...</option>
                  {pickableVehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} — {v.name} ({v.status})
                    </option>
                  ))}
                </select>
                {errors.vehicleId && (
                  <p className="text-rose-500 text-[10px] mt-1">{errors.vehicleId.message}</p>
                )}
              </div>

              {/* Type & Priority row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Type</label>
                  <select
                    {...register('maintenanceType')}
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  >
                    <option value="">Select type...</option>
                    {MAINTENANCE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Priority</label>
                  <select
                    {...register('priority')}
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Description</label>
                <textarea
                  {...register('description')}
                  rows={2}
                  placeholder="Brief description of maintenance work..."
                  className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors resize-none"
                />
                {errors.description && (
                  <p className="text-rose-500 text-[10px] mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Vendor & Cost row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Vendor (optional)</label>
                  <select
                    {...register('vendorId')}
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  >
                    <option value="">No vendor</option>
                    {vendors.map((v: any) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Estimated Cost ($)</label>
                  <input
                    {...register('cost')}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  {errors.cost && (
                    <p className="text-rose-500 text-[10px] mt-1">{errors.cost.message}</p>
                  )}
                </div>
              </div>

              {createErrorMessage && (
                <p className="text-rose-500 text-xs bg-rose-950/30 border border-rose-900 rounded-lg p-3">
                  {createErrorMessage}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { reset(); createMutation.reset(); setIsModalOpen(false); }}
                  className="text-sm font-semibold text-gray-400 hover:text-white px-4 py-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-semibold text-sm px-6 py-2 rounded-xl transition-colors"
                >
                  {createMutation.isPending ? 'Opening…' : 'Open Maintenance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
