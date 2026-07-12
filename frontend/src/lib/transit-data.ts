// TransitOps — domain types & realistic operational data.
// All figures are illustrative but internally consistent (a mid-size regional fleet).

export type VehicleStatus =
  | "active"
  | "available"
  | "maintenance"
  | "idle"
  | "offline";

export type VehicleType =
  | "Tractor"
  | "Box Truck"
  | "Reefer"
  | "Flatbed"
  | "Sprinter Van"
  | "Straight Truck";

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  type: VehicleType;
  status: VehicleStatus;
  driverId: string | null;
  location: string;
  fuelPct: number;
  odometer: number;
  lastService: string; // ISO date
  nextService: string; // ISO date
  utilization: number; // 0-100
  vin: string;
}

export type DriverStatus = "on_duty" | "off_duty" | "on_leave" | "available";

export interface Driver {
  id: string;
  name: string;
  initials: string;
  license: string;
  status: DriverStatus;
  hoursThisWeek: number;
  tripsCompleted: number;
  rating: number;
  licenseExpiry: string;
  phone: string;
  homeBase: string;
  assignedVehicleId: string | null;
}

export type TripStatus =
  | "in_transit"
  | "loading"
  | "scheduled"
  | "completed"
  | "delayed"
  | "cancelled";

export interface Trip {
  id: string;
  route: string;
  origin: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  status: TripStatus;
  departure: string; // ISO
  eta: string; // ISO
  distance: number; // miles
  cargo: string;
  weightLb: number;
  revenue: number;
  progress: number; // 0-100
}

export type MaintenanceStatus = "scheduled" | "in_progress" | "overdue" | "completed";
export type MaintenanceType =
  | "Preventive"
  | "Oil Change"
  | "Tire Rotation"
  | "Brake Service"
  | "Inspection"
  | "Engine Repair"
  | "Transmission"
  | "Reefer Unit";

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  scheduled: string;
  cost: number;
  technician: string;
  description: string;
  priority: "low" | "medium" | "high";
}

export type ExpenseCategory =
  | "Fuel"
  | "Maintenance"
  | "Tolls"
  | "Driver Pay"
  | "Insurance"
  | "Parts"
  | "Permits"
  | "Other";

export type ExpenseStatus = "approved" | "pending" | "rejected" | "reimbursed";

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  vendor: string;
  vehicleId: string | null;
  driverId: string | null;
  status: ExpenseStatus;
  reference: string;
}

export type AlertSeverity = "critical" | "warning" | "info";
export type AlertType =
  | "Maintenance Due"
  | "License Expiring"
  | "Fuel Low"
  | "HOS Violation"
  | "Geofence Breach"
  | "Engine Fault"
  | "Tire Pressure"
  | "Route Deviation";

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  ref: string; // vehicle plate or driver name
  message: string;
  time: string; // relative label
  acknowledged: boolean;
}

