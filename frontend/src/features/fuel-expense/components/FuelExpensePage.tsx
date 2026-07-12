import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFuelLogs, useExpenses, useCreateFuelLog, useCreateExpense } from '../hooks';
import { useVehicles } from '../../vehicles/hooks';
import { useVendors } from '../../trips/hooks';
import { useAuthStore } from '../../../store/auth.store';
import { DataTable } from '../../../components/ui/DataTable';

const EXPENSE_TYPES = ['TOLL', 'MAINTENANCE', 'OTHER'] as const;
type ExpenseType = (typeof EXPENSE_TYPES)[number];

// ── Schemas ───────────────────────────────────────────────────────────────────

const fuelLogSchema = z.object({
  vehicleId: z.string().uuid('Please select a vehicle'),
  tripId: z.string().uuid().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  liters: z.coerce.number().positive('Liters must be positive'),
  pricePerLiter: z.coerce.number().positive('Price/L must be positive').optional().or(z.literal('')).transform(v => v === '' ? undefined : v as number | undefined),
  cost: z.coerce.number().positive('Cost must be positive'),
  vendorId: z.string().uuid().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  date: z.string().optional().transform(v => v ? new Date(v).toISOString() : undefined),
});

const expenseSchema = z.object({
  vehicleId: z.string().uuid('Please select a vehicle'),
  tripId: z.string().uuid().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  type: z.enum(EXPENSE_TYPES),
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().optional().transform(v => v ? new Date(v).toISOString() : undefined),
});

type FuelLogForm = z.input<typeof fuelLogSchema>;
type ExpenseForm = z.input<typeof expenseSchema>;

// ── Fuel Logs Tab ─────────────────────────────────────────────────────────────

