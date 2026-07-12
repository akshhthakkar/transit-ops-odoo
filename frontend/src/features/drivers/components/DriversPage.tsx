import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useDrivers, useCreateDriver, useDeleteDriver } from '../hooks';
import { useAuthStore } from '../../../store/auth.store';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
export type DriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'SUSPENDED';

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  licenseNumber: z
    .string()
    .min(1, 'License number is required')
    .max(20, 'Too long'),
  licenseCategory: z.string().min(1, 'License category is required'),
  licenseExpiryDate: z.string().min(1, 'License expiry date is required'),
  contactNumber: z.string().min(1, 'Contact number is required'),
});

type CreateFormValues = z.infer<typeof createSchema>;

export function DriversPage() {
  const { user } = useAuthStore();
  const isAuthorized = user?.role === 'FLEET_MANAGER' || user?.role === 'SAFETY_OFFICER';

  // State for search and pagination
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('');
  const [licenseCategory, setLicenseCategory] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Queries
  const { data, isLoading, error } = useDrivers({
    page,
    limit: 10,
    status: status ? (status as DriverStatus) : undefined,
    licenseCategory: licenseCategory || undefined,
  });

  // Mutations
  const createMutation = useCreateDriver();
  const deleteMutation = useDeleteDriver();

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
    createMutation.mutate(
      {
        ...values,
        licenseExpiryDate: new Date(values.licenseExpiryDate).toISOString(),
      },
      {
        onSuccess: () => {
          reset();
          setIsModalOpen(false);
        },
      }
    );
  };

  const handleDelete = (id: string, status: string) => {
    if (status === 'ON_TRIP') {
      alert('Cannot delete a driver while they are currently on a trip.');
      return;
    }
    if (confirm('Are you sure you want to delete this driver?')) {
      deleteMutation.mutate(id);
    }
  };

  // Helper to determine if license is expiring soon (< 30 days) or expired
  const getLicenseExpiryWarning = (expiryDateStr: string) => {
    const expiryDate = new Date(expiryDateStr);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { class: 'text-rose-500 font-bold', text: 'Expired' };
    }
    if (diffDays <= 30) {
      return { class: 'text-amber-500 font-semibold', text: `Expiring in ${diffDays}d` };
    }
    return { class: 'text-gray-300', text: expiryDate.toLocaleDateString() };
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (row: any) => (
        <Link
          to={`/drivers/${row.id}`}
          className="text-brand-500 hover:text-brand-400 font-semibold transition-colors"
        >
          {row.name}
        </Link>
      ),
    },
    { key: 'licenseNumber', header: 'License No.' },
    { key: 'licenseCategory', header: 'License Category' },
    {
      key: 'licenseExpiryDate',
      header: 'License Expiry',
      render: (row: any) => {
        const warning = getLicenseExpiryWarning(row.licenseExpiryDate);
        return <span className={warning.class}>{warning.text}</span>;
      },
    },
    { key: 'contactNumber', header: 'Contact' },
    {
      key: 'safetyScore',
      header: 'Safety Score',
      render: (row: any) => (
        <span
          className={`font-semibold ${
            row.safetyScore >= 90
              ? 'text-emerald-400'
              : row.safetyScore >= 75
              ? 'text-amber-400'
              : 'text-rose-500'
          }`}
        >
          {row.safetyScore}/100
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: any) => <StatusBadge status={row.status} />,
    },
    ...(isAuthorized
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
                Delete
              </button>
            ),
          },
        ]
      : []),
  ];

  const apiError = createMutation.error as any;
  const createErrorMessage =
    apiError?.response?.data?.message || apiError?.message || 'Failed to create driver';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Drivers</h1>
          <p className="text-gray-400 text-sm mt-1">Manage delivery crew personnel</p>
        </div>
        {isAuthorized && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 hover:-translate-y-0.5"
          >
            Add Driver
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-900/40 border border-gray-800 p-4 rounded-xl">
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
            <option value="OFF_DUTY">Off Duty</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            License Category
          </label>
          <input
            type="text"
            placeholder="e.g. Class A, Class B"
            value={licenseCategory}
            onChange={(e) => {
              setLicenseCategory(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gray-950/60 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors placeholder:text-gray-600"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setStatus('');
              setLicenseCategory('');
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
          Failed to fetch drivers records. Please verify connection.
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.items || []}
          isLoading={isLoading}
          emptyMessage="No drivers matching the filters were found."
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
              <h2 className="text-lg font-bold text-white">Add New Driver</h2>
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
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Driver Name
                </label>
                <input
                  {...register('name')}
                  placeholder="e.g. John Doe"
                  className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
                {errors.name && (
                  <p className="text-rose-500 text-[10px] mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    License Number
                  </label>
                  <input
                    {...register('licenseNumber')}
                    placeholder="e.g. LIC-99882"
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  {errors.licenseNumber && (
                    <p className="text-rose-500 text-[10px] mt-1">
                      {errors.licenseNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    License Category
                  </label>
                  <input
                    {...register('licenseCategory')}
                    placeholder="e.g. Class A"
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  {errors.licenseCategory && (
                    <p className="text-rose-500 text-[10px] mt-1">
                      {errors.licenseCategory.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    License Expiry Date
                  </label>
                  <input
                    {...register('licenseExpiryDate')}
                    type="date"
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  {errors.licenseExpiryDate && (
                    <p className="text-rose-500 text-[10px] mt-1">
                      {errors.licenseExpiryDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Contact Number
                  </label>
                  <input
                    {...register('contactNumber')}
                    placeholder="e.g. +1-555-9090"
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  {errors.contactNumber && (
                    <p className="text-rose-500 text-[10px] mt-1">
                      {errors.contactNumber.message}
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
                  {createMutation.isPending ? 'Saving...' : 'Save Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