// ---------------------------------------------------------------------------
// Drivers
// ---------------------------------------------------------------------------
export const drivers: Driver[] = [
  { id: "DRV-001", name: "Marcus Holloway", initials: "MH", license: "CDL-A TX119872", status: "on_duty", hoursThisWeek: 52, tripsCompleted: 184, rating: 4.8, licenseExpiry: "2026-03-14", phone: "+1 (214) 555-0182", homeBase: "Dallas, TX", assignedVehicleId: "VEH-1001" },
  { id: "DRV-002", name: "Elena Vasquez", initials: "EV", license: "CDL-A CA882104", status: "on_duty", hoursThisWeek: 48, tripsCompleted: 211, rating: 4.9, licenseExpiry: "2025-11-02", phone: "+1 (323) 555-0119", homeBase: "Los Angeles, CA", assignedVehicleId: "VEH-1002" },
  { id: "DRV-003", name: "James O'Connor", initials: "JO", license: "CDL-A IL449201", status: "off_duty", hoursThisWeek: 41, tripsCompleted: 156, rating: 4.6, licenseExpiry: "2026-07-22", phone: "+1 (312) 555-0144", homeBase: "Chicago, IL", assignedVehicleId: "VEH-1003" },
  { id: "DRV-004", name: "Priya Nair", initials: "PN", license: "CDL-A GA330871", status: "on_duty", hoursThisWeek: 56, tripsCompleted: 198, rating: 4.7, licenseExpiry: "2025-09-30", phone: "+1 (404) 555-0167", homeBase: "Atlanta, GA", assignedVehicleId: "VEH-1004" },
  { id: "DRV-005", name: "Daniel Kim", initials: "DK", license: "CDL-A WA661234", status: "available", hoursThisWeek: 38, tripsCompleted: 142, rating: 4.5, licenseExpiry: "2026-01-18", phone: "+1 (206) 555-0123", homeBase: "Seattle, WA", assignedVehicleId: "VEH-1005" },
  { id: "DRV-006", name: "Sofia Romano", initials: "SR", license: "CDL-A FL778510", status: "on_duty", hoursThisWeek: 49, tripsCompleted: 203, rating: 4.8, licenseExpiry: "2025-12-08", phone: "+1 (305) 555-0190", homeBase: "Miami, FL", assignedVehicleId: "VEH-1006" },
  { id: "DRV-007", name: "Andre Bennett", initials: "AB", license: "CDL-A OH221988", status: "on_leave", hoursThisWeek: 0, tripsCompleted: 167, rating: 4.4, licenseExpiry: "2026-05-30", phone: "+1 (614) 555-0156", homeBase: "Columbus, OH", assignedVehicleId: null },
  { id: "DRV-008", name: "Mei Lin", initials: "ML", license: "CDL-A NY554021", status: "on_duty", hoursThisWeek: 51, tripsCompleted: 189, rating: 4.9, licenseExpiry: "2026-02-11", phone: "+1 (212) 555-0178", homeBase: "Newark, NJ", assignedVehicleId: "VEH-1007" },
  { id: "DRV-009", name: "Carlos Mendez", initials: "CM", license: "CDL-A AZ339876", status: "available", hoursThisWeek: 35, tripsCompleted: 131, rating: 4.6, licenseExpiry: "2025-10-25", phone: "+1 (602) 555-0134", homeBase: "Phoenix, AZ", assignedVehicleId: "VEH-1008" },
  { id: "DRV-010", name: "Rachel Schmidt", initials: "RS", license: "CDL-A CO712455", status: "off_duty", hoursThisWeek: 44, tripsCompleted: 175, rating: 4.7, licenseExpiry: "2026-08-19", phone: "+1 (303) 555-0145", homeBase: "Denver, CO", assignedVehicleId: "VEH-1009" },
  { id: "DRV-011", name: "Tyrone Walker", initials: "TW", license: "CDL-A NC884630", status: "on_duty", hoursThisWeek: 53, tripsCompleted: 162, rating: 4.5, licenseExpiry: "2025-09-12", phone: "+1 (704) 555-0198", homeBase: "Charlotte, NC", assignedVehicleId: "VEH-1010" },
  { id: "DRV-012", name: "Hannah Brooks", initials: "HB", license: "CDL-A MN225718", status: "available", hoursThisWeek: 39, tripsCompleted: 148, rating: 4.8, licenseExpiry: "2026-04-03", phone: "+1 (612) 555-0162", homeBase: "Minneapolis, MN", assignedVehicleId: "VEH-1011" },
  { id: "DRV-013", name: "Omar Haddad", initials: "OH", license: "CDL-A MI661904", status: "on_duty", hoursThisWeek: 50, tripsCompleted: 177, rating: 4.6, licenseExpiry: "2025-11-28", phone: "+1 (313) 555-0171", homeBase: "Detroit, MI", assignedVehicleId: "VEH-1012" },
  { id: "DRV-014", name: "Grace Sullivan", initials: "GS", license: "CDL-A OR447882", status: "off_duty", hoursThisWeek: 42, tripsCompleted: 154, rating: 4.7, licenseExpiry: "2026-06-14", phone: "+1 (503) 555-0185", homeBase: "Portland, OR", assignedVehicleId: "VEH-1013" },
];

