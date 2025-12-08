using Backend.Data;
using Backend.Domain.Entity;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Endpoints
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly RouteOptimizationService _optimizationService;
        private readonly GeocodingService _geocodingService;
        private readonly WarehouseAssignmentService _warehouseService;

        public OrdersController(
            AppDbContext context,
            RouteOptimizationService optimizationService,
            GeocodingService geocodingService,
            WarehouseAssignmentService warehouseService)
        {
            _context = context;
            _optimizationService = optimizationService;
            _geocodingService = geocodingService;
            _warehouseService = warehouseService;
        }

        // ------------------------------
        // CREATE ORDER (Sender)
        // ------------------------------

        [HttpPost]
        [Authorize(Roles = "Sender")]
        public async Task<IActionResult> CreateOrder(Order order)
        {
            try
            {
                // Fix DateTime for PostgreSQL
                if (order.ScheduledDate.HasValue)
                {
                    order.ScheduledDate = DateTime.SpecifyKind(order.ScheduledDate.Value, DateTimeKind.Utc);
                }

                // Get Sender ID
                var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
                var userId = int.Parse(userIdClaim?.Value ?? "0");
                order.SenderId = userId;

                order.Status = "PendingAssignment"; // for phase-2

                // ------------------------------
                // Geocode Pickup Address  
                // ------------------------------
                var pickupCoords = await _geocodingService.GetCoordinatesAsync(order.PickupAddress);

                if (pickupCoords.HasValue)
                {
                    order.PickupLatitude = pickupCoords.Value.Latitude;
                    order.PickupLongitude = pickupCoords.Value.Longitude;
                }
                else if (!string.IsNullOrEmpty(order.ReceiverPhone))
                {
                    // Future: Lookup by phone number
                }

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();
                return Ok(order);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating order: {ex.Message}");
                return BadRequest(new
                {
                    message = ex.Message,
                    innerException = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        // ------------------------------
        // Utility: Distance Calculation
        // ------------------------------

        private double GetDistance(double lat1, double lon1, double lat2, double lon2)
        {
            var R = 6371; // Radius of earth
            var dLat = Deg2Rad(lat2 - lat1);
            var dLon = Deg2Rad(lon2 - lon1);

            var a =
                Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(Deg2Rad(lat1)) * Math.Cos(Deg2Rad(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c; // km
        }

        private double Deg2Rad(double deg)
        {
            return deg * (Math.PI / 180);
        }

        // ------------------------------
        // Pending Orders (Admin)
        // ------------------------------

        [HttpGet("pending")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPendingOrders()
        {
            var orders = await _context.Orders
                .Where(o => o.Status == "PendingAssignment")
                .ToListAsync();

            return Ok(orders);
        }

        // ------------------------------
        // Assigned Orders (Admin)
        // ------------------------------

        [HttpGet("assigned")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAssignedOrders()
        {
            var orders = await _context.Orders
                .Where(o => o.Status == "Assigned")
                .ToListAsync();

            return Ok(orders);
        }

        // ------------------------------
        // My Orders (Customer)
        // ------------------------------

        [HttpGet("my-orders")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetCustomerOrders()
        {
            var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");

            var orders = await _context.Orders
                .Where(o => o.CustomerId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }

        // ------------------------------
        // My Sent Orders (Sender)
        // ------------------------------

        [HttpGet("my-sent-orders")]
        [Authorize(Roles = "Sender")]
        public async Task<IActionResult> GetSenderOrders()
        {
            var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");

            var orders = await _context.Orders
                .Where(o => o.SenderId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }

        // ------------------------------
        // Assign Driver to Order (Admin)
        // ------------------------------

        // [HttpPost("{id}/assign-driver")]
        // [Authorize(Roles = "Admin")]
        // public async Task<IActionResult> AssignDriver(int id, [FromBody] int driverId)
        // {
        //     var order = await _context.Orders.FindAsync(id);
        //     if (order == null) return NotFound();

        //     var driver = await _context.Users.FindAsync(driverId);
        //     if (driver == null || driver.Role != "Driver")
        //         return BadRequest("Invalid driver.");

        //     order.DriverId = driverId;
        //     order.Status = "Assigned";
        //     await _context.SaveChangesAsync();

        //     // Trigger route optimization
        //     await _optimizationService.OptimizeRouteForDriver(driverId);

        //     return Ok(order);
        // }

        // ------------------------------
        // Approve Order (optional legacy)
        // ------------------------------

        [HttpPost("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();

            order.Status = "Approved";

            var driver = await _context.Users
                .FirstOrDefaultAsync(u => u.Role == "Driver" && u.IsAvailable);

            if (driver != null)
            {
                order.DriverId = driver.Id;
                order.Status = "Assigned";
                await _context.SaveChangesAsync();

                await _optimizationService.OptimizeRouteForDriver(driver.Id);
            }
            else
            {
                await _context.SaveChangesAsync();
            }

            return Ok(order);
        }
    }
}
