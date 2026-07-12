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

const allowedOrigins = new Set<string>(
  (process.env.FRONTEND_URL ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
);

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server calls (no origin header)
      if (!origin) return callback(null, true);

      // Exact match against the allow-list
      if (allowedOrigins.has(origin)) return callback(null, true);

      // Allow any Vercel preview deployment for this project
      if (/^https:\/\/transit-ops-odoo[a-z0-9-]*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      // Allow localhost for local dev
      if (/^http:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      callback(new Error(`CORS: origin '${origin}' is not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json());

// ── Health check (no auth required) ─────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

import { prisma } from './lib/prisma';
import { authenticate } from './middleware/auth.middleware';
import { asyncHandler } from './utils/async-handler';

// ── API routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',        authRouter);
app.use('/api/vehicles',    vehicleRouter);
app.use('/api/drivers',     driverRouter);
app.use('/api/trips',       tripRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/fuel',        fuelExpenseRouter);
app.use('/api/reports',     reportsRouter);

// Locations and Vendors lookups removed as scope creep

// ── Centralized error handler (must be last) ─────────────────────────────────
app.use(errorMiddleware);

export default app;