// ---------------------------------------------------------------------------
// Vehicles
// ---------------------------------------------------------------------------
export const vehicles: Vehicle[] = [
  { id: "VEH-1001", plate: "TX-7841", model: "Volvo VNL 760", type: "Tractor", status: "active", driverId: "DRV-001", location: "I-45 N, near Corsicana, TX", fuelPct: 64, odometer: 412880, lastService: "2025-07-12", nextService: "2025-10-10", utilization: 91, vin: "4V4NC9EH8PN112341" },
  { id: "VEH-1002", plate: "CA-4129", model: "Freightliner Cascadia", type: "Tractor", status: "active", driverId: "DRV-002", location: "I-10 E, near Indio, CA", fuelPct: 38, odometer: 388210, lastService: "2025-06-28", nextService: "2025-09-28", utilization: 88, vin: "5UJAAAN03PLAA4129" },
  { id: "VEH-1003", plate: "IL-9920", model: "Kenworth T680", type: "Tractor", status: "available", driverId: null, location: "Yard — Chicago Terminal", fuelPct: 92, odometer: 521440, lastService: "2025-08-02", nextService: "2025-11-02", utilization: 74, vin: "1XKYD49X5PJ339920" },
  { id: "VEH-1004", plate: "GA-3382", model: "Peterbilt 579", type: "Tractor", status: "active", driverId: "DRV-004", location: "I-85 N, near Greenville, SC", fuelPct: 71, odometer: 297610, lastService: "2025-07-20", nextService: "2025-10-20", utilization: 85, vin: "1XPBDP9X6ND338271" },
  { id: "VEH-1005", plate: "WA-6614", model: "International LT", type: "Tractor", status: "idle", driverId: null, location: "Yard — Seattle Terminal", fuelPct: 80, odometer: 455090, lastService: "2025-05-14", nextService: "2025-08-14", utilization: 62, vin: "3HSDZAPR0PN661402" },
  { id: "VEH-1006", plate: "FL-2287", model: "Mack Anthem", type: "Tractor", status: "active", driverId: "DRV-006", location: "I-95 N, near Daytona, FL", fuelPct: 45, odometer: 368770, lastService: "2025-07-05", nextService: "2025-10-05", utilization: 83, vin: "1M1AN07Y7PM228710" },
  { id: "VEH-1007", plate: "NJ-5540", model: "Volvo VNR 400", type: "Straight Truck", status: "active", driverId: "DRV-008", location: "I-95 S, near Trenton, NJ", fuelPct: 58, odometer: 211340, lastService: "2025-08-10", nextService: "2025-11-10", utilization: 79, vin: "4V5KC9GG0PN554019" },
  { id: "VEH-1008", plate: "AZ-3398", model: "Freightliner M2 106", type: "Box Truck", status: "available", driverId: null, location: "Yard — Phoenix Terminal", fuelPct: 88, odometer: 178220, lastService: "2025-07-18", nextService: "2025-10-18", utilization: 68, vin: "1FVACWDT0RHAA3398" },
  { id: "VEH-1009", plate: "CO-7124", model: "Kenworth T370", type: "Reefer", status: "maintenance", driverId: null, location: "Shop — Denver Service Bay 2", fuelPct: 12, odometer: 309110, lastService: "2025-08-22", nextService: "2025-09-05", utilization: 0, vin: "2NKHHM7X3RM712455" },
  { id: "VEH-1010", plate: "NC-8846", model: "Peterbilt 389", type: "Tractor", status: "active", driverId: "DRV-011", location: "I-77 S, near Charlotte, NC", fuelPct: 67, odometer: 488930, lastService: "2025-06-30", nextService: "2025-09-30", utilization: 90, vin: "1XPDP49X0ND884630" },
  { id: "VEH-1011", plate: "MN-2257", model: "Ford Transit 350", type: "Sprinter Van", status: "available", driverId: null, location: "Yard — Minneapolis Terminal", fuelPct: 95, odometer: 94210, lastService: "2025-07-25", nextService: "2025-10-25", utilization: 55, vin: "1FTBR1X80PKA22571" },
  { id: "VEH-1012", plate: "MI-6619", model: "Freightliner Cascadia", type: "Tractor", status: "active", driverId: "DRV-013", location: "I-94 W, near Ann Arbor, MI", fuelPct: 33, odometer: 401550, lastService: "2025-07-08", nextService: "2025-10-08", utilization: 87, vin: "5UJAAAN05PM661904" },
  { id: "VEH-1013", plate: "OR-4478", model: "Isuzu NRR", type: "Box Truck", status: "idle", driverId: null, location: "Yard — Portland Terminal", fuelPct: 76, odometer: 142880, lastService: "2025-06-15", nextService: "2025-09-15", utilization: 48, vin: "JALC4V165P7447882" },
  { id: "VEH-1014", plate: "TX-7720", model: "Great Dane Reefer", type: "Reefer", status: "maintenance", driverId: null, location: "Shop — Dallas Service Bay 1", fuelPct: 24, odometer: 267440, lastService: "2025-08-18", nextService: "2025-09-02", utilization: 0, vin: "1GRAA0627PJ772010" },
  { id: "VEH-1015", plate: "GA-3301", model: "Hino 268", type: "Straight Truck", status: "offline", driverId: null, location: "Yard — Atlanta Terminal (Decommissioned)", fuelPct: 0, odometer: 612300, lastService: "2025-04-02", nextService: "2025-07-02", utilization: 0, vin: "5PVNU8UG5LP330102" },
  { id: "VEH-1016", plate: "CA-4190", model: "Utility 3000R Flatbed", type: "Flatbed", status: "available", driverId: null, location: "Yard — Los Angeles Terminal", fuelPct: 84, odometer: 198770, lastService: "2025-07-30", nextService: "2025-10-30", utilization: 61, vin: "4JBNA1A05PR419002" },
  { id: "VEH-1017", plate: "NY-6612", model: "Mercedes Sprinter 2500", type: "Sprinter Van", status: "active", driverId: "DRV-014", location: "I-95 N, near New Haven, CT", fuelPct: 51, odometer: 87660, lastService: "2025-08-05", nextService: "2025-11-05", utilization: 72, vin: "WDYPE7ED1PP661205" },
  { id: "VEH-1018", plate: "TX-7855", model: "Volvo VNL 760", type: "Tractor", status: "active", driverId: "DRV-005", location: "I-35 S, near Waco, TX", fuelPct: 60, odometer: 355120, lastService: "2025-07-15", nextService: "2025-10-15", utilization: 86, vin: "4V4NC9EH1PN785501" },
];

