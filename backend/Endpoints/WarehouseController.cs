using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Backend.Data;
using Backend.Domain.Entity;
using Backend.Services;

namespace Backend.Endpoints
{
    [ApiController]
    [Route("api/[controller]")]
    public class WarehouseController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly WarehouseAssignmentService _warehouseService;
        private readonly GeocodingService _geocodingService;

        public WarehouseController(AppDbContext context, WarehouseAssignmentService warehouseService, GeocodingService geocodingService)
        {
            _context = context;
            _warehouseService = warehouseService;
            _geocodingService = geocodingService;
        }

        // GET: api/warehouse
        [HttpGet]
        public async Task<IActionResult> GetAllWarehouses()
        {
            var warehouses = await _context.Warehouses
                .OrderBy(w => w.Region)
                .ThenBy(w => w.City)
                .ToListAsync();
            
            return Ok(warehouses);
        }

        // GET: api/warehouse/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetWarehouse(int id)
        {
            var warehouse = await _context.Warehouses.FindAsync(id);
            if (warehouse == null)
                return NotFound();

            return Ok(warehouse);
        }

        // GET: api/warehouse/{id}/orders
        [HttpGet("{id}/orders")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetWarehouseOrders(int id)
        {
            var orders = await _context.Orders
                .Where(o => o.CurrentWarehouseId == id || 
                           o.OriginWarehouseId == id || 
                           o.DestinationWarehouseId == id)
                .Include(o => o.Driver)
                .Include(o => o.Sender)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/warehouse/{id}/statistics
        [HttpGet("{id}/statistics")]
        public async Task<IActionResult> GetWarehouseStatistics(int id)
        {
            var warehouse = await _context.Warehouses.FindAsync(id);
            if (warehouse == null)
                return NotFound();

            // Orders picked up from this warehouse (sender location)
            var pickupOrders = await _context.Orders
                .Where(o => o.OriginWarehouseId == id)
                .CountAsync();

            // Orders to be delivered to this warehouse area (receiver location)
            var deliveryOrders = await _context.Orders
                .Where(o => o.DestinationWarehouseId == id)
                .CountAsync();

            // Orders currently at this warehouse
            var currentOrders = await _context.Orders
                .Where(o => o.CurrentWarehouseId == id)
                .CountAsync();

            // Pending assignments at this warehouse
            var pendingAssignments = await _context.Orders
                .Where(o => o.CurrentWarehouseId == id && o.Status == "AtOriginWarehouse")
                .CountAsync();

            // In transit from this warehouse
            var inTransit = await _context.Orders
                .Where(o => o.OriginWarehouseId == id && 
                           (o.Status == "InTransit" || o.Status == "OutForDelivery"))
                .CountAsync();

            // Delivered from this warehouse
            var delivered = await _context.Orders
                .Where(o => o.OriginWarehouseId == id && o.Status == "Delivered")
                .CountAsync();

            return Ok(new
            {
                warehouseName = warehouse.Name,
                city = warehouse.City,
                pincode = warehouse.Pincode,
                statistics = new
                {
                    totalPickups = pickupOrders,        // Orders sent from this district
                    totalDeliveries = deliveryOrders,   // Orders to be delivered to this district
                    currentlyAtWarehouse = currentOrders,
                    pendingAssignment = pendingAssignments,
                    inTransit = inTransit,
                    delivered = delivered
                }
            });
        }

        // GET: api/warehouse/{id}/drivers
        [HttpGet("{id}/drivers")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetWarehouseDrivers(int id)
        {
            var drivers = await _context.Users
                .Where(u => u.Role == "Driver" && u.AssignedWarehouseId == id)
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.IsAvailable,
                    u.CurrentLatitude,
                    u.CurrentLongitude
                })
                .ToListAsync();

            return Ok(drivers);
        }

        // POST: api/warehouse/seed
        [HttpPost("seed")]
        public async Task<IActionResult> SeedWarehouses()
        {
            // Check if warehouses already exist
            if (await _context.Warehouses.AnyAsync())
            {
                return Ok(new { message = "Warehouses already seeded", count = await _context.Warehouses.CountAsync() });
            }

            // Tamil Nadu - 32 Districts Warehouses
            var warehouses = new List<Warehouse>
            {
                // North Zone
                new Warehouse { Name = "Chennai District Hub", Region = "Tamil Nadu", City = "Chennai", Pincode = "600001", Address = "Anna Salai, Chennai", ManagerName = "Rajesh Kumar", ContactPhone = "+91-9876543201" },
                new Warehouse { Name = "Tiruvallur District Hub", Region = "Tamil Nadu", City = "Tiruvallur", Pincode = "602001", Address = "Main Road, Tiruvallur", ManagerName = "Priya Sharma", ContactPhone = "+91-9876543202" },
                new Warehouse { Name = "Kanchipuram District Hub", Region = "Tamil Nadu", City = "Kanchipuram", Pincode = "631501", Address = "Silk Market Road, Kanchipuram", ManagerName = "Vijay Anand", ContactPhone = "+91-9876543203" },
                new Warehouse { Name = "Vellore District Hub", Region = "Tamil Nadu", City = "Vellore", Pincode = "632001", Address = "CMC Road, Vellore", ManagerName = "Lakshmi Devi", ContactPhone = "+91-9876543204" },
                new Warehouse { Name = "Ranipet District Hub", Region = "Tamil Nadu", City = "Ranipet", Pincode = "632401", Address = "NH 48, Ranipet", ManagerName = "Suresh Babu", ContactPhone = "+91-9876543205" },
                new Warehouse { Name = "Tirupattur District Hub", Region = "Tamil Nadu", City = "Tirupattur", Pincode = "635601", Address = "Bazaar Street, Tirupattur", ManagerName = "Arun Kumar", ContactPhone = "+91-9876543206" },
                new Warehouse { Name = "Tiruvannamalai District Hub", Region = "Tamil Nadu", City = "Tiruvannamalai", Pincode = "606601", Address = "Girivalam Road, Tiruvannamalai", ManagerName = "Meena Devi", ContactPhone = "+91-9876543207" },
                new Warehouse { Name = "Villupuram District Hub", Region = "Tamil Nadu", City = "Villupuram", Pincode = "605602", Address = "Railway Road, Villupuram", ManagerName = "Karthik Raja", ContactPhone = "+91-9876543208" },
                
                // West Zone
                new Warehouse { Name = "Coimbatore District Hub", Region = "Tamil Nadu", City = "Coimbatore", Pincode = "641001", Address = "RS Puram, Coimbatore", ManagerName = "Ramesh Kumar", ContactPhone = "+91-9876543209" },
                new Warehouse { Name = "Tiruppur District Hub", Region = "Tamil Nadu", City = "Tiruppur", Pincode = "641601", Address = "Textile Market, Tiruppur", ManagerName = "Geetha Lakshmi", ContactPhone = "+91-9876543210" },
                new Warehouse { Name = "Erode District Hub", Region = "Tamil Nadu", City = "Erode", Pincode = "638001", Address = "Perundurai Road, Erode", ManagerName = "Senthil Nathan", ContactPhone = "+91-9876543211" },
                new Warehouse { Name = "Nilgiris District Hub", Region = "Tamil Nadu", City = "Ooty", Pincode = "643001", Address = "Commercial Road, Ooty", ManagerName = "Krishna Murthy", ContactPhone = "+91-9876543212" },
                new Warehouse { Name = "Salem District Hub", Region = "Tamil Nadu", City = "Salem", Pincode = "636001", Address = "Cherry Road, Salem", ManagerName = "Anitha Rani", ContactPhone = "+91-9876543213" },
                new Warehouse { Name = "Namakkal District Hub", Region = "Tamil Nadu", City = "Namakkal", Pincode = "637001", Address = "Main Road, Namakkal", ManagerName = "Balaji Subramanian", ContactPhone = "+91-9876543214" },
                new Warehouse { Name = "Dharmapuri District Hub", Region = "Tamil Nadu", City = "Dharmapuri", Pincode = "636701", Address = "Bazaar Street, Dharmapuri", ManagerName = "Vani Priya", ContactPhone = "+91-9876543215" },
                new Warehouse { Name = "Krishnagiri District Hub", Region = "Tamil Nadu", City = "Krishnagiri", Pincode = "635001", Address = "NH 44, Krishnagiri", ManagerName = "Murali Manohar", ContactPhone = "+91-9876543216" },
                
                // South Zone
                new Warehouse { Name = "Madurai District Hub", Region = "Tamil Nadu", City = "Madurai", Pincode = "625001", Address = "Anna Nagar, Madurai", ManagerName = "Saravanan Pillai", ContactPhone = "+91-9876543217" },
                new Warehouse { Name = "Theni District Hub", Region = "Tamil Nadu", City = "Theni", Pincode = "625531", Address = "Bus Stand Road, Theni", ManagerName = "Kavitha Devi", ContactPhone = "+91-9876543218" },
                new Warehouse { Name = "Dindigul District Hub", Region = "Tamil Nadu", City = "Dindigul", Pincode = "624001", Address = "Trichy Road, Dindigul", ManagerName = "Mahesh Kumar", ContactPhone = "+91-9876543219" },
                new Warehouse { Name = "Sivaganga District Hub", Region = "Tamil Nadu", City = "Sivaganga", Pincode = "630561", Address = "Collector Office Road, Sivaganga", ManagerName = "Bharathi Devi", ContactPhone = "+91-9876543220" },
                new Warehouse { Name = "Ramanathapuram District Hub", Region = "Tamil Nadu", City = "Ramanathapuram", Pincode = "623501", Address = "Railway Station Road, Ramanathapuram", ManagerName = "Ganesh Babu", ContactPhone = "+91-9876543221" },
                new Warehouse { Name = "Virudhunagar District Hub", Region = "Tamil Nadu", City = "Virudhunagar", Pincode = "626001", Address = "Main Bazaar, Virudhunagar", ManagerName = "Selvi Rani", ContactPhone = "+91-9876543222" },
                new Warehouse { Name = "Tuticorin District Hub", Region = "Tamil Nadu", City = "Tuticorin", Pincode = "628001", Address = "Harbour Road, Tuticorin", ManagerName = "Prakash Kumar", ContactPhone = "+91-9876543223" },
                new Warehouse { Name = "Kanyakumari District Hub", Region = "Tamil Nadu", City = "Nagercoil", Pincode = "629001", Address = "Vadasery, Nagercoil", ManagerName = "Shanthi Devi", ContactPhone = "+91-9876543224" },
                new Warehouse { Name = "Tirunelveli District Hub", Region = "Tamil Nadu", City = "Tirunelveli", Pincode = "627001", Address = "Junction Road, Tirunelveli", ManagerName = "Rajagopal Reddy", ContactPhone = "+91-9876543225" },
                new Warehouse { Name = "Tenkasi District Hub", Region = "Tamil Nadu", City = "Tenkasi", Pincode = "627811", Address = "Main Road, Tenkasi", ManagerName = "Uma Maheswari", ContactPhone = "+91-9876543226" },
                
                // Central Zone
                new Warehouse { Name = "Tiruchirappalli District Hub", Region = "Tamil Nadu", City = "Trichy", Pincode = "620001", Address = "Junction Road, Trichy", ManagerName = "Venkatesh Kumar", ContactPhone = "+91-9876543227" },
                new Warehouse { Name = "Karur District Hub", Region = "Tamil Nadu", City = "Karur", Pincode = "639001", Address = "Textile Market, Karur", ManagerName = "Parvathi Devi", ContactPhone = "+91-9876543228" },
                new Warehouse { Name = "Perambalur District Hub", Region = "Tamil Nadu", City = "Perambalur", Pincode = "621212", Address = "Main Road, Perambalur", ManagerName = "Srinivasan Iyer", ContactPhone = "+91-9876543229" },
                new Warehouse { Name = "Ariyalur District Hub", Region = "Tamil Nadu", City = "Ariyalur", Pincode = "621704", Address = "Collector Office Road, Ariyalur", ManagerName = "Jaya Lakshmi", ContactPhone = "+91-9876543230" },
                new Warehouse { Name = "Thanjavur District Hub", Region = "Tamil Nadu", City = "Thanjavur", Pincode = "613001", Address = "Gandhi Road, Thanjavur", ManagerName = "Mohan Krishna", ContactPhone = "+91-9876543231" },
                new Warehouse { Name = "Nagapattinam District Hub", Region = "Tamil Nadu", City = "Nagapattinam", Pincode = "611001", Address = "Port Road, Nagapattinam", ManagerName = "Radha Krishnan", ContactPhone = "+91-9876543232" },
                new Warehouse { Name = "Tiruvarur District Hub", Region = "Tamil Nadu", City = "Tiruvarur", Pincode = "610001", Address = "Main Road, Tiruvarur", ManagerName = "Deepa Rani", ContactPhone = "+91-9876543233" },
                new Warehouse { Name = "Pudukkottai District Hub", Region = "Tamil Nadu", City = "Pudukkottai", Pincode = "622001", Address = "Trichy Road, Pudukkottai", ManagerName = "Aravind Kumar", ContactPhone = "+91-9876543234" },
                
                // East Zone
                new Warehouse { Name = "Cuddalore District Hub", Region = "Tamil Nadu", City = "Cuddalore", Pincode = "607001", Address = "Bazaar Street, Cuddalore", ManagerName = "Lakshman Rao", ContactPhone = "+91-9876543235" },
                new Warehouse { Name = "Kallakurichi District Hub", Region = "Tamil Nadu", City = "Kallakurichi", Pincode = "606202", Address = "Main Road, Kallakurichi", ManagerName = "Sangeetha Devi", ContactPhone = "+91-9876543236" }
            };

            await _context.Warehouses.AddRangeAsync(warehouses);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Warehouses seeded successfully", count = warehouses.Count });
        }

        // POST: api/warehouse/geocode
        [HttpPost("geocode")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GeocodeWarehouses()
        {
            await _warehouseService.GeocodeWarehousesAsync();
            return Ok(new { message = "Warehouses geocoded successfully" });
        }

        // GET: api/warehouse/by-pincode/{pincode}
        [HttpGet("by-pincode/{pincode}")]
        public async Task<IActionResult> GetNearestWarehouseByPincode(string pincode)
        {
            var warehouse = await _warehouseService.FindNearestWarehouseByPincodeAsync(pincode);
            if (warehouse == null)
                return NotFound(new { message = "No warehouse found for this pincode" });

            return Ok(warehouse);
        }
    }
}
