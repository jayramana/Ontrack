DELETE FROM "Warehouses";
ALTER SEQUENCE "Warehouses_Id_seq" RESTART WITH 1;

INSERT INTO "Warehouses"
("Name", "Region", "City", "Pincode", "Address", "ManagerName", "ContactPhone", "Latitude", "Longitude", "CreatedAt")
VALUES
    ('Chennai District Hub', 'Tamil Nadu', 'Chennai', '600001', 'Anna Salai, Chennai', 'Rajesh Kumar', '+91-9876543201', NULL, NULL, NOW()),
    ('Tiruvallur District Hub', 'Tamil Nadu', 'Tiruvallur', '602001', 'Main Road, Tiruvallur', 'Priya Sharma', '+91-9876543202', NULL, NULL, NOW()),
    ('Kanchipuram District Hub', 'Tamil Nadu', 'Kanchipuram', '631501', 'Silk Market Road, Kanchipuram', 'Vijay Anand', '+91-9876543203', NULL, NULL, NOW()),
    ('Vellore District Hub', 'Tamil Nadu', 'Vellore', '632001', 'CMC Road, Vellore', 'Lakshmi Devi', '+91-9876543204', NULL, NULL, NOW()),
    ('Ranipet District Hub', 'Tamil Nadu', 'Ranipet', '632401', 'NH 48, Ranipet', 'Suresh Babu', '+91-9876543205', NULL, NULL, NOW()),
    ('Tirupattur District Hub', 'Tamil Nadu', 'Tirupattur', '635601', 'Bazaar Street, Tirupattur', 'Arun Kumar', '+91-9876543206', NULL, NULL, NOW()),
    ('Tiruvannamalai District Hub', 'Tamil Nadu', 'Tiruvannamalai', '606601', 'Girivalam Road, Tiruvannamalai', 'Meena Devi', '+91-9876543207', NULL, NULL, NOW()),
    ('Villupuram District Hub', 'Tamil Nadu', 'Villupuram', '605602', 'Railway Road, Villupuram', 'Karthik Raja', '+91-9876543208', NULL, NULL, NOW()),

    -- West Zone
    ('Coimbatore District Hub', 'Tamil Nadu', 'Coimbatore', '641001', 'RS Puram, Coimbatore', 'Ramesh Kumar', '+91-9876543209', NULL, NULL, NOW()),
    ('Tiruppur District Hub', 'Tamil Nadu', 'Tiruppur', '641601', 'Textile Market, Tiruppur', 'Geetha Lakshmi', '+91-9876543210', NULL, NULL, NOW()),
    ('Erode District Hub', 'Tamil Nadu', 'Erode', '638001', 'Perundurai Road, Erode', 'Senthil Nathan', '+91-9876543211', NULL, NULL, NOW()),
    ('Nilgiris District Hub', 'Tamil Nadu', 'Ooty', '643001', 'Commercial Road, Ooty', 'Krishna Murthy', '+91-9876543212', NULL, NULL, NOW()),
    ('Salem District Hub', 'Tamil Nadu', 'Salem', '636001', 'Cherry Road, Salem', 'Anitha Rani', '+91-9876543213', NULL, NULL, NOW()),
    ('Namakkal District Hub', 'Tamil Nadu', 'Namakkal', '637001', 'Main Road, Namakkal', 'Balaji Subramanian', '+91-9876543214', NULL, NULL, NOW()),
    ('Dharmapuri District Hub', 'Tamil Nadu', 'Dharmapuri', '636701', 'Bazaar Street, Dharmapuri', 'Vani Priya', '+91-9876543215', NULL, NULL, NOW()),
    ('Krishnagiri District Hub', 'Tamil Nadu', 'Krishnagiri', '635001', 'NH 44, Krishnagiri', 'Murali Manohar', '+91-9876543216', NULL, NULL, NOW()),

    -- South Zone
    ('Madurai District Hub', 'Tamil Nadu', 'Madurai', '625001', 'Anna Nagar, Madurai', 'Saravanan Pillai', '+91-9876543217', NULL, NULL, NOW()),
    ('Theni District Hub', 'Tamil Nadu', 'Theni', '625531', 'Bus Stand Road, Theni', 'Kavitha Devi', '+91-9876543218', NULL, NULL, NOW()),
    ('Dindigul District Hub', 'Tamil Nadu', 'Dindigul', '624001', 'Trichy Road, Dindigul', 'Mahesh Kumar', '+91-9876543219', NULL, NULL, NOW()),
    ('Sivaganga District Hub', 'Tamil Nadu', 'Sivaganga', '630561', 'Collector Office Road, Sivaganga', 'Bharathi Devi', '+91-9876543220', NULL, NULL, NOW()),
    ('Ramanathapuram District Hub', 'Tamil Nadu', 'Ramanathapuram', '623501', 'Railway Station Road, Ramanathapuram', 'Ganesh Babu', '+91-9876543221', NULL, NULL, NOW()),
    ('Virudhunagar District Hub', 'Tamil Nadu', 'Virudhunagar', '626001', 'Main Bazaar, Virudhunagar', 'Selvi Rani', '+91-9876543222', NULL, NULL, NOW()),
    ('Tuticorin District Hub', 'Tamil Nadu', 'Tuticorin', '628001', 'Harbour Road, Tuticorin', 'Prakash Kumar', '+91-9876543223', NULL, NULL, NOW()),
    ('Kanyakumari District Hub', 'Tamil Nadu', 'Nagercoil', '629001', 'Vadasery, Nagercoil', 'Shanthi Devi', '+91-9876543224', NULL, NULL, NOW()),
    ('Tirunelveli District Hub', 'Tamil Nadu', 'Tirunelveli', '627001', 'Junction Road, Tirunelveli', 'Rajagopal Reddy', '+91-9876543225', NULL, NULL, NOW()),
    ('Tenkasi District Hub', 'Tamil Nadu', 'Tenkasi', '627811', 'Main Road, Tenkasi', 'Uma Maheswari', '+91-9876543226', NULL, NULL, NOW()),

    -- Central Zone
    ('Tiruchirappalli District Hub', 'Tamil Nadu', 'Trichy', '620001', 'Junction Road, Trichy', 'Venkatesh Kumar', '+91-9876543227', NULL, NULL, NOW()),
    ('Karur District Hub', 'Tamil Nadu', 'Karur', '639001', 'Textile Market, Karur', 'Parvathi Devi', '+91-9876543228', NULL, NULL, NOW()),
    ('Perambalur District Hub', 'Tamil Nadu', 'Perambalur', '621212', 'Main Road, Perambalur', 'Srinivasan Iyer', '+91-9876543229', NULL, NULL, NOW()),
    ('Ariyalur District Hub', 'Tamil Nadu', 'Ariyalur', '621704', 'Collector Office Road, Ariyalur', 'Jaya Lakshmi', '+91-9876543230', NULL, NULL, NOW()),
    ('Thanjavur District Hub', 'Tamil Nadu', 'Thanjavur', '613001', 'Gandhi Road, Thanjavur', 'Mohan Krishna', '+91-9876543231', NULL, NULL, NOW()),
    ('Nagapattinam District Hub', 'Tamil Nadu', 'Nagapattinam', '611001', 'Port Road, Nagapattinam', 'Radha Krishnan', '+91-9876543232', NULL, NULL, NOW()),
    ('Tiruvarur District Hub', 'Tamil Nadu', 'Tiruvarur', '610001', 'Main Road, Tiruvarur', 'Deepa Rani', '+91-9876543233', NULL, NULL, NOW()),
    ('Pudukkottai District Hub', 'Tamil Nadu', 'Pudukkottai', '622001', 'Trichy Road, Pudukkottai', 'Aravind Kumar', '+91-9876543234', NULL, NULL, NOW()),

    -- East Zone
    ('Cuddalore District Hub', 'Tamil Nadu', 'Cuddalore', '607001', 'Bazaar Street, Cuddalore', 'Lakshman Rao', '+91-9876543235', NULL, NULL, NOW()),
    ('Kallakurichi District Hub', 'Tamil Nadu', 'Kallakurichi', '606202', 'Main Road, Kallakurichi', 'Sangeetha Devi', '+91-9876543236', NULL, NULL, NOW());
