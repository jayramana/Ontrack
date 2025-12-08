-- Create Warehouses table (basic Phase 4 version)
CREATE TABLE IF NOT EXISTS "Warehouses" (
    "Id" SERIAL PRIMARY KEY,
    "Name" TEXT NOT NULL,
    "Address" TEXT NOT NULL,
    "Region" TEXT NOT NULL,
    "Latitude" DOUBLE PRECISION NOT NULL,
    "Longitude" DOUBLE PRECISION NOT NULL,
    "ManagerName" TEXT NOT NULL,
    "ContactPhone" TEXT NOT NULL
);

-- Insert some demo warehouses
INSERT INTO "Warehouses" ("Name", "Address", "Region", "Latitude", "Longitude", "ManagerName", "ContactPhone")
VALUES 
    ('Chennai Central Hub', '123 Anna Salai, Chennai, Tamil Nadu', 'South India', 13.0827, 80.2707, 'Rajesh Kumar', '+91-9876543210'),
    ('Bangalore Tech Hub', '456 MG Road, Bangalore, Karnataka', 'South India', 12.9716, 77.5946, 'Priya Sharma', '+91-9876543211'),
    ('Mumbai Port Hub', '789 Marine Drive, Mumbai, Maharashtra', 'West India', 19.0760, 72.8777, 'Amit Patel', '+91-9876543212'),
    ('Delhi NCR Hub', '101 Connaught Place, New Delhi', 'North India', 28.6139, 77.2090, 'Sunita Singh', '+91-9876543213')
ON CONFLICT DO NOTHING;
