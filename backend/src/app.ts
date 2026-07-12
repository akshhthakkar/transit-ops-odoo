import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorMiddleware } from './middleware/error.middleware';

// Module routers
import { authRouter }        from './modules/auth/auth.routes';
import { vehicleRouter }     from './modules/vehicles/vehicle.routes';
import { driverRouter }      from './modules/drivers/driver.routes';
import { tripRouter }        from './modules/trips/trip.routes';
import { maintenanceRouter } from './modules/maintenance/maintenance.routes';
import { fuelExpenseRouter } from './modules/fuel-expense/fuel-expense.routes';
import { reportsRouter }     from './modules/reports/reports.routes';

const app = express();

// ── Global middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL ?? '*' }));
app.use(express.json());

// ── Health check (no auth required) ─────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',        authRouter);
app.use('/api/vehicles',    vehicleRouter);
app.use('/api/drivers',     driverRouter);
app.use('/api/trips',       tripRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/fuel',        fuelExpenseRouter);
app.use('/api/reports',     reportsRouter);

// ── Centralized error handler (must be last) ─────────────────────────────────
app.use(errorMiddleware);

export default app;
