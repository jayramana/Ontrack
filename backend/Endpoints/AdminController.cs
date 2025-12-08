// // using Backend.Data;
// // using Backend.Domain.Entity;
// // using Microsoft.AspNetCore.Authorization;
// // using Microsoft.AspNetCore.Mvc;
// // using Microsoft.EntityFrameworkCore;

// // namespace Backend.Endpoints
// // {
// //     [ApiController]
// //     [Route("api/[controller]")]
// //     public class AdminController : ControllerBase
// //     {
// //         private readonly AppDbContext _context;
// //         private readonly Backend.Services.RouteOptimizationService _optimizationService;

// //         public AdminController(AppDbContext context, Backend.Services.RouteOptimizationService optimizationService)
// //         {
// //             _context = context;
// //             _optimizationService = optimizationService;
// //         }

// //         [HttpGet("dashboard")]
// //         [Authorize(Roles = "Admin")]
// //         public async Task<IActionResult> GetDashboardData()
// //         {
// //             var drivers = await _context.Users
// //                 .Where(u => u.Role == "Driver")
// //                 .Select(u => new { u.Id, u.Name, u.CurrentLatitude, u.CurrentLongitude, u.IsAvailable })
// //                 .ToListAsync();

// //             var activeOrders = await _context.Orders
// //                 .Where(o => o.Status != "Delivered")
// //                 .Include(o => o.Driver)
// //                 .ToListAsync();

// //             var issues = await _context.RoadIssues
// //                 .Where(i => i.Status == "Active")
// //                 .Include(i => i.Driver)
// //                 .ToListAsync();

// //             return Ok(new
// //             {
// //                 Drivers = drivers,
// //                 Orders = activeOrders,
// //             });
// //         }

// //         // STEP C: ASSIGN DRIVER + PUSH ROUTE UPDATE
// //         // -------------------------------------------
// //         [HttpPost("assign-driver/{orderId}/{driverId}")]
// //         public async Task<IActionResult> AssignDriver(int orderId, int driverId)
// //         {
// //             var order = await _context.Orders.FindAsync(orderId);
// //             if (order == null)
// //                 return NotFound(new { message = "Order not found" });

// //             order.DriverId = driverId;
// //             order.Status = "Assigned";
// //             await _context.SaveChangesAsync();

// //             // Generate optimized route for this driver
// //             var optimizedRoute = await _routeService.GetOptimizedRouteForDriver(driverId);

// //             // Push update via SignalR
// //             await _hubContext.Clients
// //                 .Group($"Driver_{driverId}_Route")
// //                 .SendAsync("ReceiveRouteUpdate", optimizedRoute);

// //             return Ok(new
// //             {
// //                 message = "Driver assigned successfully and route pushed",
// //                 route = optimizedRoute
// //             });
// //         }

// //         [HttpGet("drivers")]
// //         [Authorize(Roles = "Admin")]
// //         public async Task<IActionResult> GetDrivers()
// //         {
// //             var drivers = await _context.Users
// //                 .Where(u => u.Role == "Driver")
// //                 .Select(u => new { u.Id, u.Name, u.IsAvailable })
// //                 .ToListAsync();
// //             return Ok(drivers);
// //         }

// //         [HttpPost("seed-demo-data")]
// //         public async Task<IActionResult> SeedDemoData()
// //         {
// //             // 1. Get or Create a Sender and Driver
// //             var sender = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Sender");
// //             if (sender == null)
// //             {
// //                 sender = new User { Name = "Demo Sender", Email = "sender@demo.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Sender" };
// //                 _context.Users.Add(sender);
// //                 await _context.SaveChangesAsync();
// //             }
// //             else
// //             {
// //                 // Ensure password is correct (fix for previous bad seed)
// //                 sender.PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123");
// //                 await _context.SaveChangesAsync();
// //             }

// //             var driver = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Driver");
// //             if (driver == null)
// //             {
// //                 driver = new User { Name = "Demo Driver", Email = "driver@demo.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Driver", IsAvailable = true };
// //                 _context.Users.Add(driver);
// //                 await _context.SaveChangesAsync();
// //             }
// //             else
// //             {
// //                  driver.PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123");
// //                  await _context.SaveChangesAsync();
// //             }

// //             // 2. Create 10 Dummy Orders
// //             var orders = new List<Order>();
// //             var random = new Random();
// //             double baseLat = 13.0827;
// //             double baseLng = 80.2707;
            
// //             // TEMP: Warehouse feature disabled
// //             // var warehouse = await _context.Warehouses.FirstOrDefaultAsync();
// //             // int? warehouseId = warehouse?.Id;

