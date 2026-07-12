import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useVehicles, useCreateVehicle, useDeleteVehicle } from '../hooks';
import { useAuthStore } from '../../../store/auth.store';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export type VehicleStatus = 'AVAILABLE' | 'ON_TRIP' | 'IN_SHOP' | 'RETIRED';

const createSchema = z.object({
  registrationNumber: z
    .string()
    .min(1, 'Registration number is required')
    .max(20, 'Too long'),
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  maxLoadCapacity: z.number().positive('Must be positive'),
  acquisitionCost: z.number().nonnegative('Cannot be negative'),
  region: z.string().optional(),
});

type CreateFormValues = z.infer<typeof createSchema>;

export function VehiclesPage() {
  const { user } = useAuthStore();
  const isFleetManager = user?.role === 'FLEET_MANAGER';

  // State for search and pagination
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Queries
  const { data, isLoading, error } = useVehicles({
    page,
    limit: 10,
    status: status ? (status as VehicleStatus) : undefined,
    type: type || undefined,
    region: region || undefined,
  });

  // Mutations
  const createMutation = useCreateVehicle();
  const deleteMutation = useDeleteVehicle();

  // Create Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
  });

  const onSubmit = (values: CreateFormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        reset();
        setIsModalOpen(false);
      },
    });
  };

  const handleDelete = (id: string, status: string) => {
    if (status === 'ON_TRIP') {
      alert('Cannot delete a vehicle while it is currently on a trip.');
      return;
    }
    if (confirm('Are you sure you want to retire and delete this vehicle?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns = [
    {
      key: 'registrationNumber',
      header: 'Registration No.',
      render: (row: any) => (
        <Link
          to={`/vehicles/${row.id}`}
          className="text-brand-500 hover:text-brand-400 font-semibold transition-colors"
        >
          {row.registrationNumber}
        </Link>
      ),
    },
    { key: 'name', header: 'Name' },
    { key: 'type', header: 'Type' },
    {
      key: 'maxLoadCapacity',
      header: 'Max Capacity (kg)',
      render: (row: any) => `${row.maxLoadCapacity.toLocaleString()} kg`,
    },
    {
      key: 'odometer',
      header: 'Odometer (km)',
      render: (row: any) => `${row.odometer.toLocaleString()} km`,
    },
    { key: 'region', header: 'Region', render: (row: any) => row.region || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (row: any) => <StatusBadge status={row.status} />,
    },
    ...(isFleetManager
      ? [
          {
            key: 'actions',
            header: 'Actions',
            render: (row: any) => (
              <button
                onClick={() => handleDelete(row.id, row.status)}
                disabled={row.status === 'ON_TRIP' || deleteMutation.isPending}
                className="text-rose-500 hover:text-rose-400 disabled:opacity-30 disabled:pointer-events-none transition-colors text-xs font-semibold"
              >
                Retire
              </button>
            ),
          },
        ]
      : []),
  ];

  const apiError = createMutation.error as any;
  const createErrorMessage =
    apiError?.response?.data?.message || apiError?.message || 'Failed to create vehicle';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Vehicles</h1>
          <p className="text-gray-400 text-sm mt-1">Manage transport fleet inventory</p>
        </div>
        {isFleetManager && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 hover:-translate-y-0.5"
          >
            Add Vehicle
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-900/40 border border-gray-800 p-4 rounded-xl">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gray-950/60 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="IN_SHOP">In Shop</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            Type
          </label>
          <input
            type="text"
            placeholder="e.g. Van, Truck"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gray-950/60 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors placeholder:text-gray-600"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            Region
          </label>
          <input
            type="text"
            placeholder="e.g. North, South"
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gray-950/60 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors placeholder:text-gray-600"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setStatus('');
              setType('');
              setRegion('');
              setPage(1);
            }}
            className="text-xs font-semibold text-gray-400 hover:text-white transition-colors py-2 px-3 hover:bg-gray-800/40 rounded-lg w-full text-center border border-gray-800/40"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Main Table */}
      {error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-center text-sm">
          Failed to fetch vehicles records. Please verify connection.
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.items || []}
          isLoading={isLoading}
          emptyMessage="No vehicles matching the filters were found."
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

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Add New Vehicle</h2>
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
                    Registration No.
                  </label>
                  <input
                    {...register('registrationNumber')}
                    placeholder="e.g. MH-12-PQ-1234"
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  {errors.registrationNumber && (
                    <p className="text-rose-500 text-[10px] mt-1">
                      {errors.registrationNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Display Name
                  </label>
                  <input
                    {...register('name')}
                    placeholder="e.g. Delivery Van 4"
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  {errors.name && (
                    <p className="text-rose-500 text-[10px] mt-1">{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Type
                  </label>
                  <input
                    {...register('type')}
                    placeholder="e.g. Van, Truck, Semi"
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  {errors.type && (
                    <p className="text-rose-500 text-[10px] mt-1">{errors.type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Max Capacity (kg)
                  </label>
                  <input
                    {...register('maxLoadCapacity', { valueAsNumber: true })}
                    type="number"
                    placeholder="e.g. 1500"
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  {errors.maxLoadCapacity && (
                    <p className="text-rose-500 text-[10px] mt-1">
                      {errors.maxLoadCapacity.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Acquisition Cost ($)
                  </label>
                  <input
                    {...register('acquisitionCost', { valueAsNumber: true })}
                    type="number"
                    placeholder="e.g. 42000"
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  {errors.acquisitionCost && (
                    <p className="text-rose-500 text-[10px] mt-1">
                      {errors.acquisitionCost.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Region (Optional)
                  </label>
                  <input
                    {...register('region')}
                    placeholder="e.g. North"
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
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
                  {createMutation.isPending ? 'Saving...' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
