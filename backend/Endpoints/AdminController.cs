using Backend.Data;
using Backend.Domain.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Endpoints
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly Backend.Services.RouteOptimizationService _optimizationService;

        public AdminController(AppDbContext context, Backend.Services.RouteOptimizationService optimizationService)
        {
            _context = context;
            _optimizationService = optimizationService;
        }

        [HttpGet("dashboard")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetDashboardData()
        {
            var drivers = await _context.Users
                .Where(u => u.Role == "Driver")
                .Select(u => new { u.Id, u.Name, u.CurrentLatitude, u.CurrentLongitude, u.IsAvailable })
                .ToListAsync();

            var activeOrders = await _context.Orders
                .Where(o => o.Status != "Delivered")
                .Include(o => o.Driver)
                .ToListAsync();

            var issues = await _context.RoadIssues
                .Where(i => i.Status == "Active")
                .Include(i => i.Driver)
                .ToListAsync();

            return Ok(new
            {
                Drivers = drivers,
                Orders = activeOrders,
            });
        }

        [HttpGet("drivers")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetDrivers()
        {
            var drivers = await _context.Users
                .Where(u => u.Role == "Driver")
                .Select(u => new { u.Id, u.Name, u.IsAvailable })
                .ToListAsync();
            return Ok(drivers);
        }

        [HttpPost("seed-demo-data")]
        public async Task<IActionResult> SeedDemoData()
        {
            // 1. Get or Create a Sender and Driver
            var sender = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Sender");
            if (sender == null)
            {
                sender = new User { Name = "Demo Sender", Email = "sender@demo.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Sender" };
                _context.Users.Add(sender);
                await _context.SaveChangesAsync();
            }
            else
            {
                // Ensure password is correct (fix for previous bad seed)
                sender.PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123");
                await _context.SaveChangesAsync();
            }

            var driver = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Driver");
            if (driver == null)
            {
                driver = new User { Name = "Demo Driver", Email = "driver@demo.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Driver", IsAvailable = true };
                _context.Users.Add(driver);
                await _context.SaveChangesAsync();
            }
            else
            {
                 driver.PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123");
                 await _context.SaveChangesAsync();
            }

            // 2. Create 10 Dummy Orders
            var orders = new List<Order>();
            var random = new Random();
            double baseLat = 13.0827;
            double baseLng = 80.2707;
            
            // TEMP: Warehouse feature disabled
            // var warehouse = await _context.Warehouses.FirstOrDefaultAsync();
            // int? warehouseId = warehouse?.Id;

            for (int i = 0; i < 10; i++)
            {
                orders.Add(new Order
                {
                    SenderId = sender.Id,
                    PickupAddress = $"Pickup Location {i + 1}",
                    PickupLatitude = baseLat + (random.NextDouble() * 0.1 - 0.05),
                    PickupLongitude = baseLng + (random.NextDouble() * 0.1 - 0.05),
                    ReceiverAddress = $"Delivery Location {i + 1}",
                    DeliveryLatitude = baseLat + (random.NextDouble() * 0.1 - 0.05),
                    DeliveryLongitude = baseLng + (random.NextDouble() * 0.1 - 0.05),
                    ParcelSize = "Medium",
                    ReceiverName = $"Receiver {i + 1}",
                    ReceiverPhone = "1234567890",
                    Status = "Approved",
                    DriverId = driver.Id
                    // TEMP: Warehouse fields disabled
                    // OriginWarehouseId = warehouseId,
                    // CurrentWarehouseId = warehouseId,
                    // DestinationWarehouseId = warehouseId
                });
            }

            _context.Orders.AddRange(orders);
            await _context.SaveChangesAsync();

            // 3. Trigger Optimization
            await _optimizationService.OptimizeRouteForDriver(driver.Id);

            return Ok(new { message = "Seeded 10 orders and optimized route", driverId = driver.Id });
        }
    }
}
