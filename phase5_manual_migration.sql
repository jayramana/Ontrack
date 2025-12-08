-- Phase 5: Add missing columns to Users table
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "AssignedWarehouseId" INTEGER NULL;
ALTER TABLE "Users" ADD CONSTRAINT "FK_Users_Warehouses_AssignedWarehouseId" 
    FOREIGN KEY ("AssignedWarehouseId") REFERENCES "Warehouses" ("Id");

-- Add capacity fields to Warehouses
ALTER TABLE "Warehouses" ADD COLUMN IF NOT EXISTS "MaxCapacity" DOUBLE PRECISION NOT NULL DEFAULT 1000.0;
ALTER TABLE "Warehouses" ADD COLUMN IF NOT EXISTS "CapacityUnit" TEXT NOT NULL DEFAULT 'cubic_meters';
ALTER TABLE "Warehouses" ADD COLUMN IF NOT EXISTS "CapacityAlertThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.85;

-- Add international shipping fields to Orders
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "IsInternational" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "DestinationCountryCode" TEXT NULL;
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "CustomsDeclaration" TEXT NULL;
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "InternationalTrackingNumber" TEXT NULL;
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "TransportId" INTEGER NULL;

-- Create PricingTiers table
CREATE TABLE IF NOT EXISTS "PricingTiers" (
    "Id" SERIAL PRIMARY KEY,
    "Region" TEXT NOT NULL,
    "DistanceMin" DOUBLE PRECISION NOT NULL,
    "DistanceMax" DOUBLE PRECISION NOT NULL,
    "WeightMin" DOUBLE PRECISION NOT NULL,
    "WeightMax" DOUBLE PRECISION NOT NULL,
    "BasePrice" NUMERIC(10,2) NOT NULL,
    "PerKmRate" NUMERIC(10,2) NOT NULL,
    "PerKgRate" NUMERIC(10,2) NOT NULL,
    "SurchargeType" TEXT NULL,
    "SurchargeAmount" NUMERIC(10,2) NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create Transports table
CREATE TABLE IF NOT EXISTS "Transports" (
    "Id" SERIAL PRIMARY KEY,
    "OriginWarehouseId" INTEGER NOT NULL,
    "DestinationWarehouseId" INTEGER NOT NULL,
    "ScheduledDepartureTime" TIMESTAMP NOT NULL,
    "ActualDepartureTime" TIMESTAMP NULL,
    "EstimatedArrivalTime" TIMESTAMP NOT NULL,
    "ActualArrivalTime" TIMESTAMP NULL,
    "Status" TEXT NOT NULL,
    "VehicleNumber" TEXT NULL,
    "DriverName" TEXT NULL,
    "DriverPhone" TEXT NULL,
    "TransportCost" NUMERIC(10,2) NULL,
    CONSTRAINT "FK_Transports_Warehouses_Origin" FOREIGN KEY ("OriginWarehouseId") REFERENCES "Warehouses" ("Id"),
    CONSTRAINT "FK_Transports_Warehouses_Destination" FOREIGN KEY ("DestinationWarehouseId") REFERENCES "Warehouses" ("Id")
);

-- Create Countries table
CREATE TABLE IF NOT EXISTS "Countries" (
    "Code" TEXT PRIMARY KEY,
    "Name" TEXT NOT NULL,
    "CustomsRequired" BOOLEAN NOT NULL DEFAULT FALSE,
    "MaxWeightLimit" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "InternationalRateMultiplier" NUMERIC(10,2) NOT NULL DEFAULT 2.0,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create InventoryItems table
CREATE TABLE IF NOT EXISTS "InventoryItems" (
    "Id" SERIAL PRIMARY KEY,
    "WarehouseId" INTEGER NOT NULL,
    "SKU" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT NULL,
    "Quantity" INTEGER NOT NULL DEFAULT 0,
    "UnitType" TEXT NOT NULL DEFAULT 'pieces',
    "MinStockLevel" INTEGER NOT NULL DEFAULT 10,
    "ReorderPoint" INTEGER NOT NULL DEFAULT 20,
    "LastRestockedAt" TIMESTAMP NOT NULL,
    CONSTRAINT "FK_InventoryItems_Warehouses" FOREIGN KEY ("WarehouseId") REFERENCES "Warehouses" ("Id")
);

-- Create InventoryTransactions table
CREATE TABLE IF NOT EXISTS "InventoryTransactions" (
    "Id" SERIAL PRIMARY KEY,
    "InventoryItemId" INTEGER NOT NULL,
    "Type" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "OrderId" INTEGER NULL,
    "FromWarehouseId" INTEGER NULL,
    "ToWarehouseId" INTEGER NULL,
    "CreatedAt" TIMESTAMP NOT NULL,
    "Notes" TEXT NULL,
    CONSTRAINT "FK_InventoryTransactions_InventoryItems" FOREIGN KEY ("InventoryItemId") REFERENCES "InventoryItems" ("Id"),
    CONSTRAINT "FK_InventoryTransactions_Orders" FOREIGN KEY ("OrderId") REFERENCES "Orders" ("Id")
);

-- Add foreign key constraints for Orders
ALTER TABLE "Orders" ADD CONSTRAINT IF NOT EXISTS "FK_Orders_Countries" 
    FOREIGN KEY ("DestinationCountryCode") REFERENCES "Countries" ("Code");
ALTER TABLE "Orders" ADD CONSTRAINT IF NOT EXISTS "FK_Orders_Transports" 
    FOREIGN KEY ("TransportId") REFERENCES "Transports" ("Id");