// ---------------------------------------------------------------------------
// Trips
// ---------------------------------------------------------------------------
export const trips: Trip[] = [
  { id: "TRP-4821", route: "Dallas, TX → Houston, TX", origin: "Dallas, TX", destination: "Houston, TX", vehicleId: "VEH-1001", driverId: "DRV-001", status: "in_transit", departure: "2025-09-04T06:00:00", eta: "2025-09-04T10:30:00", distance: 239, cargo: "General Freight", weightLb: 42000, revenue: 2850, progress: 62 },
  { id: "TRP-4822", route: "Los Angeles, CA → Phoenix, AZ", origin: "Los Angeles, CA", destination: "Phoenix, AZ", vehicleId: "VEH-1002", driverId: "DRV-002", status: "in_transit", departure: "2025-09-04T04:30:00", eta: "2025-09-04T11:45:00", distance: 372, cargo: "Electronics", weightLb: 38500, revenue: 4100, progress: 48 },
  { id: "TRP-4823", route: "Atlanta, GA → Charlotte, NC", origin: "Atlanta, GA", destination: "Charlotte, NC", vehicleId: "VEH-1004", driverId: "DRV-004", status: "in_transit", departure: "2025-09-04T05:15:00", eta: "2025-09-04T11:00:00", distance: 244, cargo: "Auto Parts", weightLb: 41000, revenue: 2950, progress: 71 },
  { id: "TRP-4824", route: "Miami, FL → Jacksonville, FL", origin: "Miami, FL", destination: "Jacksonville, FL", vehicleId: "VEH-1006", driverId: "DRV-006", status: "delayed", departure: "2025-09-04T03:00:00", eta: "2025-09-04T12:30:00", distance: 347, cargo: "Refrigerated Goods", weightLb: 39800, revenue: 3650, progress: 54 },
  { id: "TRP-4825", route: "Newark, NJ → Boston, MA", origin: "Newark, NJ", destination: "Boston, MA", vehicleId: "VEH-1007", driverId: "DRV-008", status: "in_transit", departure: "2025-09-04T05:45:00", eta: "2025-09-04T11:30:00", distance: 215, cargo: "Retail Goods", weightLb: 22500, revenue: 2200, progress: 38 },
  { id: "TRP-4826", route: "Charlotte, NC → Atlanta, GA", origin: "Charlotte, NC", destination: "Atlanta, GA", vehicleId: "VEH-1010", driverId: "DRV-011", status: "in_transit", departure: "2025-09-04T06:30:00", eta: "2025-09-04T12:15:00", distance: 244, cargo: "Construction Materials", weightLb: 44500, revenue: 2780, progress: 45 },
  { id: "TRP-4827", route: "Detroit, MI → Chicago, IL", origin: "Detroit, MI", destination: "Chicago, IL", vehicleId: "VEH-1012", driverId: "DRV-013", status: "in_transit", departure: "2025-09-04T07:00:00", eta: "2025-09-04T12:00:00", distance: 283, cargo: "Auto Parts", weightLb: 40200, revenue: 2600, progress: 33 },
  { id: "TRP-4828", route: "Portland, OR → Seattle, WA", origin: "Portland, OR", destination: "Seattle, WA", vehicleId: "VEH-1017", driverId: "DRV-014", status: "in_transit", departure: "2025-09-04T08:00:00", eta: "2025-09-04T12:30:00", distance: 174, cargo: "Retail Goods", weightLb: 18900, revenue: 1850, progress: 22 },
  { id: "TRP-4829", route: "Waco, TX → San Antonio, TX", origin: "Waco, TX", destination: "San Antonio, TX", vehicleId: "VEH-1018", driverId: "DRV-005", status: "in_transit", departure: "2025-09-04T06:15:00", eta: "2025-09-04T09:45:00", distance: 181, cargo: "General Freight", weightLb: 41500, revenue: 2100, progress: 68 },
  { id: "TRP-4830", route: "Phoenix, AZ → Tucson, AZ", origin: "Phoenix, AZ", destination: "Tucson, AZ", vehicleId: "VEH-1008", driverId: "DRV-009", status: "loading", departure: "2025-09-04T09:30:00", eta: "2025-09-04T12:00:00", distance: 113, cargo: "Retail Goods", weightLb: 24800, revenue: 1450, progress: 5 },
  { id: "TRP-4831", route: "Minneapolis, MN → Milwaukee, WI", origin: "Minneapolis, MN", destination: "Milwaukee, WI", vehicleId: "VEH-1011", driverId: "DRV-012", status: "scheduled", departure: "2025-09-04T14:00:00", eta: "2025-09-04T20:00:00", distance: 337, cargo: "Retail Goods", weightLb: 19200, revenue: 2400, progress: 0 },
  { id: "TRP-4832", route: "Los Angeles, CA → Las Vegas, NV", origin: "Los Angeles, CA", destination: "Las Vegas, NV", vehicleId: "VEH-1016", driverId: "DRV-009", status: "scheduled", departure: "2025-09-04T13:30:00", eta: "2025-09-04T17:30:00", distance: 270, cargo: "Construction Materials", weightLb: 38800, revenue: 2650, progress: 0 },
  { id: "TRP-4833", route: "Dallas, TX → Oklahoma City, OK", origin: "Dallas, TX", destination: "Oklahoma City, OK", vehicleId: "VEH-1001", driverId: "DRV-001", status: "scheduled", departure: "2025-09-04T15:00:00", eta: "2025-09-04T19:30:00", distance: 205, cargo: "General Freight", weightLb: 43000, revenue: 2350, progress: 0 },
  { id: "TRP-4810", route: "Chicago, IL → St. Louis, MO", origin: "Chicago, IL", destination: "St. Louis, MO", vehicleId: "VEH-1003", driverId: "DRV-003", status: "completed", departure: "2025-09-03T05:00:00", eta: "2025-09-03T11:20:00", distance: 297, cargo: "General Freight", weightLb: 42500, revenue: 2700, progress: 100 },
  { id: "TRP-4811", route: "Houston, TX → New Orleans, LA", origin: "Houston, TX", destination: "New Orleans, LA", vehicleId: "VEH-1001", driverId: "DRV-001", status: "completed", departure: "2025-09-03T06:00:00", eta: "2025-09-03T11:00:00", distance: 348, cargo: "Refrigerated Goods", weightLb: 40100, revenue: 3450, progress: 100 },
  { id: "TRP-4812", route: "Seattle, WA → Portland, OR", origin: "Seattle, WA", destination: "Portland, OR", vehicleId: "VEH-1005", driverId: "DRV-010", status: "completed", departure: "2025-09-03T07:30:00", eta: "2025-09-03T11:00:00", distance: 174, cargo: "Electronics", weightLb: 20800, revenue: 1950, progress: 100 },
  { id: "TRP-4813", route: "Denver, CO → Salt Lake City, UT", origin: "Denver, CO", destination: "Salt Lake City, UT", vehicleId: "VEH-1009", driverId: "DRV-010", status: "completed", departure: "2025-09-02T05:00:00", eta: "2025-09-02T14:00:00", distance: 524, cargo: "Construction Materials", weightLb: 43800, revenue: 4800, progress: 100 },
  { id: "TRP-4814", route: "Atlanta, GA → Nashville, TN", origin: "Atlanta, GA", destination: "Nashville, TN", vehicleId: "VEH-1004", driverId: "DRV-004", status: "completed", departure: "2025-09-03T06:00:00", eta: "2025-09-03T11:30:00", distance: 250, cargo: "Auto Parts", weightLb: 41200, revenue: 2650, progress: 100 },
  { id: "TRP-4815", route: "Newark, NJ → Philadelphia, PA", origin: "Newark, NJ", destination: "Philadelphia, PA", vehicleId: "VEH-1007", driverId: "DRV-008", status: "completed", departure: "2025-09-03T08:00:00", eta: "2025-09-03T10:00:00", distance: 81, cargo: "Retail Goods", weightLb: 16700, revenue: 1100, progress: 100 },
  { id: "TRP-4816", route: "Phoenix, AZ → Albuquerque, NM", origin: "Phoenix, AZ", destination: "Albuquerque, NM", vehicleId: "VEH-1008", driverId: "DRV-009", status: "completed", departure: "2025-09-03T05:30:00", eta: "2025-09-03T13:00:00", distance: 421, cargo: "Retail Goods", weightLb: 25400, revenue: 3200, progress: 100 },
  { id: "TRP-4817", route: "Miami, FL → Orlando, FL", origin: "Miami, FL", destination: "Orlando, FL", vehicleId: "VEH-1006", driverId: "DRV-006", status: "completed", departure: "2025-09-03T06:30:00", eta: "2025-09-03T10:00:00", distance: 234, cargo: "Refrigerated Goods", weightLb: 39900, revenue: 2300, progress: 100 },
  { id: "TRP-4818", route: "Detroit, MI → Cleveland, OH", origin: "Detroit, MI", destination: "Cleveland, OH", vehicleId: "VEH-1012", driverId: "DRV-013", status: "completed", departure: "2025-09-03T07:00:00", eta: "2025-09-03T10:30:00", distance: 169, cargo: "Auto Parts", weightLb: 39600, revenue: 1750, progress: 100 },
  { id: "TRP-4801", route: "Dallas, TX → El Paso, TX", origin: "Dallas, TX", destination: "El Paso, TX", vehicleId: "VEH-1018", driverId: "DRV-005", status: "completed", departure: "2025-09-02T04:30:00", eta: "2025-09-02T15:30:00", distance: 634, cargo: "General Freight", weightLb: 42800, revenue: 5200, progress: 100 },
  { id: "TRP-4802", route: "Chicago, IL → Indianapolis, IN", origin: "Chicago, IL", destination: "Indianapolis, IN", vehicleId: "VEH-1003", driverId: "DRV-003", status: "completed", departure: "2025-09-01T06:00:00", eta: "2025-09-01T11:00:00", distance: 182, cargo: "General Freight", weightLb: 43100, revenue: 1900, progress: 100 },
  { id: "TRP-4799", route: "Los Angeles, CA → San Diego, CA", origin: "Los Angeles, CA", destination: "San Diego, CA", vehicleId: "VEH-1002", driverId: "DRV-002", status: "cancelled", departure: "2025-09-02T09:00:00", eta: "2025-09-02T11:30:00", distance: 120, cargo: "Electronics", weightLb: 19500, revenue: 0, progress: 0 },
  { id: "TRP-4805", route: "Atlanta, GA → Jacksonville, FL", origin: "Atlanta, GA", destination: "Jacksonville, FL", vehicleId: "VEH-1004", driverId: "DRV-004", status: "delayed", departure: "2025-09-02T05:30:00", eta: "2025-09-02T13:45:00", distance: 346, cargo: "Auto Parts", weightLb: 41900, revenue: 3250, progress: 100 },
];

