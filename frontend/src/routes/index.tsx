import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { AppShell } from '../components/layout/AppShell';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';

// Pages
import HomePage from '../pages/home/HomePage';
import { LoginPage }       from '../features/auth/components/LoginPage';
import { DashboardPage }   from '../features/dashboard/components/DashboardPage';
import { VehiclesPage }    from '../features/vehicles/components/VehiclesPage';
import { VehicleDetailPage } from '../features/vehicles/components/VehicleDetailPage';
import { DriversPage }     from '../features/drivers/components/DriversPage';
import { DriverDetailPage } from '../features/drivers/components/DriverDetailPage';
import { TripsPage }       from '../features/trips/components/TripsPage';
import { TripDetailPage }  from '../features/trips/components/TripDetailPage';
import { MaintenancePage } from '../features/maintenance/components/MaintenancePage';
import { FuelExpensePage } from '../features/fuel-expense/components/FuelExpensePage';
import { ReportsPage }     from '../features/reports/components/ReportsPage';

export function AppRoutes() {
  const { token } = useAuthStore();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      {/* Protected — wrapped in AppShell (sidebar + navbar) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard"   element={<DashboardPage />} />
          <Route path="/vehicles"    element={<VehiclesPage />} />
          <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
          <Route path="/drivers"     element={<DriversPage />} />
          <Route path="/drivers/:id" element={<DriverDetailPage />} />
          <Route path="/trips"       element={<TripsPage />} />
          <Route path="/trips/:id"    element={<TripDetailPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/fuel"        element={<FuelExpensePage />} />
          <Route path="/reports"     element={<ReportsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}