// //             for (int i = 0; i < 10; i++)
// //             {
// //                 orders.Add(new Order
// //                 {
// //                     SenderId = sender.Id,
// //                     PickupAddress = $"Pickup Location {i + 1}",
// //                     PickupLatitude = baseLat + (random.NextDouble() * 0.1 - 0.05),
// //                     PickupLongitude = baseLng + (random.NextDouble() * 0.1 - 0.05),
// //                     ReceiverAddress = $"Delivery Location {i + 1}",
// //                     DeliveryLatitude = baseLat + (random.NextDouble() * 0.1 - 0.05),
// //                     DeliveryLongitude = baseLng + (random.NextDouble() * 0.1 - 0.05),
// //                     ParcelSize = "Medium",
// //                     ReceiverName = $"Receiver {i + 1}",
// //                     ReceiverPhone = "1234567890",
// //                     Status = "Approved",
// //                     DriverId = driver.Id
// //                     // TEMP: Warehouse fields disabled
// //                     // OriginWarehouseId = warehouseId,
// //                     // CurrentWarehouseId = warehouseId,
// //                     // DestinationWarehouseId = warehouseId
// //                 });
// //             }

// //             _context.Orders.AddRange(orders);
// //             await _context.SaveChangesAsync();

// //             // 3. Trigger Optimization
// //             await _optimizationService.OptimizeRouteForDriver(driver.Id);

// //             return Ok(new { message = "Seeded 10 orders and optimized route", driverId = driver.Id });
// //         }
// //     }
// // }


// using Backend.Data;
// using Backend.Domain.Entity;
// using Backend.Hubs;
// using Backend.Services;
// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.AspNetCore.SignalR;
// using Microsoft.EntityFrameworkCore;

// namespace Backend.Endpoints
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     public class AdminController : ControllerBase
//     {
//         private readonly AppDbContext _context;
//         private readonly RouteOptimizationService _optimizationService;

//         // ✅ FIXED: Missing services
//         private readonly DriverRouteOptimizationService _routeService;
//         private readonly IHubContext<LogisticsHub> _hubContext;

//         // ✅ FIXED: Updated constructor
//         public AdminController(
//             AppDbContext context,
//             RouteOptimizationService optimizationService,
//             DriverRouteOptimizationService routeService,
//             IHubContext<LogisticsHub> hubContext
//         )
//         {
//             _context = context;
//             _optimizationService = optimizationService;
//             _routeService = routeService;      // FIXED
//             _hubContext = hubContext;          // FIXED
//         }

//         // ===========================================================
//         // ADMIN DASHBOARD DATA
//         // ===========================================================
//         [HttpGet("dashboard")]
//         [Authorize(Roles = "Admin")]
//         public async Task<IActionResult> GetDashboardData()
//         {
//             var drivers = await _context.Users
//                 .Where(u => u.Role == "Driver")
//                 .Select(u => new { u.Id, u.Name, u.CurrentLatitude, u.CurrentLongitude, u.IsAvailable })
//                 .ToListAsync();

//             var activeOrders = await _context.Orders
//                 .Where(o => o.Status != "Delivered")
//                 .Include(o => o.Driver)
//                 .ToListAsync();

//             return Ok(new
//             {
//                 Drivers = drivers,
//                 Orders = activeOrders
//             });
//         }

//         // ===========================================================
//         // STEP C: ASSIGN DRIVER + PUSH LIVE ROUTE UPDATE
//         // ===========================================================
//         [HttpPost("assign-driver/{orderId}/{driverId}")]
//         public async Task<IActionResult> AssignDriver(int orderId, int driverId)
//         {
//             var order = await _context.Orders.FindAsync(orderId);
//             if (order == null)
//                 return NotFound(new { message = "Order not found" });

//             order.DriverId = driverId;
//             order.Status = "Assigned";
//             await _context.SaveChangesAsync();

//             // 1️⃣ Generate Optimized Route
//             var optimizedRoute = await _routeService.GetOptimizedRouteForDriver(driverId);

//             // 2️⃣ Push Live Route Update via SignalR
//             await _hubContext.Clients
//                 .Group($"driver_{driverId}_route")   // MUST match LogisticsHub
//                 .SendAsync("ReceiveRouteUpdate", optimizedRoute);

//             return Ok(new
//             {
//                 message = "Driver assigned & route updated",
//                 route = optimizedRoute
//             });
//         }

//         // ===========================================================
//         // LIST DRIVERS
//         // ===========================================================
//         [HttpGet("drivers")]
//         [Authorize(Roles = "Admin")]
//         public async Task<IActionResult> GetDrivers()
//         {
//             var drivers = await _context.Users
//                 .Where(u => u.Role == "Driver")
//                 .Select(u => new { u.Id, u.Name, u.IsAvailable })
//                 .ToListAsync();

//             return Ok(drivers);
//         }

//         // ===========================================================
//         // SEED DEMO DATA
//         // ===========================================================
//         [HttpPost("seed-demo-data")]
//         public async Task<IActionResult> SeedDemoData()
//         {
//             // Create or update Sender
//             var sender = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Sender");
//             if (sender == null)
//             {
//                 sender = new User
//                 {
//                     Name = "Demo Sender",
//                     Email = "sender@demo.com",
//                     PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
//                     Role = "Sender"
//                 };
//                 _context.Users.Add(sender);
//                 await _context.SaveChangesAsync();
//             }
//             else
//             {
//                 sender.PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123");
//                 await _context.SaveChangesAsync();
//             }