// ---------------------------------------------------------------------------
// Maintenance
// ---------------------------------------------------------------------------
export const maintenance: MaintenanceRecord[] = [
  { id: "MNT-3201", vehicleId: "VEH-1009", type: "Engine Repair", status: "in_progress", scheduled: "2025-09-04", cost: 4250, technician: "R. Alvarez", description: "Turbocharger replacement — boost pressure below spec", priority: "high" },
  { id: "MNT-3202", vehicleId: "VEH-1014", type: "Reefer Unit", status: "in_progress", scheduled: "2025-09-04", cost: 2180, technician: "L. Park", description: "Reefer compressor service + refrigerant recharge", priority: "high" },
  { id: "MNT-3203", vehicleId: "VEH-1005", type: "Inspection", status: "overdue", scheduled: "2025-08-14", cost: 320, technician: "Unassigned", description: "DOT annual inspection overdue — schedule immediately", priority: "high" },
  { id: "MNT-3204", vehicleId: "VEH-1015", type: "Engine Repair", status: "overdue", scheduled: "2025-07-02", cost: 6800, technician: "Unassigned", description: "Decommissioning evaluation — engine failure assessment", priority: "medium" },
  { id: "MNT-3205", vehicleId: "VEH-1002", type: "Oil Change", status: "scheduled", scheduled: "2025-09-28", cost: 410, technician: "M. Singh", description: "Scheduled oil change + filter replacement at 388,500 mi", priority: "low" },
  { id: "MNT-3206", vehicleId: "VEH-1001", type: "Tire Rotation", status: "scheduled", scheduled: "2025-10-10", cost: 280, technician: "M. Singh", description: "Tire rotation + tread depth inspection", priority: "low" },
  { id: "MNT-3207", vehicleId: "VEH-1006", type: "Brake Service", status: "scheduled", scheduled: "2025-10-05", cost: 1450, technician: "R. Alvarez", description: "Brake pad replacement — front axle below 3mm", priority: "medium" },
  { id: "MNT-3208", vehicleId: "VEH-1010", type: "Preventive", status: "scheduled", scheduled: "2025-09-30", cost: 690, technician: "L. Park", description: "Preventive maintenance — 50-point inspection", priority: "medium" },
  { id: "MNT-3209", vehicleId: "VEH-1012", type: "Transmission", status: "scheduled", scheduled: "2025-10-08", cost: 3200, technician: "R. Alvarez", description: "Transmission fluid + clutch adjustment", priority: "medium" },
  { id: "MNT-3210", vehicleId: "VEH-1003", type: "Preventive", status: "scheduled", scheduled: "2025-11-02", cost: 720, technician: "M. Singh", description: "Preventive maintenance — 50-point inspection", priority: "low" },
  { id: "MNT-3211", vehicleId: "VEH-1004", type: "Oil Change", status: "scheduled", scheduled: "2025-10-20", cost: 420, technician: "M. Singh", description: "Scheduled oil change + DPF cleaning", priority: "low" },
  { id: "MNT-3212", vehicleId: "VEH-1007", type: "Inspection", status: "scheduled", scheduled: "2025-11-10", cost: 340, technician: "L. Park", description: "DOT quarterly inspection", priority: "low" },
  { id: "MNT-3198", vehicleId: "VEH-1001", type: "Oil Change", status: "completed", scheduled: "2025-07-12", cost: 395, technician: "M. Singh", description: "Oil change + filter replacement", priority: "low" },
  { id: "MNT-3199", vehicleId: "VEH-1004", type: "Tire Rotation", status: "completed", scheduled: "2025-07-20", cost: 270, technician: "L. Park", description: "Tire rotation + alignment check", priority: "low" },
  { id: "MNT-3200", vehicleId: "VEH-1006", type: "Brake Service", status: "completed", scheduled: "2025-07-05", cost: 1380, technician: "R. Alvarez", description: "Rear brake pad replacement", priority: "medium" },
  { id: "MNT-3197", vehicleId: "VEH-1002", type: "Preventive", status: "completed", scheduled: "2025-06-28", cost: 680, technician: "M. Singh", description: "Preventive maintenance — 50-point inspection", priority: "low" },
];

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------
export const expenses: Expense[] = [
  { id: "EXP-9001", category: "Fuel", amount: 4820.50, date: "2025-09-04", vendor: "Pilot Flying J", vehicleId: "VEH-1001", driverId: "DRV-001", status: "approved", reference: "INV-77821" },
  { id: "EXP-9002", category: "Fuel", amount: 3960.00, date: "2025-09-04", vendor: "Love's Travel Stops", vehicleId: "VEH-1002", driverId: "DRV-002", status: "approved", reference: "INV-77822" },
  { id: "EXP-9003", category: "Maintenance", amount: 4250.00, date: "2025-09-04", vendor: "Denver Heavy Duty", vehicleId: "VEH-1009", driverId: null, status: "pending", reference: "MNT-3201" },
  { id: "EXP-9004", category: "Tolls", amount: 184.75, date: "2025-09-04", vendor: "E-ZPass", vehicleId: "VEH-1007", driverId: "DRV-008", status: "pending", reference: "TOLL-4471" },
  { id: "EXP-9005", category: "Driver Pay", amount: 12800.00, date: "2025-09-03", vendor: "Payroll — Week 36", vehicleId: null, driverId: null, status: "approved", reference: "PAY-W36" },
  { id: "EXP-9006", category: "Insurance", amount: 8400.00, date: "2025-09-01", vendor: "Progressive Commercial", vehicleId: null, driverId: null, status: "approved", reference: "INS-Q3" },
  { id: "EXP-9007", category: "Parts", amount: 1180.00, date: "2025-09-03", vendor: "FleetPride", vehicleId: "VEH-1014", driverId: null, status: "pending", reference: "PO-33219" },
  { id: "EXP-9008", category: "Fuel", amount: 3210.40, date: "2025-09-03", vendor: "TA Petro", vehicleId: "VEH-1004", driverId: "DRV-004", status: "approved", reference: "INV-77799" },
  { id: "EXP-9009", category: "Permits", amount: 620.00, date: "2025-09-02", vendor: "DOT Permit Office", vehicleId: null, driverId: null, status: "approved", reference: "PERM-2025" },
  { id: "EXP-9010", category: "Maintenance", amount: 2180.00, date: "2025-09-04", vendor: "Dallas Reefer Service", vehicleId: "VEH-1014", driverId: null, status: "pending", reference: "MNT-3202" },
  { id: "EXP-9011", category: "Tolls", amount: 96.50, date: "2025-09-03", vendor: "SunPass", vehicleId: "VEH-1006", driverId: "DRV-006", status: "reimbursed", reference: "TOLL-4468" },
  { id: "EXP-9012", category: "Fuel", amount: 2740.80, date: "2025-09-03", vendor: "Pilot Flying J", vehicleId: "VEH-1006", driverId: "DRV-006", status: "approved", reference: "INV-77801" },
  { id: "EXP-9013", category: "Other", amount: 340.00, date: "2025-09-02", vendor: "Blue Beacon", vehicleId: "VEH-1003", driverId: null, status: "approved", reference: "WASH-1192" },
  { id: "EXP-9014", category: "Parts", amount: 890.00, date: "2025-09-02", vendor: "NAPA Auto Parts", vehicleId: "VEH-1010", driverId: null, status: "rejected", reference: "PO-33188" },
  { id: "EXP-9015", category: "Fuel", amount: 3680.25, date: "2025-09-02", vendor: "Love's Travel Stops", vehicleId: "VEH-1012", driverId: "DRV-013", status: "approved", reference: "INV-77788" },
  { id: "EXP-9016", category: "Tolls", amount: 142.00, date: "2025-09-04", vendor: "TxTag", vehicleId: "VEH-1018", driverId: "DRV-005", status: "pending", reference: "TOLL-4473" },
  { id: "EXP-9017", category: "Maintenance", amount: 680.00, date: "2025-08-30", vendor: "FleetPride", vehicleId: "VEH-1002", driverId: null, status: "approved", reference: "MNT-3197" },
  { id: "EXP-9018", category: "Insurance", amount: 1200.00, date: "2025-08-29", vendor: "National General", vehicleId: "VEH-1011", driverId: null, status: "approved", reference: "INS-ADD" },
  { id: "EXP-9019", category: "Fuel", amount: 2240.00, date: "2025-09-04", vendor: "TA Petro", vehicleId: "VEH-1007", driverId: "DRV-008", status: "approved", reference: "INV-77820" },
  { id: "EXP-9020", category: "Other", amount: 75.00, date: "2025-09-03", vendor: "Speedco", vehicleId: "VEH-1001", driverId: null, status: "reimbursed", reference: "MISC-2204" },
];

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------
export const alerts: Alert[] = [
  { id: "ALT-501", type: "Engine Fault", severity: "critical", ref: "VEH-1009", message: "Turbocharger boost pressure below threshold — vehicle in shop", time: "12 min ago", acknowledged: false },
  { id: "ALT-502", type: "License Expiring", severity: "warning", ref: "Tyrone Walker", message: "CDL-A license expires Sep 12, 2025 — 8 days remaining", time: "1 hr ago", acknowledged: false },
  { id: "ALT-503", type: "Fuel Low", severity: "warning", ref: "VEH-1012", message: "Fuel level at 33% — below 35% threshold on active route", time: "2 hr ago", acknowledged: false },
  { id: "ALT-504", type: "HOS Violation", severity: "critical", ref: "Priya Nair", message: "Hours-of-service limit reached at 56 hrs — driver must rest", time: "2 hr ago", acknowledged: false },
  { id: "ALT-505", type: "Maintenance Due", severity: "warning", ref: "VEH-1005", message: "DOT annual inspection overdue by 21 days", time: "3 hr ago", acknowledged: true },
  { id: "ALT-506", type: "Tire Pressure", severity: "warning", ref: "VEH-1006", message: "Rear-right trailer tire pressure low — 88 PSI vs 110 PSI target", time: "4 hr ago", acknowledged: false },
  { id: "ALT-507", type: "Route Deviation", severity: "info", ref: "VEH-1004", message: "Vehicle deviated 4.2 mi from planned route — traffic reroute", time: "5 hr ago", acknowledged: true },
  { id: "ALT-508", type: "License Expiring", severity: "warning", ref: "Carlos Mendez", message: "CDL-A license expires Oct 25, 2025 — 51 days remaining", time: "6 hr ago", acknowledged: false },
  { id: "ALT-509", type: "Engine Fault", severity: "critical", ref: "VEH-1014", message: "Reefer unit temperature deviation — cargo at 41°F vs 36°F setpoint", time: "6 hr ago", acknowledged: false },
  { id: "ALT-510", type: "Geofence Breach", severity: "info", ref: "VEH-1002", message: "Vehicle entered non-permitted zone near Indio weigh station", time: "8 hr ago", acknowledged: true },
  { id: "ALT-511", type: "Maintenance Due", severity: "warning", ref: "VEH-1015", message: "Decommissioning evaluation overdue — engine failure unresolved", time: "1 day ago", acknowledged: false },
  { id: "ALT-512", type: "Fuel Low", severity: "warning", ref: "VEH-1002", message: "Fuel level at 38% — refuel recommended before next leg", time: "1 day ago", acknowledged: true },
];