function FuelTab() {
  const { user } = useAuthStore();
  const canWrite = user?.role === 'FLEET_MANAGER' || user?.role === 'DRIVER';

  const [filterVehicle, setFilterVehicle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: logs = [], isLoading, error } = useFuelLogs(filterVehicle || undefined);
  const { data: allVehiclesData } = useVehicles({ page: 1, limit: 100 });
  const allVehicles: any[] = allVehiclesData?.data ?? [];
  const { data: vendors = [] } = useVendors();
  const createMutation = useCreateFuelLog();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FuelLogForm>({ resolver: zodResolver(fuelLogSchema) });

  const onSubmit = (values: z.output<typeof fuelLogSchema>) => {
    createMutation.mutate(values as any, {
      onSuccess: () => { reset(); setIsModalOpen(false); },
    });
  };

  const columns = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (row: any) => (
        <span className="font-mono text-xs font-semibold text-white">{row.vehicle?.registrationNumber}</span>
      ),
    },
    {
      key: 'vendor',
      header: 'Station',
      render: (row: any) => (
        <span className="text-gray-300 text-xs">{row.vendor?.name ?? '—'}</span>
      ),
    },
    {
      key: 'liters',
      header: 'Liters',
      render: (row: any) => (
        <span className="text-sky-400 font-semibold text-xs">{Number(row.liters ?? 0).toFixed(1)} L</span>
      ),
    },
    {
      key: 'pricePerLiter',
      header: 'Price/L',
      render: (row: any) => (
        <span className="text-gray-400 text-xs">
          {row.pricePerLiter ? `$${Number(row.pricePerLiter).toFixed(2)}` : '—'}
        </span>
      ),
    },
    {
      key: 'cost',
      header: 'Total Cost',
      render: (row: any) => (
        <span className="text-white font-bold text-xs">
          ${Number(row.cost ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'trip',
      header: 'Trip',
      render: (row: any) =>
        row.trip ? (
          <span className="text-gray-400 text-xs font-mono">
            {row.trip.sourceLocation?.name} → {row.trip.destinationLocation?.name}
          </span>
        ) : (
          <span className="text-gray-600 text-xs">—</span>
        ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (row: any) => (
        <span className="text-gray-400 text-xs font-mono">{new Date(row.date).toLocaleDateString()}</span>
      ),
    },
  ];

  const createApiError = createMutation.error as any;
  const createErrorMessage = createApiError?.response?.data?.message || createApiError?.message || null;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <select
          value={filterVehicle}
          onChange={(e) => setFilterVehicle(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
        >
          <option value="">All Vehicles</option>
          {allVehicles.map((v: any) => (
            <option key={v.id} value={v.id}>
              {v.registrationNumber} — {v.name}
            </option>
          ))}
        </select>
        {canWrite && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-brand-500/20"
          >
            + Log Fuel
          </button>
        )}
      </div>

      {error && (
        <p className="text-rose-500 text-sm bg-rose-950/30 border border-rose-900 rounded-lg p-3">
          {(error as any).message || 'Failed to load fuel logs'}
        </p>
      )}

      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        emptyMessage="No fuel logs recorded yet."
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Log Fuel Purchase</h2>
              <button onClick={() => { reset(); createMutation.reset(); setIsModalOpen(false); }} className="text-gray-400 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit(onSubmit as any)} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Vehicle</label>
                <select {...register('vehicleId')} className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors">
                  <option value="">Select a vehicle...</option>
                  {allVehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.registrationNumber} — {v.name}</option>
                  ))}
                </select>
                {errors.vehicleId && <p className="text-rose-500 text-[10px] mt-1">{errors.vehicleId.message}</p>}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Liters</label>
                  <input {...register('liters')} type="number" step="0.1" min="0" placeholder="45.0" className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors" />
                  {errors.liters && <p className="text-rose-500 text-[10px] mt-1">{errors.liters.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Price/L ($)</label>
                  <input {...register('pricePerLiter')} type="number" step="0.01" min="0" placeholder="1.50" className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Total Cost ($)</label>
                  <input {...register('cost')} type="number" step="0.01" min="0" placeholder="67.50" className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors" />
                  {errors.cost && <p className="text-rose-500 text-[10px] mt-1">{errors.cost.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Vendor / Station</label>
                  <select {...register('vendorId')} className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors">
                    <option value="">No vendor</option>
                    {vendors.map((v: any) => (<option key={v.id} value={v.id}>{v.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Date</label>
                  <input {...register('date')} type="date" className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors" />
                </div>
              </div>

              {createErrorMessage && (
                <p className="text-rose-500 text-xs bg-rose-950/30 border border-rose-900 rounded-lg p-3">{createErrorMessage}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { reset(); createMutation.reset(); setIsModalOpen(false); }} className="text-sm font-semibold text-gray-400 hover:text-white px-4 py-2 transition-colors">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-semibold text-sm px-6 py-2 rounded-xl transition-colors">
                  {createMutation.isPending ? 'Saving…' : 'Log Fuel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Expenses Tab ──────────────────────────────────────────────────────────────

function ExpensesTab() {
  const { user } = useAuthStore();
  const canWrite = user?.role === 'FLEET_MANAGER';

  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterType, setFilterType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: expenses = [], isLoading, error } = useExpenses(filterVehicle || undefined);
  const { data: allVehiclesData } = useVehicles({ page: 1, limit: 100 });
  const allVehicles: any[] = allVehiclesData?.data ?? [];
  const createMutation = useCreateExpense();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseForm>({ resolver: zodResolver(expenseSchema) });

  const onSubmit = (values: z.output<typeof expenseSchema>) => {
    createMutation.mutate(values as any, {
      onSuccess: () => { reset(); setIsModalOpen(false); },
    });
  };

  const filteredExpenses = filterType
    ? expenses.filter((e: any) => e.type === filterType)
    : expenses;

  const typeColorMap: Record<string, string> = {
    TOLL: 'text-sky-400',
    MAINTENANCE: 'text-amber-400',
    OTHER: 'text-gray-400',
  };

  const columns = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (row: any) => (
        <span className="font-mono text-xs font-semibold text-white">{row.vehicle?.registrationNumber}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row: any) => (
        <span className={`text-xs font-bold ${typeColorMap[row.type] ?? 'text-gray-400'}`}>{row.type}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row: any) => (
        <span className="text-white font-bold text-xs">
          ${Number(row.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (row: any) => (
        <span className="text-gray-300 text-xs">{row.description}</span>
      ),
    },
    {
      key: 'trip',
      header: 'Trip',
      render: (row: any) =>
        row.trip ? (
          <span className="text-gray-400 text-xs font-mono">
            {row.trip.sourceLocation?.name} → {row.trip.destinationLocation?.name}
          </span>
        ) : (
          <span className="text-gray-600 text-xs">—</span>
        ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (row: any) => (
        <span className="text-gray-400 text-xs font-mono">{new Date(row.date).toLocaleDateString()}</span>
      ),
    },
  ];

  const createApiError = createMutation.error as any;
  const createErrorMessage = createApiError?.response?.data?.message || createApiError?.message || null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-3">
          <select
            value={filterVehicle}
            onChange={(e) => setFilterVehicle(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
          >
            <option value="">All Vehicles</option>
            {allVehicles.map((v: any) => (
              <option key={v.id} value={v.id}>{v.registrationNumber} — {v.name}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
          >
            <option value="">All Types</option>
            {EXPENSE_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>
        {canWrite && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-brand-500/20"
          >
            + Log Expense
          </button>
        )}
      </div>

      {error && (
        <p className="text-rose-500 text-sm bg-rose-950/30 border border-rose-900 rounded-lg p-3">
          {(error as any).message || 'Failed to load expenses'}
        </p>
      )}

      <DataTable
        columns={columns}
        data={filteredExpenses}
        isLoading={isLoading}
        emptyMessage="No expenses recorded yet."
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Log Operational Expense</h2>
              <button onClick={() => { reset(); createMutation.reset(); setIsModalOpen(false); }} className="text-gray-400 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit(onSubmit as any)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Vehicle</label>
                  <select {...register('vehicleId')} className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors">
                    <option value="">Select a vehicle...</option>
                    {allVehicles.map((v: any) => (<option key={v.id} value={v.id}>{v.registrationNumber} — {v.name}</option>))}
                  </select>
                  {errors.vehicleId && <p className="text-rose-500 text-[10px] mt-1">{errors.vehicleId.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Expense Type</label>
                  <select {...register('type')} className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors">
                    {EXPENSE_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                  {errors.type && <p className="text-rose-500 text-[10px] mt-1">{errors.type.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Amount ($)</label>
                  <input {...register('amount')} type="number" step="0.01" min="0" placeholder="25.00" className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors" />
                  {errors.amount && <p className="text-rose-500 text-[10px] mt-1">{errors.amount.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Date</label>
                  <input {...register('date')} type="date" className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Description</label>
                <input {...register('description')} placeholder="e.g. Highway toll — Route 66" className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors" />
                {errors.description && <p className="text-rose-500 text-[10px] mt-1">{errors.description.message}</p>}
              </div>

              {createErrorMessage && (
                <p className="text-rose-500 text-xs bg-rose-950/30 border border-rose-900 rounded-lg p-3">{createErrorMessage}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { reset(); createMutation.reset(); setIsModalOpen(false); }} className="text-sm font-semibold text-gray-400 hover:text-white px-4 py-2 transition-colors">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-semibold text-sm px-6 py-2 rounded-xl transition-colors">
                  {createMutation.isPending ? 'Saving…' : 'Log Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page shell ────────────────────────────────────────────────────────────────

type Tab = 'fuel' | 'expenses';

export function FuelExpensePage() {
  const [tab, setTab] = useState<Tab>('fuel');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Fuel & Expenses</h1>
        <p className="text-gray-400 text-sm mt-1">Track fuel purchases and operational costs across the fleet.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-900/60 border border-gray-800 p-1 rounded-xl w-fit">
        {(['fuel', 'expenses'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t === 'fuel' ? '⛽ Fuel Logs' : '🧾 Expenses'}
          </button>
        ))}
      </div>

      {tab === 'fuel' ? <FuelTab /> : <ExpensesTab />}
    </div>
  );
}
