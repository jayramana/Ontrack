-- Seed Warehouses for India
-- Run this in pgAdmin after migration

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