// ---------------------------------------------------------------------------
// Time series for charts
// ---------------------------------------------------------------------------
export const fleetUtilizationSeries = [
  { label: "Mon", value: 78 },
  { label: "Tue", value: 82 },
  { label: "Wed", value: 85 },
  { label: "Thu", value: 81 },
  { label: "Fri", value: 88 },
  { label: "Sat", value: 64 },
  { label: "Sun", value: 52 },
];

export const costTrendSeries = [
  { label: "Mar", fuel: 184200, maintenance: 42800, other: 71200 },
  { label: "Apr", fuel: 191500, maintenance: 38900, other: 68400 },
  { label: "May", fuel: 178300, maintenance: 51200, other: 73900 },
  { label: "Jun", fuel: 169800, maintenance: 47600, other: 70100 },
  { label: "Jul", fuel: 176400, maintenance: 53400, other: 72800 },
  { label: "Aug", fuel: 182900, maintenance: 49100, other: 75600 },
  { label: "Sep", fuel: 98600, maintenance: 31200, other: 38400 },
];

export const tripsWeeklySeries = [
  { label: "Mon", value: 42 },
  { label: "Tue", value: 48 },
  { label: "Wed", value: 51 },
  { label: "Thu", value: 46 },
  { label: "Fri", value: 53 },
  { label: "Sat", value: 28 },
  { label: "Sun", value: 19 },
];

