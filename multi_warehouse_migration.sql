-- Multi-Warehouse Logistics System - Database Migration
-- Run this in pgAdmin or psql

-- =====================================================
-- 1. CREATE WAREHOUSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "Warehouses" (
    "Id" SERIAL PRIMARY KEY,
    "Name" TEXT NOT NULL,
    "Region" TEXT NOT NULL,  -- e.g., "Tamil Nadu", "Maharashtra"
    "City" TEXT NOT NULL,    -- e.g., "Chennai", "Mumbai"
    "Pincode" TEXT NOT NULL,
    "Address" TEXT NOT NULL,
    "Latitude" DOUBLE PRECISION,   -- Populated via geocoding
    "Longitude" DOUBLE PRECISION,  -- Populated via geocoding
    "ManagerName" TEXT,
    "ContactPhone" TEXT,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. UPDATE ORDERS TABLE
-- =====================================================

-- Add warehouse tracking columns
ALTER TABLE "Orders" 
ADD COLUMN IF NOT EXISTS "OriginWarehouseId" INT,
ADD COLUMN IF NOT EXISTS "DestinationWarehouseId" INT,
ADD COLUMN IF NOT EXISTS "CurrentWarehouseId" INT,
ADD COLUMN IF NOT EXISTS "Priority" INT DEFAULT 2,  -- 1=High, 2=Normal, 3=Low/Rescheduled
ADD COLUMN IF NOT EXISTS "RescheduledDate" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "PickupPincode" TEXT,
ADD COLUMN IF NOT EXISTS "DeliveryPincode" TEXT,
ADD COLUMN IF NOT EXISTS "EstimatedDeliveryDate" TIMESTAMP;

-- Add foreign keys
ALTER TABLE "Orders"
ADD CONSTRAINT "FK_Orders_OriginWarehouse" 
    FOREIGN KEY ("OriginWarehouseId") REFERENCES "Warehouses"("Id") ON DELETE SET NULL,
ADD CONSTRAINT "FK_Orders_DestinationWarehouse" 
    FOREIGN KEY ("DestinationWarehouseId") REFERENCES "Warehouses"("Id") ON DELETE SET NULL,
ADD CONSTRAINT "FK_Orders_CurrentWarehouse" 
    FOREIGN KEY ("CurrentWarehouseId") REFERENCES "Warehouses"("Id") ON DELETE SET NULL;

-- =====================================================
-- 3. UPDATE USERS TABLE
-- =====================================================

-- Add warehouse assignment for drivers and warehouse admins
ALTER TABLE "Users"
ADD COLUMN IF NOT EXISTS "AssignedWarehouseId" INT,
ADD CONSTRAINT "FK_Users_Warehouse" 
    FOREIGN KEY ("AssignedWarehouseId") REFERENCES "Warehouses"("Id") ON DELETE SET NULL;

-- =====================================================
-- 4. CREATE DRIVER LOCATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "DriverLocations" (
    "Id" SERIAL PRIMARY KEY,
    "DriverId" INT NOT NULL,
    "Latitude" DOUBLE PRECISION NOT NULL,
    "Longitude" DOUBLE PRECISION NOT NULL,
    "Speed" DOUBLE PRECISION DEFAULT 0,
    "Heading" DOUBLE PRECISION DEFAULT 0,
    "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("DriverId") REFERENCES "Users"("Id") ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "idx_driver_locations_driver" ON "DriverLocations"("DriverId");
CREATE INDEX IF NOT EXISTS "idx_driver_locations_updated" ON "DriverLocations"("UpdatedAt" DESC);

-- =====================================================
-- 5. SEED WAREHOUSES (Major Indian Cities)
-- =====================================================

INSERT INTO "Warehouses" ("Name", "Region", "City", "Pincode", "Address", "ManagerName", "ContactPhone")
VALUES 
    -- South India
    ('Chennai Central Hub', 'Tamil Nadu', 'Chennai', '600001', 'Anna Salai, Chennai', 'Rajesh Kumar', '+91-9876543210'),
    ('Chennai South Hub', 'Tamil Nadu', 'Chennai', '600041', 'Adyar, Chennai', 'Priya Sharma', '+91-9876543211'),
    ('Coimbatore Hub', 'Tamil Nadu', 'Coimbatore', '641001', 'RS Puram, Coimbatore', 'Vijay Anand', '+91-9876543212'),
    ('Madurai Hub', 'Tamil Nadu', 'Madurai', '625001', 'Main Road, Madurai', 'Lakshmi Devi', '+91-9876543213'),
    ('Kanyakumari Hub', 'Tamil Nadu', 'Kanyakumari', '629001', 'Beach Road, Kanyakumari', 'Suresh Babu', '+91-9876543214'),
    
    ('Bangalore Central Hub', 'Karnataka', 'Bangalore', '560001', 'MG Road, Bangalore', 'Arun Patel', '+91-9876543215'),
    ('Bangalore North Hub', 'Karnataka', 'Bangalore', '560024', 'Hebbal, Bangalore', 'Sneha Reddy', '+91-9876543216'),
    ('Mysore Hub', 'Karnataka', 'Mysore', '570001', 'Sayyaji Rao Road, Mysore', 'Kiran Kumar', '+91-9876543217'),
    
    ('Hyderabad Hub', 'Telangana', 'Hyderabad', '500001', 'Abids, Hyderabad', 'Ramesh Naidu', '+91-9876543218'),
    ('Hyderabad East Hub', 'Telangana', 'Hyderabad', '500039', 'Uppal, Hyderabad', 'Madhavi Rao', '+91-9876543219'),
    
    ('Kochi Hub', 'Kerala', 'Kochi', '682001', 'MG Road, Kochi', 'Vinod Menon', '+91-9876543220'),
    ('Trivandrum Hub', 'Kerala', 'Trivandrum', '695001', 'Palayam, Trivandrum', 'Geeta Nair', '+91-9876543221'),
    
    -- West India
    ('Mumbai Central Hub', 'Maharashtra', 'Mumbai', '400001', 'Fort, Mumbai', 'Amit Shah', '+91-9876543222'),
    ('Mumbai Andheri Hub', 'Maharashtra', 'Mumbai', '400058', 'Andheri West, Mumbai', 'Neha Desai', '+91-9876543223'),
    ('Pune Hub', 'Maharashtra', 'Pune', '411001', 'Camp, Pune', 'Sanjay Patil', '+91-9876543224'),
    
    ('Ahmedabad Hub', 'Gujarat', 'Ahmedabad', '380001', 'Ellis Bridge, Ahmedabad', 'Ravi Joshi', '+91-9876543225'),
    ('Surat Hub', 'Gujarat', 'Surat', '395001', 'Ring Road, Surat', 'Minal Dave', '+91-9876543226'),
    
    -- North India
    ('Delhi Central Hub', 'Delhi', 'New Delhi', '110001', 'Connaught Place, Delhi', 'Sunita Singh', '+91-9876543227'),
    ('Delhi North Hub', 'Delhi', 'New Delhi', '110009', 'Rohini, Delhi', 'Vikram Malhotra', '+91-9876543228'),
    ('Noida Hub', 'Uttar Pradesh', 'Noida', '201301', 'Sector 18, Noida', 'Pooja Gupta', '+91-9876543229'),
    ('Gurgaon Hub', 'Haryana', 'Gurgaon', '122001', 'Cyber City, Gurgaon', 'Arjun Verma', '+91-9876543230'),
    
    ('Jaipur Hub', 'Rajasthan', 'Jaipur', '302001', 'MI Road, Jaipur', 'Kavita Sharma', '+91-9876543231'),
    ('Lucknow Hub', 'Uttar Pradesh', 'Lucknow', '226001', 'Hazratganj, Lucknow', 'Ankit Tiwari', '+91-9876543232'),
    
    -- East India
    ('Kolkata Central Hub', 'West Bengal', 'Kolkata', '700001', 'Park Street, Kolkata', 'Sourav Chatterjee', '+91-9876543233'),
    ('Kolkata Salt Lake Hub', 'West Bengal', 'Kolkata', '700091', 'Salt Lake, Kolkata', 'Priyanka Ghosh', '+91-9876543234'),
    
    ('Bhubaneswar Hub', 'Odisha', 'Bhubaneswar', '751001', 'Bapuji Nagar, Bhubaneswar', 'Rajat Mohanty', '+91-9876543235'),
    ('Guwahati Hub', 'Assam', 'Guwahati', '781001', 'Paltan Bazaar, Guwahati', 'Nisha Borah', '+91-9876543236')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Orders indexes
CREATE INDEX IF NOT EXISTS "idx_orders_origin_warehouse" ON "Orders"("OriginWarehouseId");
CREATE INDEX IF NOT EXISTS "idx_orders_destination_warehouse" ON "Orders"("DestinationWarehouseId");
CREATE INDEX IF NOT EXISTS "idx_orders_current_warehouse" ON "Orders"("CurrentWarehouseId");
CREATE INDEX IF NOT EXISTS "idx_orders_priority" ON "Orders"("Priority");
CREATE INDEX IF NOT EXISTS "idx_orders_driver" ON "Orders"("DriverId");
CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "Orders"("Status");

-- Warehouses indexes
CREATE INDEX IF NOT EXISTS "idx_warehouses_pincode" ON "Warehouses"("Pincode");
CREATE INDEX IF NOT EXISTS "idx_warehouses_city" ON "Warehouses"("City");
CREATE INDEX IF NOT EXISTS "idx_warehouses_region" ON "Warehouses"("Region");

-- Users indexes
CREATE INDEX IF NOT EXISTS "idx_users_warehouse" ON "Users"("AssignedWarehouseId");
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "Users"("Role");

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- After running this script:
-- 1. Restart your backend
-- 2. Uncomment Warehouse DbSet in AppDbContext.cs
-- 3. Geocode warehouse pincodes to populate lat/lng
-- =====================================================
