-- Clear existing warehouses and re-seed with Tamil Nadu 32 districts only
-- Run this in pgAdmin to update to small-scale Tamil Nadu project

-- Delete existing warehouses
DELETE FROM "Warehouses";

-- Reset the ID sequence
ALTER SEQUENCE "Warehouses_Id_seq" RESTART WITH 1;

-- Verify deletion
SELECT COUNT(*) as "Warehouse Count" FROM "Warehouses";

-- Now call the backend API to seed Tamil Nadu warehouses:
-- POST http://localhost:5066/api/warehouse/seed
