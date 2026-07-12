/**
 * Mappers: Translate backend (PostgreSQL/Prisma) models into
 * the frontend UI types defined in transit-data.ts.
 *
 * Backend status enums are UPPERCASE (AVAILABLE, ON_TRIP, IN_SHOP, RETIRED)
 * Frontend types use lowercase (available, active, maintenance, idle, offline)
 */

import type {
  Vehicle,
  Driver,
  Trip,
  MaintenanceRecord,
  Expense,
} from "./transit-data";

// ─── Vehicle ────────────────────────────────────────────────────────────────

function mapVehicleStatus(
  dbStatus: string
): Vehicle["status"] {
  const map: Record<string, Vehicle["status"]> = {
    AVAILABLE: "available",
    ON_TRIP: "active",
    IN_SHOP: "maintenance",
    RETIRED: "offline",
  };
  return map[dbStatus] ?? "idle";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapVehicle(v: any): Vehicle {
  return {
    id: v.id,
    plate: v.registrationNumber,
    model: v.name,
    type: v.type as Vehicle["type"],
    status: mapVehicleStatus(v.status),
    driverId: null, // resolved separately via trip assignments
    location: v.region ?? "Unknown",
    fuelPct: 0, // not yet tracked in backend schema
    odometer: v.odometer ?? 0,
    lastService: v.updatedAt?.split("T")[0] ?? "",
    nextService: "",
    utilization: v.status === "ON_TRIP" ? 85 : 0,
    vin: v.registrationNumber,
  };
}

// ─── Driver ─────────────────────────────────────────────────────────────────

function mapDriverStatus(dbStatus: string): Driver["status"] {
  const map: Record<string, Driver["status"]> = {
    AVAILABLE: "available",
    ON_TRIP: "on_duty",
    OFF_DUTY: "off_duty",
    SUSPENDED: "on_leave",
  };
  return map[dbStatus] ?? "off_duty";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapDriver(d: any): Driver {
  const initials = (d.name as string)
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    id: d.id,
    name: d.name,
    initials,
    license: d.licenseNumber,
    status: mapDriverStatus(d.status),
    hoursThisWeek: 0, // not tracked in backend schema
    tripsCompleted: d._count?.trips ?? 0,
    rating: d.safetyScore / 20, // convert 0-100 safety score to 0-5 rating
    licenseExpiry: d.licenseExpiryDate?.split("T")[0] ?? "",
    phone: d.contactNumber,
    homeBase: "",
    assignedVehicleId: null,
  };
}

// ─── Trip ────────────────────────────────────────────────────────────────────

function mapTripStatus(dbStatus: string): Trip["status"] {
  const map: Record<string, Trip["status"]> = {
    DRAFT: "scheduled",
    DISPATCHED: "in_transit",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
  };
  return map[dbStatus] ?? "scheduled";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapTrip(t: any): Trip {
  const origin = t.source ?? "Unknown";
  const destination = t.destination ?? "Unknown";
  return {
    id: t.id,
    route: `${origin} → ${destination}`,
    origin,
    destination,
    vehicleId: t.vehicleId,
    driverId: t.driverId,
    status: mapTripStatus(t.status),
    departure: t.dispatchedAt ?? t.createdAt,
    eta: t.completedAt ?? "",
    distance: t.actualDistance ?? t.plannedDistance ?? 0,
    cargo: "General Freight",
    weightLb: t.cargoWeight ? t.cargoWeight * 2.205 : 0,
    revenue: Number(t.revenue ?? 0),
    progress:
      t.status === "COMPLETED"
        ? 100
        : t.status === "DISPATCHED"
        ? 50
        : 0,
  };
}

// ─── Maintenance ─────────────────────────────────────────────────────────────

function mapMaintenanceStatus(
  dbStatus: string
): MaintenanceRecord["status"] {
  const map: Record<string, MaintenanceRecord["status"]> = {
    ACTIVE: "in_progress",
    CLOSED: "completed",
  };
  return map[dbStatus] ?? "in_progress";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapMaintenance(m: any): MaintenanceRecord {
  return {
    id: m.id,
    vehicleId: m.vehicleId,
    type: (m.maintenanceType ?? "Preventive") as MaintenanceRecord["type"],
    status: mapMaintenanceStatus(m.status),
    scheduled: m.startedAt?.split("T")[0] ?? "",
    cost: Number(m.cost ?? 0),
    technician: "FleetCare Mechanics",
    description: m.description,
    priority: (m.priority?.toLowerCase() ?? "medium") as MaintenanceRecord["priority"],
  };
}

// ─── Expense ─────────────────────────────────────────────────────────────────

function mapExpenseType(dbType: string): Expense["category"] {
  const map: Record<string, Expense["category"]> = {
    TOLL: "Tolls",
    MAINTENANCE: "Maintenance",
    OTHER: "Other",
  };
  return map[dbType] ?? "Other";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapExpense(e: any): Expense {
  return {
    id: e.id,
    category: mapExpenseType(e.type),
    amount: Number(e.amount ?? 0),
    date: e.date?.split("T")[0] ?? e.createdAt?.split("T")[0] ?? "",
    vendor: e.description ?? "—",
    vehicleId: e.vehicleId ?? null,
    driverId: null,
    status: "approved",
    reference: e.id.slice(0, 8).toUpperCase(),
  };
}

// ─── Fuel Log as Expense ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapFuelLogToExpense(f: any): Expense {
  return {
    id: f.id,
    category: "Fuel",
    amount: Number(f.cost ?? 0),
    date: f.date?.split("T")[0] ?? "",
    vendor: f.fuelStation ?? "Unknown Station",
    vehicleId: f.vehicleId ?? null,
    driverId: null,
    status: "approved",
    reference: f.id.slice(0, 8).toUpperCase(),
  };
}