// ---------------------------------------------------------------------------
// Derived helpers
// ---------------------------------------------------------------------------
export function vehicleById(id: string | null) {
  if (!id) return null;
  return vehicles.find((v) => v.id === id) ?? null;
}
export function driverById(id: string | null) {
  if (!id) return null;
  return drivers.find((d) => d.id === id) ?? null;
}

export function formatCurrency(n: number, compact = false): string {
  if (compact && Math.abs(n) >= 1000) {
    return "$" + (n / 1000).toFixed(1) + "k";
  }
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

// Dashboard KPIs (derived from the data above for consistency)
export const kpis = {
  activeVehicles: vehicles.filter((v) => v.status === "active").length,
  availableVehicles: vehicles.filter((v) => v.status === "available").length,
  maintenanceVehicles: vehicles.filter((v) => v.status === "maintenance").length,
  driversOnDuty: drivers.filter((d) => d.status === "on_duty").length,
  activeTrips: trips.filter((t) => t.status === "in_transit").length,
  pendingTrips: trips.filter(
    (t) => t.status === "scheduled" || t.status === "loading"
  ).length,
  fleetUtilization: Math.round(
    vehicles.reduce((s, v) => s + v.utilization, 0) / vehicles.length
  ),
  fuelCostMonth: 182900,
  maintenanceCostMonth: 49100,
  operationalCostMonth: 307600,
};

export const upcomingMaintenance = maintenance
  .filter((m) => m.status === "scheduled" || m.status === "overdue" || m.status === "in_progress")
  .sort((a, b) => a.scheduled.localeCompare(b.scheduled))
  .slice(0, 6);

export const licenseExpiryAlerts = drivers
  .map((d) => ({ driver: d, days: daysUntil(d.licenseExpiry) }))
  .filter((x) => x.days <= 90)
  .sort((a, b) => a.days - b.days);

export function daysUntil(iso: string): number {
  const now = new Date("2025-09-04T12:00:00Z").getTime();
  const target = new Date(iso).getTime();
  return Math.round((target - now) / (1000 * 60 * 60 * 24));
}

export const recentTrips = trips
  .slice()
  .sort((a, b) => b.departure.localeCompare(a.departure))
  .slice(0, 8);