//             // Create or update Driver
//             var driver = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Driver");
//             if (driver == null)
//             {
//                 driver = new User
//                 {
//                     Name = "Demo Driver",
//                     Email = "driver@demo.com",
//                     PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
//                     Role = "Driver",
//                     IsAvailable = true
//                 };
//                 _context.Users.Add(driver);
//                 await _context.SaveChangesAsync();
//             }
//             else
//             {
//                 driver.PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123");
//                 await _context.SaveChangesAsync();
//             }

//             // Generate sample orders
//             var orders = new List<Order>();
//             var random = new Random();
//             double baseLat = 13.0827;
//             double baseLng = 80.2707;

//             for (int i = 0; i < 10; i++)
//             {
//                 orders.Add(new Order
//                 {
//                     SenderId = sender.Id,
//                     PickupAddress = $"Pickup Location {i + 1}",
//                     PickupLatitude = baseLat + (random.NextDouble() * 0.1 - 0.05),
//                     PickupLongitude = baseLng + (random.NextDouble() * 0.1 - 0.05),
//                     ReceiverAddress = $"Delivery Location {i + 1}",
//                     DeliveryLatitude = baseLat + (random.NextDouble() * 0.1 - 0.05),
//                     DeliveryLongitude = baseLng + (random.NextDouble() * 0.1 - 0.05),
//                     ParcelSize = "Medium",
//                     ReceiverName = $"Receiver {i + 1}",
//                     ReceiverPhone = "1234567890",
//                     Status = "Approved",
//                     DriverId = driver.Id
//                 });
//             }

//             _context.Orders.AddRange(orders);
//             await _context.SaveChangesAsync();

//             // Optimize route
//             await _optimizationService.OptimizeRouteForDriver(driver.Id);

//             return Ok(new
//             {
//                 message = "Demo data created",
//                 driverId = driver.Id
//             });
//         }
//     }
// }


using Backend.Data;
using Backend.Domain.Entity;
using Backend.Hubs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Backend.Endpoints
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly RouteOptimizationService _optimizationService;
        private readonly DriverRouteOptimizationService _routeService;
        private readonly IHubContext<LogisticsHub> _hubContext;

        public AdminController(
            AppDbContext context,
            RouteOptimizationService optimizationService,
            DriverRouteOptimizationService routeService,
            IHubContext<LogisticsHub> hubContext
        )
        {
            _context = context;
            _optimizationService = optimizationService;
            _routeService = routeService;
            _hubContext = hubContext;
        }

        // ================= DASHBOARD ======================
        [HttpGet("dashboard")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetDashboardData()
        {
            var drivers = await _context.Users
                .Where(u => u.Role == "Driver")
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.CurrentLatitude,
                    u.CurrentLongitude,
                    u.IsAvailable
                })
                .ToListAsync();

            var activeOrders = await _context.Orders
                .Where(o => o.Status != "Delivered")
                .Include(o => o.Driver)
                .ToListAsync();

            return Ok(new
            {
                Drivers = drivers,
                Orders = activeOrders
            });
        }

        // =============== STEP C: ASSIGN DRIVER ===============
        [HttpPost("assign-driver/{orderId}/{driverId}")]
        public async Task<IActionResult> AssignDriver(int orderId, int driverId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                return NotFound(new { message = "Order not found" });

            order.DriverId = driverId;
            order.Status = "Assigned";
            await _context.SaveChangesAsync();

            // Generate route for this driver
            var optimizedRoute = await _routeService.GenerateRouteForDriver(driverId);

            // Broadcast route to driver group
            await _hubContext.Clients
                .Group($"Driver_{driverId}_Route") // MUST match LogisticsHub
                .SendAsync("ReceiveRouteUpdate", optimizedRoute);

            return Ok(new
            {
                message = "Driver assigned successfully & route pushed",
                route = optimizedRoute
            });
        }

        // =============== LIST DRIVERS ==================
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

        // =============== SEED DEMO DATA ==================
        [HttpPost("seed-demo-data")]
        public async Task<IActionResult> SeedDemoData()
        {
            var sender = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Sender") ??
                new User
                {
                    Name = "Demo Sender",
                    Email = "sender@demo.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Role = "Sender"
                };

            var driver = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Driver") ??
                new User
                {
                    Name = "Demo Driver",
                    Email = "driver@demo.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Role = "Driver",
                    IsAvailable = true
                };

            if (sender.Id == 0) _context.Users.Add(sender);
            if (driver.Id == 0) _context.Users.Add(driver);
            await _context.SaveChangesAsync();

            var orders = new List<Order>();
            var random = new Random();
            double baseLat = 13.0827;
            double baseLng = 80.2707;

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
                });
            }

            _context.Orders.AddRange(orders);
            await _context.SaveChangesAsync();

            await _optimizationService.OptimizeRouteForDriver(driver.Id);

            return Ok(new
            {
                message = "Demo data seeded successfully",
                driverId = driver.Id
            });
        }
    }
}
