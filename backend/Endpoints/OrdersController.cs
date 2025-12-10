// // // // using Backend.Data;
// // // // using Backend.Domain.Entity;
// // // // using Backend.Services;
// // // // using Microsoft.AspNetCore.Authorization;
// // // // using Microsoft.AspNetCore.Mvc;
// // // // using Microsoft.EntityFrameworkCore;
// // // // using System.Security.Claims;

// // // // namespace Backend.Endpoints
// // // // {
// // // //     [ApiController]
// // // //     [Route("api/[controller]")]
// // // //     public class OrdersController : ControllerBase
// // // //     {
// // // //         private readonly AppDbContext _context;
// // // //         private readonly RouteOptimizationService _optimizationService;
// // // //         private readonly GeocodingService _geocodingService;
// // // //         private readonly WarehouseAssignmentService _warehouseService;

// // // //         public OrdersController(
// // // //             AppDbContext context,
// // // //             RouteOptimizationService optimizationService,
// // // //             GeocodingService geocodingService,
// // // //             WarehouseAssignmentService warehouseService)
// // // //         {
// // // //             _context = context;
// // // //             _optimizationService = optimizationService;
// // // //             _geocodingService = geocodingService;
// // // //             _warehouseService = warehouseService;
// // // //         }

// // // //         // ------------------------------
// // // //         // CREATE ORDER (Sender)
// // // //         // ------------------------------

// // // //         // [HttpPost]
// // // //         // [Authorize(Roles = "Sender")]
// // // //         // public async Task<IActionResult> CreateOrder(Order order)
// // // //         // {
// // // //         //     try
// // // //         //     {
// // // //         //         // Fix DateTime for PostgreSQL
// // // //         //         if (order.ScheduledDate.HasValue)
// // // //         //         {
// // // //         //             order.ScheduledDate = DateTime.SpecifyKind(order.ScheduledDate.Value, DateTimeKind.Utc);
// // // //         //         }

// // // //         //         // Get Sender ID
// // // //         //         var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
// // // //         //         var userId = int.Parse(userIdClaim?.Value ?? "0");
// // // //         //         order.SenderId = userId;

// // // //         //         order.Status = "PendingAssignment"; // for phase-2

// // // //         //         // ------------------------------
// // // //         //         // Geocode Pickup Address  
// // // //         //         // ------------------------------
// // // //         //         var pickupCoords = await _geocodingService.GetCoordinatesAsync(order.PickupAddress);

// // // //         //         if (pickupCoords.HasValue)
// // // //         //         {
// // // //         //             order.PickupLatitude = pickupCoords.Value.Latitude;
// // // //         //             order.PickupLongitude = pickupCoords.Value.Longitude;
// // // //         //         }
// // // //         //         else if (!string.IsNullOrEmpty(order.ReceiverPhone))
// // // //         //         {
// // // //         //             // Future: Lookup by phone number
// // // //         //         }

// // // //         //         _context.Orders.Add(order);
// // // //         //         await _context.SaveChangesAsync();
// // // //         //         return Ok(order);
// // // //         //     }
// // // //         //     catch (Exception ex)
// // // //         //     {
// // // //         //         Console.WriteLine($"Error creating order: {ex.Message}");
// // // //         //         return BadRequest(new
// // // //         //         {
// // // //         //             message = ex.Message,
// // // //         //             innerException = ex.InnerException?.Message,
// // // //         //             stackTrace = ex.StackTrace
// // // //         //         });
// // // //         //     }
// // // //         // }

// // // //         // Backend/Endpoints/OrdersController.cs (only the CreateOrder method and small helpers shown)
// // // // // [HttpPost]
// // // // // [Authorize(Roles = "Sender")]
// // // // // public async Task<IActionResult> CreateOrder(Order order)
// // // // // {
// // // // //     try
// // // // //     {
// // // // //         // Fix DateTime for PostgreSQL
// // // // //         if (order.ScheduledDate.HasValue)
// // // // //         {
// // // // //             order.ScheduledDate = DateTime.SpecifyKind(order.ScheduledDate.Value, DateTimeKind.Utc);
// // // // //         }

// // // // //         // Get Sender ID from token
// // // // //         var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
// // // // //         var userId = int.Parse(userIdClaim?.Value ?? "0");
// // // // //         order.SenderId = userId;

// // // // //         // Default status
// // // // //         order.Status = "PendingAssignment";

// // // // //         // If pickup coordinates NOT provided -> attempt geocoding using address
// // // // //         var pickupCoordsProvided = !(order.PickupLatitude == 0 && order.PickupLongitude == 0) && !(order.PickupLatitude == 0.0 && order.PickupLongitude == 0.0);
// // // // //         if (!pickupCoordsProvided)
// // // // //         {
// // // // //             if (!string.IsNullOrWhiteSpace(order.PickupAddress))
// // // // //             {
// // // // //                 var pickupCoords = await _geocodingService.GetCoordinatesAsync(order.PickupAddress);
// // // // //                 if (pickupCoords.HasValue)
// // // // //                 {
// // // // //                     order.PickupLatitude = pickupCoords.Value.Latitude;
// // // // //                     order.PickupLongitude = pickupCoords.Value.Longitude;
// // // // //                     // Try to fill pincode if empty
// // // // //                     if (string.IsNullOrWhiteSpace(order.PickupPincode))
// // // // //                     {
// // // // //                         var pinCoords = await _geocodingService.GetPincodeFromAddressAsync(order.PickupAddress);
// // // // //                         if (!string.IsNullOrWhiteSpace(pinCoords)) order.PickupPincode = pinCoords;
// // // // //                     }
// // // // //                 }
// // // // //                 else
// // // // //                 {
                    
// // // // //                     order.PickupLatitude = 0;
// // // // //                     order.PickupLongitude = 0;
// // // // //                 }
// // // // //             }
// // // // //         }

// // // // //         // Delivery / receiver coordinates fallback (same logic)
// // // // //         var deliveryCoordsProvided = !(order.DeliveryLatitude == 0 && order.DeliveryLongitude == 0);
// // // // //         if (!deliveryCoordsProvided)
// // // // //         {
// // // // //             if (!string.IsNullOrWhiteSpace(order.ReceiverAddress))
// // // // //             {
// // // // //                 var deliveryCoords = await _geocodingService.GetCoordinatesAsync(order.ReceiverAddress);
// // // // //                 if (deliveryCoords.HasValue)
// // // // //                 {
// // // // //                     order.DeliveryLatitude = deliveryCoords.Value.Latitude;
// // // // //                     order.DeliveryLongitude = deliveryCoords.Value.Longitude;
// // // // //                     if (string.IsNullOrWhiteSpace(order.DeliveryPincode))
// // // // //                     {
// // // // //                         var pin = await _geocodingService.GetPincodeFromAddressAsync(order.ReceiverAddress);
// // // // //                         if (!string.IsNullOrWhiteSpace(pin)) order.DeliveryPincode = pin;
// // // // //                     }
// // // // //                 }
// // // // //                 else
// // // // //                 {
// // // // //                     order.DeliveryLatitude = 0;
// // // // //                     order.DeliveryLongitude = 0;
// // // // //                 }
// // // // //             }
// // // // //         }

// // // // //         _context.Orders.Add(order);
// // // // //         await _context.SaveChangesAsync();

// // // // //         return Ok(order);
// // // // //     }
// // // // //     catch (Exception ex)
// // // // //     {
// // // // //         Console.WriteLine($"Error creating order: {ex.Message}");
// // // // //         return BadRequest(new
// // // // //         {
// // // // //             message = ex.Message,
// // // // //             innerException = ex.InnerException?.Message,
// // // // //             stackTrace = ex.StackTrace
// // // // //         });
// // // // //     }
// // // // // }


// // // // //         [HttpPost]
// // // // // [Authorize(Roles = "Sender")]
// // // // // public async Task<IActionResult> CreateOrder(Order order)
// // // // // {
// // // // //     try
// // // // //     {
// // // // //         if (order.ScheduledDate.HasValue)
// // // // //         {
// // // // //             order.ScheduledDate = DateTime.SpecifyKind(order.ScheduledDate.Value, DateTimeKind.Utc);
// // // // //         }

// // // // //         // Identify sender
// // // // //         var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
// // // // //         var userId = int.Parse(userIdClaim?.Value ?? "0");
// // // // //         order.SenderId = userId;

// // // // //         order.Status = "PendingAssignment";

// // // // //         // --------------------------------
// // // // //         // Assign customer from ReceiverEmail
// // // // //         // --------------------------------
// // // // //         if (!string.IsNullOrWhiteSpace(order.ReceiverEmail))
// // // // //         {
// // // // //             var customer = await _context.Users
// // // // //                 .FirstOrDefaultAsync(u => u.Email == order.ReceiverEmail && u.Role == "Customer");

// // // // //             if (customer != null)
// // // // //             {
// // // // //                 order.CustomerId = customer.Id;
// // // // //             }
// // // // //         }

// // // // //         // --------------------------------
// // // // //         // Geocode pickup if no coords
// // // // //         // --------------------------------
// // // // //         var pickupCoordsProvided = !(order.PickupLatitude == 0 && order.PickupLongitude == 0);

// // // // //         if (!pickupCoordsProvided && !string.IsNullOrWhiteSpace(order.PickupAddress))
// // // // //         {
// // // // //             var pickupCoords = await _geocodingService.GetCoordinatesAsync(order.PickupAddress);

// // // // //             if (pickupCoords.HasValue)
// // // // //             {
// // // // //                 order.PickupLatitude = pickupCoords.Value.Latitude;
// // // // //                 order.PickupLongitude = pickupCoords.Value.Longitude;
// // // // //             }
// // // // //         }

// // // // //         // --------------------------------
// // // // //         // Geocode delivery if no coords
// // // // //         // --------------------------------
// // // // //         var deliveryCoordsProvided = !(order.DeliveryLatitude == 0 && order.DeliveryLongitude == 0);

// // // // //         if (!deliveryCoordsProvided && !string.IsNullOrWhiteSpace(order.ReceiverAddress))
// // // // //         {
// // // // //             var deliveryCoords = await _geocodingService.GetCoordinatesAsync(order.ReceiverAddress);

// // // // //             if (deliveryCoords.HasValue)
// // // // //             {
// // // // //                 order.DeliveryLatitude = deliveryCoords.Value.Latitude;
// // // // //                 order.DeliveryLongitude = deliveryCoords.Value.Longitude;
// // // // //             }
// // // // //         }

// // // // //         _context.Orders.Add(order);
// // // // //         await _context.SaveChangesAsync();

// // // // //         return Ok(order);
// // // // //     }
// // // // //     catch (Exception ex)
// // // // //     {
// // // // //         return BadRequest(new
// // // // //         {
// // // // //             message = ex.Message,
// // // // //             innerException = ex.InnerException?.Message,
// // // // //             stackTrace = ex.StackTrace
// // // // //         });
// // // // //     }
// // // // // }

// // // // [HttpPost]
// // // // [Authorize(Roles = "Sender")]
// // // // public async Task<IActionResult> CreateOrder(Order order, [FromServices] IEmailService emailService)
// // // // {
// // // //     try
// // // //     {
// // // //         if (order.ScheduledDate.HasValue)
// // // //             order.ScheduledDate = DateTime.SpecifyKind(order.ScheduledDate.Value, DateTimeKind.Utc);

// // // //         // Identify sender (from token)
// // // //         var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
// // // //         var userId = int.Parse(userIdClaim?.Value ?? "0");
// // // //         order.SenderId = userId;

// // // //         // Generate Tracking ID
// // // //         order.TrackingId = Guid.NewGuid().ToString("N")[..10].ToUpper();

// // // //         // Auto-link customer if they already have an account
// // // //         if (!string.IsNullOrWhiteSpace(order.ReceiverEmail))
// // // //         {
// // // //             var customer = await _context.Users
// // // //                 .FirstOrDefaultAsync(u => u.Email == order.ReceiverEmail && u.Role == "Customer");

// // // //             if (customer != null)
// // // //                 order.CustomerId = customer.Id;
// // // //         }

// // // //         order.Status = "PendingAssignment";

// // // //         _context.Orders.Add(order);
// // // //         await _context.SaveChangesAsync();

// // // //         // SEND EMAILS
// // // //         await emailService.SendOrderEmailsAsync(order);

// // // //         return Ok(order);
// // // //     }
// // // //     catch (Exception ex)
// // // //     {
// // // //         return BadRequest(new
// // // //         {
// // // //             message = ex.Message,
// // // //             innerException = ex.InnerException?.Message,
// // // //             stackTrace = ex.StackTrace
// // // //         });
// // // //     }
// // // // }


// // // // [HttpGet("track-public/{trackingId}")]
// // // // [AllowAnonymous]
// // // // public async Task<IActionResult> TrackPublic(string trackingId)
// // // // {
// // // //     var order = await _context.Orders
// // // //         .Include(o => o.Driver)
// // // //         .FirstOrDefaultAsync(o => o.TrackingId == trackingId);

// // // //     if (order == null)
// // // //         return NotFound(new { message = "Invalid tracking ID" });

// // // //     var driverLocation = await _context.DriverLocations
// // // //         .Where(dl => dl.DriverId == order.DriverId)
// // // //         .OrderByDescending(dl => dl.UpdatedAt)
// // // //         .FirstOrDefaultAsync();

// // // //     return Ok(new
// // // //     {
// // // //         order,
// // // //         driverLocation = driverLocation != null ? new {
// // // //             latitude = driverLocation.Latitude,
// // // //             longitude = driverLocation.Longitude,
// // // //             updatedAt = driverLocation.UpdatedAt
// // // //         } : null
// // // //     });
// // // // }





// // // //         // ------------------------------
// // // //         // Utility: Distance Calculation
// // // //         // ------------------------------

// // // //         private double GetDistance(double lat1, double lon1, double lat2, double lon2)
// // // //         {
// // // //             var R = 6371; // Radius of earth
// // // //             var dLat = Deg2Rad(lat2 - lat1);
// // // //             var dLon = Deg2Rad(lon2 - lon1);

// // // //             var a =
// // // //                 Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
// // // //                 Math.Cos(Deg2Rad(lat1)) * Math.Cos(Deg2Rad(lat2)) *
// // // //                 Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

// // // //             var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
// // // //             return R * c; // km
// // // //         }

// // // //         private double Deg2Rad(double deg)
// // // //         {
// // // //             return deg * (Math.PI / 180);
// // // //         }

// // // //         // ------------------------------
// // // //         // Pending Orders (Admin)
// // // //         // ------------------------------

// // // //         [HttpGet("pending")]
// // // //         [Authorize(Roles = "Admin")]
// // // //         public async Task<IActionResult> GetPendingOrders()
// // // //         {
// // // //             var orders = await _context.Orders
// // // //                 .Where(o => o.Status == "PendingAssignment")
// // // //                 .ToListAsync();

// // // //             return Ok(orders);
// // // //         }

// // // //         // ------------------------------
// // // //         // Assigned Orders (Admin)
// // // //         // ------------------------------

// // // //         [HttpGet("assigned")]
// // // //         [Authorize(Roles = "Admin")]
// // // //         public async Task<IActionResult> GetAssignedOrders()
// // // //         {
// // // //             var orders = await _context.Orders
// // // //                 .Where(o => o.Status == "Assigned")
// // // //                 .ToListAsync();

// // // //             return Ok(orders);
// // // //         }

// // // //         // ------------------------------
// // // //         // My Orders (Customer)
// // // //         // ------------------------------

// // // //         [HttpGet("my-orders")]
// // // //         [Authorize(Roles = "Customer")]
// // // //         public async Task<IActionResult> GetCustomerOrders()
// // // //         {
// // // //             var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");

// // // //             var orders = await _context.Orders
// // // //                 .Where(o => o.CustomerId == userId)
// // // //                 .OrderByDescending(o => o.CreatedAt)
// // // //                 .ToListAsync();

// // // //             return Ok(orders);
// // // //         }

// // // //         // ------------------------------
// // // //         // My Sent Orders (Sender)
// // // //         // ------------------------------

// // // //         [HttpGet("my-sent-orders")]
// // // //         [Authorize(Roles = "Sender")]
// // // //         public async Task<IActionResult> GetSenderOrders()
// // // //         {
// // // //             var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");

// // // //             var orders = await _context.Orders
// // // //                 .Where(o => o.SenderId == userId)
// // // //                 .OrderByDescending(o => o.CreatedAt)
// // // //                 .ToListAsync();

// // // //             return Ok(orders);
// // // //         }

// // // //         // ------------------------------
// // // //         // Assign Driver to Order (Admin)
// // // //         // ------------------------------

// // // //         // [HttpPost("{id}/assign-driver")]
// // // //         // [Authorize(Roles = "Admin")]
// // // //         // public async Task<IActionResult> AssignDriver(int id, [FromBody] int driverId)
// // // //         // {
// // // //         //     var order = await _context.Orders.FindAsync(id);
// // // //         //     if (order == null) return NotFound();

// // // //         //     var driver = await _context.Users.FindAsync(driverId);
// // // //         //     if (driver == null || driver.Role != "Driver")
// // // //         //         return BadRequest("Invalid driver.");

// // // //         //     order.DriverId = driverId;
// // // //         //     order.Status = "Assigned";
// // // //         //     await _context.SaveChangesAsync();

// // // //         //     // Trigger route optimization
// // // //         //     await _optimizationService.OptimizeRouteForDriver(driverId);

// // // //         //     return Ok(order);
// // // //         // }

// // // //         // ------------------------------
// // // //         // Approve Order (optional legacy)
// // // //         // ------------------------------

// // // //         [HttpPost("{id}/approve")]
// // // //         [Authorize(Roles = "Admin")]
// // // //         public async Task<IActionResult> ApproveOrder(int id)
// // // //         {
// // // //             var order = await _context.Orders.FindAsync(id);
// // // //             if (order == null) return NotFound();

// // // //             order.Status = "Approved";

// // // //             var driver = await _context.Users
// // // //                 .FirstOrDefaultAsync(u => u.Role == "Driver" && u.IsAvailable);

// // // //             if (driver != null)
// // // //             {
// // // //                 order.DriverId = driver.Id;
// // // //                 order.Status = "Assigned";
// // // //                 await _context.SaveChangesAsync();

// // // //                 await _optimizationService.OptimizeRouteForDriver(driver.Id);
// // // //             }
// // // //             else
// // // //             {
// // // //                 await _context.SaveChangesAsync();
// // // //             }

// // // //             return Ok(order);
// // // //         }
// // // //     }
// // // // }


// // // using Backend.Data;
// // // using Backend.Domain.Entity;
// // // using Backend.Services;
// // // using Microsoft.AspNetCore.Authorization;
// // // using Microsoft.AspNetCore.Mvc;
// // // using Microsoft.EntityFrameworkCore;
// // // using System.Security.Claims;

// // // namespace Backend.Endpoints
// // // {
// // //     [ApiController]
// // //     [Route("api/[controller]")]
// // //     public class OrdersController : ControllerBase
// // //     {
// // //         private readonly AppDbContext _context;
// // //         private readonly RouteOptimizationService _optimizationService;

// // //         public OrdersController(
// // //             AppDbContext context,
// // //             RouteOptimizationService optimizationService)
// // //         {
// // //             _context = context;
// // //             _optimizationService = optimizationService;
// // //         }

// // //         // ---------------------------------------------------------------------
// // //         // CREATE ORDER (Sender)
// // //         // ---------------------------------------------------------------------
// // //         [HttpPost]
// // //         [Authorize(Roles = "Sender")]
// // //         public async Task<IActionResult> CreateOrder(
// // //             Order order,
// // //             [FromServices] IEmailService emailService)
// // //         {
// // //             try
// // //             {
// // //                 if (order.ScheduledDate.HasValue)
// // //                     order.ScheduledDate = DateTime.SpecifyKind(order.ScheduledDate.Value, DateTimeKind.Utc);

// // //                 // Sender ID from token
// // //                 var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
// // //                 order.SenderId = int.Parse(userIdClaim?.Value ?? "0");

// // //                 // Generate tracking ID (overwrite server-side for reliability)
// // //                 order.TrackingId = Guid.NewGuid().ToString("N")[..10].ToUpper();

// // //                 // Attach customer if exists
// // //                 if (!string.IsNullOrWhiteSpace(order.ReceiverEmail))
// // //                 {
// // //                     var customer = await _context.Users
// // //                         .FirstOrDefaultAsync(u => u.Email == order.ReceiverEmail && u.Role == "Customer");

// // //                     if (customer != null)
// // //                         order.CustomerId = customer.Id;
// // //                 }

// // //                 order.Status = "PendingAssignment";
// // //                 order.CreatedAt = DateTime.UtcNow;

// // //                 _context.Orders.Add(order);
// // //                 await _context.SaveChangesAsync();

// // //                 // -----------------------------------------------------------------
// // //                 // SEND EMAIL INCLUDING TRACKING LINK
// // //                 // -----------------------------------------------------------------
// // //                 await emailService.SendOrderEmailsAsync(order);

// // //                 // Return the full order with the tracking ID included
// // //                 return Ok(order);
// // //             }
// // //             catch (Exception ex)
// // //             {
// // //                 return BadRequest(new
// // //                 {
// // //                     message = ex.Message,
// // //                     innerException = ex.InnerException?.Message,
// // //                     stackTrace = ex.StackTrace
// // //                 });
// // //             }
// // //         }

// // //         // ---------------------------------------------------------------------
// // //         // PUBLIC TRACKING ENDPOINT
// // //         // ---------------------------------------------------------------------
// // //         [HttpGet("track-public/{trackingId}")]
// // //         [AllowAnonymous]
// // //         public async Task<IActionResult> TrackPublic(string trackingId)
// // //         {
// // //             var order = await _context.Orders
// // //                 .Include(o => o.Driver)
// // //                 .FirstOrDefaultAsync(o => o.TrackingId == trackingId);

// // //             if (order == null)
// // //                 return NotFound(new { message = "Invalid tracking ID" });

// // //             var driverLocation = await _context.DriverLocations
// // //                 .Where(dl => dl.DriverId == order.DriverId)
// // //                 .OrderByDescending(dl => dl.UpdatedAt)
// // //                 .FirstOrDefaultAsync();

// // //             return Ok(new
// // //             {
// // //                 order,
// // //                 driverLocation = driverLocation != null ? new
// // //                 {
// // //                     latitude = driverLocation.Latitude,
// // //                     longitude = driverLocation.Longitude,
// // //                     updatedAt = driverLocation.UpdatedAt
// // //                 } : null
// // //             });
// // //         }
        

// // //         // ---------------------------------------------------------------------
// // //         // CUSTOMER ORDERS
// // //         // ---------------------------------------------------------------------
// // //         [HttpGet("my-orders")]
// // //         [Authorize(Roles = "Customer")]
// // //         public async Task<IActionResult> GetCustomerOrders()
// // //         {
// // //             int userId = int.Parse(User.FindFirst("id")?.Value ?? "0");

// // //             var orders = await _context.Orders
// // //                 .Where(o => o.CustomerId == userId)
// // //                 .OrderByDescending(o => o.CreatedAt)
// // //                 .ToListAsync();

// // //             return Ok(orders);
// // //         }

// // //         // ---------------------------------------------------------------------
// // //         // SENDER ORDERS
// // //         // ---------------------------------------------------------------------
// // //         [HttpGet("my-sent-orders")]
// // //         [Authorize(Roles = "Sender")]
// // //         public async Task<IActionResult> GetSenderOrders()
// // //         {
// // //             int userId = int.Parse(User.FindFirst("id")?.Value ?? "0");

// // //             var orders = await _context.Orders
// // //                 .Where(o => o.SenderId == userId)
// // //                 .OrderByDescending(o => o.CreatedAt)
// // //                 .ToListAsync();

// // //             return Ok(orders);
// // //         }
// // //     }
// // // }


// // using Backend.Data;
// // using Backend.Domain.Entity;
// // using Backend.Services;
// // using Microsoft.AspNetCore.Authorization;
// // using Microsoft.AspNetCore.Mvc;
// // using Microsoft.EntityFrameworkCore;
// // using System.Security.Claims;

// // namespace Backend.Endpoints
// // {
// //     [ApiController]
// //     [Route("api/[controller]")]
// //     public class OrdersController : ControllerBase
// //     {
// //         private readonly AppDbContext _context;
// //         private readonly RouteOptimizationService _optimizationService;

// //         public OrdersController(
// //             AppDbContext context,
// //             RouteOptimizationService optimizationService)
// //         {
// //             _context = context;
// //             _optimizationService = optimizationService;
// //         }

// //         // ---------------------------------------------------------------------
// //         // CREATE ORDER (Sender)
// //         // ---------------------------------------------------------------------
// //         [HttpPost]
// //         [Authorize(Roles = "Sender")]
// //         public async Task<IActionResult> CreateOrder(
// //             Order order,
// //             [FromServices] IEmailService emailService)
// //         {
// //             try
// //             {
// //                 if (order.ScheduledDate.HasValue)
// //                     order.ScheduledDate = DateTime.SpecifyKind(order.ScheduledDate.Value, DateTimeKind.Utc);

// //                 // Sender ID from token
// //                 var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
// //                 order.SenderId = int.Parse(userIdClaim?.Value ?? "0");

// //                 // Generate tracking ID (overwrite server-side for reliability)
// //                 order.TrackingId = Guid.NewGuid().ToString("N")[..10].ToUpper();

// //                 // Attach customer if exists
// //                 if (!string.IsNullOrWhiteSpace(order.ReceiverEmail))
// //                 {
// //                     var customer = await _context.Users
// //                         .FirstOrDefaultAsync(u => u.Email == order.ReceiverEmail && u.Role == "Customer");

// //                     if (customer != null)
// //                         order.CustomerId = customer.Id;
// //                 }

// //                 order.Status = "PendingAssignment";
// //                 order.CreatedAt = DateTime.UtcNow;

// //                 _context.Orders.Add(order);
// //                 await _context.SaveChangesAsync();

// //                 // Send email including tracking link
// //                 await emailService.SendOrderEmailsAsync(order);

// //                 // Return the full order with the tracking ID included
// //                 return Ok(order);
// //             }
// //             catch (Exception ex)
// //             {
// //                 return BadRequest(new
// //                 {
// //                     message = ex.Message,
// //                     innerException = ex.InnerException?.Message,
// //                     stackTrace = ex.StackTrace
// //                 });
// //             }
// //         }

// //         // ---------------------------------------------------------------------
// //         // PUBLIC TRACKING ENDPOINT
// //         // ---------------------------------------------------------------------
// //         [HttpGet("track-public/{trackingId}")]
// //         [AllowAnonymous]
// //         public async Task<IActionResult> TrackPublic(string trackingId)
// //         {
// //             var order = await _context.Orders
// //                 .Include(o => o.Driver)
// //                 .Include(o => o.OriginWarehouse)
// //                 .Include(o => o.CurrentWarehouse)
// //                 .Include(o => o.DestinationWarehouse)
// //                 .FirstOrDefaultAsync(o => o.TrackingId == trackingId);

// //             if (order == null)
// //                 return NotFound(new { message = "Invalid tracking ID" });

// //             var driverLocation = await _context.DriverLocations
// //                 .Where(dl => dl.DriverId == order.DriverId)
// //                 .OrderByDescending(dl => dl.UpdatedAt)
// //                 .FirstOrDefaultAsync();

// //             return Ok(new
// //             {
// //                 order = new
// //                 {
// //                     order.Id,
// //                     order.TrackingId,
// //                     order.Status,
// //                     order.ReceiverName,
// //                     order.ReceiverAddress,
// //                     order.PickupAddress,
// //                     order.EstimatedDeliveryDate,
// //                     order.CreatedAt,
// //                     driver = order.Driver != null ? new
// //                     {
// //                         order.Driver.Id,
// //                         order.Driver.Name
// //                     } : null,
// //                     originWarehouse = order.OriginWarehouse != null ? new
// //                     {
// //                         order.OriginWarehouse.Id,
// //                         order.OriginWarehouse.Name,
// //                         order.OriginWarehouse.City
// //                     } : null,
// //                     currentWarehouse = order.CurrentWarehouse != null ? new
// //                     {
// //                         order.CurrentWarehouse.Id,
// //                         order.CurrentWarehouse.Name,
// //                         order.CurrentWarehouse.City
// //                     } : null,
// //                     destinationWarehouse = order.DestinationWarehouse != null ? new
// //                     {
// //                         order.DestinationWarehouse.Id,
// //                         order.DestinationWarehouse.Name,
// //                         order.DestinationWarehouse.City
// //                     } : null
// //                 },
// //                 driverLocation = driverLocation != null ? new
// //                 {
// //                     latitude = driverLocation.Latitude,
// //                     longitude = driverLocation.Longitude,
// //                     updatedAt = driverLocation.UpdatedAt
// //                 } : null
// //             });
// //         }

// //         // ---------------------------------------------------------------------
// //         // PENDING ORDERS (Admin)
// //         // ---------------------------------------------------------------------
// //         [HttpGet("pending")]
// //         [Authorize(Roles = "Admin")]
// //         public async Task<IActionResult> GetPendingOrders()
// //         {
// //             var orders = await _context.Orders
// //                 .Where(o => o.Status == "PendingAssignment")
// //                 .Include(o => o.Driver)
// //                 .Include(o => o.OriginWarehouse)
// //                 .Include(o => o.CurrentWarehouse)
// //                 .Include(o => o.DestinationWarehouse)
// //                 .OrderByDescending(o => o.CreatedAt)
// //                 .Select(o => new
// //                 {
// //                     o.Id,
// //                     o.TrackingId,
// //                     o.Status,
// //                     o.SenderName,
// //                     o.PickupAddress,
// //                     o.ReceiverName,
// //                     o.ReceiverAddress,
// //                     o.CreatedAt,
// //                     o.EstimatedDeliveryDate,
// //                     driverId = o.DriverId,
// // driverName = o.Driver != null ? o.Driver.Name : null,

// //                     originWarehouse = o.OriginWarehouse != null ? new
// //                     {
// //                         o.OriginWarehouse.Id,
// //                         o.OriginWarehouse.Name,
// //                         o.OriginWarehouse.City
// //                     } : null,
// //                     currentWarehouse = o.CurrentWarehouse != null ? new
// //                     {
// //                         o.CurrentWarehouse.Id,
// //                         o.CurrentWarehouse.Name,
// //                         o.CurrentWarehouse.City
// //                     } : null,
// //                     destinationWarehouse = o.DestinationWarehouse != null ? new
// //                     {
// //                         o.DestinationWarehouse.Id,
// //                         o.DestinationWarehouse.Name,
// //                         o.DestinationWarehouse.City
// //                     } : null
// //                 })
// //                 .ToListAsync();

// //             return Ok(orders);
// //         }

// //         // ---------------------------------------------------------------------
// //         // ASSIGNED ORDERS (Admin)
// //         // ---------------------------------------------------------------------
// //         [HttpGet("assigned")]
// //         [Authorize(Roles = "Admin")]
// //         public async Task<IActionResult> GetAssignedOrders()
// //         {
// //             var orders = await _context.Orders
// //                 .Where(o => o.Status == "Assigned")
// //                 .Include(o => o.Driver)
// //                 .Include(o => o.OriginWarehouse)
// //                 .Include(o => o.CurrentWarehouse)
// //                 .Include(o => o.DestinationWarehouse)
// //                 .OrderByDescending(o => o.CreatedAt)
// //                 .Select(o => new
// //                 {
// //                     o.Id,
// //                     o.TrackingId,
// //                     o.Status,
// //                     o.SenderName,
// //                     o.PickupAddress,
// //                     o.ReceiverName,
// //                     o.ReceiverAddress,
// //                     o.CreatedAt,
// //                     o.EstimatedDeliveryDate,
// //                     driverId = o.DriverId,
// //                     driverName = o.Driver != null ? o.Driver.Name : null,

// //                     originWarehouse = o.OriginWarehouse != null ? new
// //                     {
// //                         o.OriginWarehouse.Id,
// //                         o.OriginWarehouse.Name,
// //                         o.OriginWarehouse.City
// //                     } : null,
// //                     currentWarehouse = o.CurrentWarehouse != null ? new
// //                     {
// //                         o.CurrentWarehouse.Id,
// //                         o.CurrentWarehouse.Name,
// //                         o.CurrentWarehouse.City
// //                     } : null,
// //                     destinationWarehouse = o.DestinationWarehouse != null ? new
// //                     {
// //                         o.DestinationWarehouse.Id,
// //                         o.DestinationWarehouse.Name,
// //                         o.DestinationWarehouse.City
// //                     } : null
// //                 })
// //                 .ToListAsync();

// //             return Ok(orders);
// //         }

// //         // ---------------------------------------------------------------------
// //         // CUSTOMER ORDERS (with warehouse and driver info)
// //         // ---------------------------------------------------------------------
// //         [HttpGet("my-orders")]
// //         [Authorize(Roles = "Customer")]
// //         public async Task<IActionResult> GetCustomerOrders()
// //         {
// //             int userId = int.Parse(User.FindFirst("id")?.Value ?? "0");

// //             var orders = await _context.Orders
// //                 .Where(o => o.CustomerId == userId)
// //                 .Include(o => o.Driver)
// //                 .Include(o => o.OriginWarehouse)
// //                 .Include(o => o.CurrentWarehouse)
// //                 .Include(o => o.DestinationWarehouse)
// //                 .OrderByDescending(o => o.CreatedAt)
// //                 .Select(o => new
// //                 {
// //                     o.Id,
// //                     o.TrackingId,
// //                     o.Status,
// //                     o.SenderName,
// //                     o.PickupAddress,
// //                     o.ReceiverName,
// //                     o.ReceiverAddress,
// //                     o.CreatedAt,
// //                     o.EstimatedDeliveryDate,
// //                     o.DeliveryLatitude,
// //                     o.DeliveryLongitude,
// //                     driver = o.Driver != null ? new
// //                     {
// //                         o.Driver.Id,
// //                         o.Driver.Name
// //                     } : null,
// //                     originWarehouse = o.OriginWarehouse != null ? new
// //                     {
// //                         o.OriginWarehouse.Id,
// //                         o.OriginWarehouse.Name,
// //                         o.OriginWarehouse.City
// //                     } : null,
// //                     currentWarehouse = o.CurrentWarehouse != null ? new
// //                     {
// //                         o.CurrentWarehouse.Id,
// //                         o.CurrentWarehouse.Name,
// //                         o.CurrentWarehouse.City
// //                     } : null,
// //                     destinationWarehouse = o.DestinationWarehouse != null ? new
// //                     {
// //                         o.DestinationWarehouse.Id,
// //                         o.DestinationWarehouse.Name,
// //                         o.DestinationWarehouse.City
// //                     } : null
// //                 })
// //                 .ToListAsync();

// //             return Ok(orders);
// //         }

// //         // ---------------------------------------------------------------------
// //         // SENDER ORDERS (with warehouse and driver info)
// //         // ---------------------------------------------------------------------
// //         [HttpGet("my-sent-orders")]
// //         [Authorize(Roles = "Sender")]
// //         public async Task<IActionResult> GetSenderOrders()
// //         {
// //             int userId = int.Parse(User.FindFirst("id")?.Value ?? "0");

// //             var orders = await _context.Orders
// //                 .Where(o => o.SenderId == userId)
// //                 .Include(o => o.Driver)
// //                 .Include(o => o.OriginWarehouse)
// //                 .Include(o => o.CurrentWarehouse)
// //                 .Include(o => o.DestinationWarehouse)
// //                 .OrderByDescending(o => o.CreatedAt)
// //                 .Select(o => new
// //                 {
// //                     o.Id,
// //                     o.TrackingId,
// //                     o.Status,
// //                     o.SenderName,
// //                     o.PickupAddress,
// //                     o.ReceiverName,
// //                     o.ReceiverAddress,
// //                     o.ReceiverEmail,
// //                     o.ReceiverPhone,
// //                     o.CreatedAt,
// //                     o.EstimatedDeliveryDate,
// //                     driver = o.Driver != null ? new
// //                     {
// //                         o.Driver.Id,
// //                         o.Driver.Name
// //                     } : null,
// //                     originWarehouse = o.OriginWarehouse != null ? new
// //                     {
// //                         o.OriginWarehouse.Id,
// //                         o.OriginWarehouse.Name,
// //                         o.OriginWarehouse.City
// //                     } : null,
// //                     currentWarehouse = o.CurrentWarehouse != null ? new
// //                     {
// //                         o.CurrentWarehouse.Id,
// //                         o.CurrentWarehouse.Name,
// //                         o.CurrentWarehouse.City
// //                     } : null,
// //                     destinationWarehouse = o.DestinationWarehouse != null ? new
// //                     {
// //                         o.DestinationWarehouse.Id,
// //                         o.DestinationWarehouse.Name,
// //                         o.DestinationWarehouse.City
// //                     } : null
// //                 })
// //                 .ToListAsync();

// //             return Ok(orders);
// //         }

// //         // ---------------------------------------------------------------------
// //         // APPROVE ORDER (Admin) - Legacy endpoint
// //         // ---------------------------------------------------------------------
// //         [HttpPost("{id}/approve")]
// //         [Authorize(Roles = "Admin")]
// //         public async Task<IActionResult> ApproveOrder(int id)
// //         {
// //             var order = await _context.Orders.FindAsync(id);
// //             if (order == null) return NotFound();

// //             order.Status = "Approved";

// //             var driver = await _context.Users
// //                 .FirstOrDefaultAsync(u => u.Role == "Driver" && u.IsAvailable);

// //             if (driver != null)
// //             {
// //                 order.DriverId = driver.Id;
// //                 order.Status = "Assigned";
// //                 await _context.SaveChangesAsync();

// //                 await _optimizationService.OptimizeRouteForDriver(driver.Id);
// //             }
// //             else
// //             {
// //                 await _context.SaveChangesAsync();
// //             }

// //             return Ok(order);
// //         }
// //     }
// // }

// using Backend.Data;
// using Backend.Domain.Entity;
// using Backend.DTOs;
// using Backend.Services;
// using Backend.Hubs;
// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.AspNetCore.SignalR;
// using Microsoft.EntityFrameworkCore;
// using System.Security.Claims;

// namespace Backend.Endpoints
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     public class OrdersController : ControllerBase
//     {
//         private readonly AppDbContext _context;
//         private readonly RouteOptimizationService _optimizationService;
//         private readonly DriverRouteOptimizationService _driverRouteService;
//         private readonly IHubContext<LogisticsHub> _hubContext;

//         public OrdersController(
//             AppDbContext context,
//             RouteOptimizationService optimizationService,
//             DriverRouteOptimizationService driverRouteService,
//             IHubContext<LogisticsHub> hubContext)
//         {
//             _context = context;
//             _optimizationService = optimizationService;
//             _driverRouteService = driverRouteService;
//             _hubContext = hubContext;
//         }

//         // // ---------------------------------------------------------------------
//         // // 🆕 FEATURE 1: RESCHEDULE ORDER
//         // // ---------------------------------------------------------------------
//         // [HttpPost("{id}/reschedule")]
//         // [Authorize(Roles = "Customer")]
//         // public async Task<IActionResult> RescheduleOrder(int id, [FromBody] RescheduleDto dto)
//         // {
//         //     try
//         //     {
//         //         // Get customer ID from token
//         //         var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
//         //         int customerId = int.Parse(userIdClaim?.Value ?? "0");

//         //         // Verify order belongs to customer
//         //         var order = await _context.Orders
//         //             .Include(o => o.Driver)
//         //             .FirstOrDefaultAsync(o => o.Id == id && o.CustomerId == customerId);

//         //         if (order == null)
//         //             return NotFound(new { message = "Order not found or not authorized" });

//         //         // Cannot reschedule delivered or cancelled orders
//         //         if (order.Status == "Delivered" || order.Status == "Cancelled")
//         //             return BadRequest(new { message = "Cannot reschedule completed orders" });

//         //         // Update order with reschedule info
//         //         order.RescheduledAt = DateTime.UtcNow;
//         //         order.RescheduleReason = dto.Reason;
//         //         order.EstimatedDeliveryDate = DateTime.SpecifyKind(dto.NewDate, DateTimeKind.Utc);
//         //         order.RescheduledDate = DateTime.SpecifyKind(dto.NewDate, DateTimeKind.Utc);
                
//         //         // Lower priority due to rescheduling
//         //         if (order.Priority > 1)
//         //             order.Priority = Math.Max(1, order.Priority - 1);

//         //         await _context.SaveChangesAsync();

//         //         // 🔥 NOTIFY DRIVER VIA SIGNALR
//         //         if (order.DriverId.HasValue)
//         //         {
//         //             await _hubContext.Clients
//         //                 .Group($"Driver_{order.DriverId.Value}")
//         //                 .SendAsync("OrderRescheduled", new
//         //                 {
//         //                     orderId = order.Id,
//         //                     trackingId = order.TrackingId,
//         //                     newDate = order.EstimatedDeliveryDate,
//         //                     reason = order.RescheduleReason,
//         //                     customerName = order.ReceiverName
//         //                 });

//         //             // 🔥 RE-OPTIMIZE DRIVER ROUTE
//         //             await _driverRouteService.OptimizeRouteAfterReschedule(order.DriverId.Value);
                    
//         //             // Push updated route to driver
//         //             var optimizedRoute = await _driverRouteService.GenerateRouteForDriver(order.DriverId.Value);
//         //             await _hubContext.Clients
//         //                 .Group($"Driver_{order.DriverId.Value}_Route")
//         //                 .SendAsync("ReceiveRouteUpdate", optimizedRoute);
//         //         }

//         //         return Ok(new
//         //         {
//         //             message = "Order rescheduled successfully",
//         //             order = new
//         //             {
//         //                 order.Id,
//         //                 order.TrackingId,
//         //                 order.EstimatedDeliveryDate,
//         //                 order.RescheduledAt,
//         //                 order.RescheduleReason
//         //             }
//         //         });
//         //     }
//         //     catch (Exception ex)
//         //     {
//         //         return BadRequest(new
//         //         {
//         //             message = "Failed to reschedule order",
//         //             error = ex.Message
//         //         });
//         //     }
//         // }

//         [HttpPost("{id}/reschedule")]
// [Authorize(Roles = "Customer")]
// public async Task<IActionResult> RescheduleOrder(int id, [FromBody] RescheduleDto dto)
// {
//     try
//     {
//         var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
//         int customerId = int.Parse(userIdClaim?.Value ?? "0");

//         var order = await _context.Orders
//             .Include(o => o.Driver)
//             .FirstOrDefaultAsync(o => o.Id == id && o.CustomerId == customerId);

//         if (order == null)
//             return NotFound(new { message = "Order not found or not authorized" });

//         if (order.Status == "Delivered" || order.Status == "Cancelled")
//             return BadRequest(new { message = "Cannot reschedule completed orders" });

//         // Update order
//         order.RescheduledAt = DateTime.UtcNow;
//         order.RescheduleReason = dto.Reason;
//         order.EstimatedDeliveryDate = DateTime.SpecifyKind(dto.NewDate, DateTimeKind.Utc);
//         order.RescheduledDate = DateTime.SpecifyKind(dto.NewDate, DateTimeKind.Utc);

//         if (order.Priority > 1)
//             order.Priority--;

//         await _context.SaveChangesAsync();

//         // 🚨 NOTIFY DRIVER
//         if (order.DriverId.HasValue)
//         {
//             var eventData = new
//             {
//                 orderId = order.Id,
//                 trackingId = order.TrackingId,
//                 newDate = order.EstimatedDeliveryDate,
//                 reason = order.RescheduleReason,
//                 customerName = order.ReceiverName,
//                 customerEmail = order.ReceiverEmail,
//                 customerPhone = order.ReceiverPhone
//             };

//             await _hubContext.Clients
//                 .Group($"Driver_{order.DriverId.Value}_Route")
//                 .SendAsync("OrderRescheduled", eventData);

//             // RE-OPTIMIZE DRIVER ROUTE
//             await _driverRouteService.OptimizeRouteAfterReschedule(order.DriverId.Value);

//             var optimizedRoute = await _driverRouteService.GenerateRouteForDriver(order.DriverId.Value);
//             await _hubContext.Clients
//                 .Group($"Driver_{order.DriverId.Value}_Route")
//                 .SendAsync("ReceiveRouteUpdate", optimizedRoute);
//         }

//         return Ok(new
//         {
//             message = "Order rescheduled successfully",
//             order = new
//             {
//                 order.Id,
//                 order.TrackingId,
//                 order.EstimatedDeliveryDate,
//                 order.RescheduledAt,
//                 order.RescheduleReason
//             }
//         });
//     }
//     catch (Exception ex)
//     {
//         return BadRequest(new
//         {
//             message = "Failed to reschedule order",
//             error = ex.Message
//         });
//     }
// }


//         // ---------------------------------------------------------------------
//         // CREATE ORDER (Sender)
//         // ---------------------------------------------------------------------
//         [HttpPost]
//         [Authorize(Roles = "Sender")]
//         public async Task<IActionResult> CreateOrder(
//             Order order,
//             [FromServices] IEmailService emailService)
//         {
//             try
//             {
//                 if (order.ScheduledDate.HasValue)
//                     order.ScheduledDate = DateTime.SpecifyKind(order.ScheduledDate.Value, DateTimeKind.Utc);

//                 var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
//                 order.SenderId = int.Parse(userIdClaim?.Value ?? "0");

//                 order.TrackingId = Guid.NewGuid().ToString("N")[..10].ToUpper();

//                 if (!string.IsNullOrWhiteSpace(order.ReceiverEmail))
//                 {
//                     var customer = await _context.Users
//                         .FirstOrDefaultAsync(u => u.Email == order.ReceiverEmail && u.Role == "Customer");

//                     if (customer != null)
//                         order.CustomerId = customer.Id;
//                 }

//                 order.Status = "PendingAssignment";
//                 order.CreatedAt = DateTime.UtcNow;

//                 _context.Orders.Add(order);
//                 await _context.SaveChangesAsync();

//                 await emailService.SendOrderEmailsAsync(order);

//                 return Ok(order);
//             }
//             catch (Exception ex)
//             {
//                 return BadRequest(new
//                 {
//                     message = ex.Message,
//                     innerException = ex.InnerException?.Message,
//                     stackTrace = ex.StackTrace
//                 });
//             }
//         }

//         // ---------------------------------------------------------------------
//         // PUBLIC TRACKING ENDPOINT
//         // ---------------------------------------------------------------------
//         [HttpGet("track-public/{trackingId}")]
//         [AllowAnonymous]
//         public async Task<IActionResult> TrackPublic(string trackingId)
//         {
//             var order = await _context.Orders
//                 .Include(o => o.Driver)
//                 .Include(o => o.OriginWarehouse)
//                 .Include(o => o.CurrentWarehouse)
//                 .Include(o => o.DestinationWarehouse)
//                 .FirstOrDefaultAsync(o => o.TrackingId == trackingId);

//             if (order == null)
//                 return NotFound(new { message = "Invalid tracking ID" });

//             var driverLocation = await _context.DriverLocations
//                 .Where(dl => dl.DriverId == order.DriverId)
//                 .OrderByDescending(dl => dl.UpdatedAt)
//                 .FirstOrDefaultAsync();

//             return Ok(new
//             {
//                 order = new
//                 {
//                     order.Id,
//                     order.TrackingId,
//                     order.Status,
//                     order.ReceiverName,
//                     order.ReceiverAddress,
//                     order.PickupAddress,
//                     order.EstimatedDeliveryDate,
//                     order.CreatedAt,
//                     driver = order.Driver != null ? new
//                     {
//                         order.Driver.Id,
//                         order.Driver.Name
//                     } : null,
//                     originWarehouse = order.OriginWarehouse != null ? new
//                     {
//                         order.OriginWarehouse.Id,
//                         order.OriginWarehouse.Name,
//                         order.OriginWarehouse.City
//                     } : null,
//                     currentWarehouse = order.CurrentWarehouse != null ? new
//                     {
//                         order.CurrentWarehouse.Id,
//                         order.CurrentWarehouse.Name,
//                         order.CurrentWarehouse.City
//                     } : null,
//                     destinationWarehouse = order.DestinationWarehouse != null ? new
//                     {
//                         order.DestinationWarehouse.Id,
//                         order.DestinationWarehouse.Name,
//                         order.DestinationWarehouse.City
//                     } : null
//                 },
//                 driverLocation = driverLocation != null ? new
//                 {
//                     latitude = driverLocation.Latitude,
//                     longitude = driverLocation.Longitude,
//                     updatedAt = driverLocation.UpdatedAt
//                 } : null
//             });
//         }

//         // ---------------------------------------------------------------------
//         // PENDING ORDERS (Admin)
//         // ---------------------------------------------------------------------
//         [HttpGet("pending")]
//         [Authorize(Roles = "Admin")]
//         public async Task<IActionResult> GetPendingOrders()
//         {
//             var orders = await _context.Orders
//                 .Where(o => o.Status == "PendingAssignment")
//                 .Include(o => o.Driver)
//                 .Include(o => o.OriginWarehouse)
//                 .Include(o => o.CurrentWarehouse)
//                 .Include(o => o.DestinationWarehouse)
//                 .OrderByDescending(o => o.CreatedAt)
//                 .Select(o => new
//                 {
//                     o.Id,
//                     o.TrackingId,
//                     o.Status,
//                     o.SenderName,
//                     o.PickupAddress,
//                     o.ReceiverName,
//                     o.ReceiverAddress,
//                     o.CreatedAt,
//                     o.EstimatedDeliveryDate,
//                     driverId = o.DriverId,
//                     driverName = o.Driver != null ? o.Driver.Name : null,
//                     originWarehouse = o.OriginWarehouse != null ? new
//                     {
//                         o.OriginWarehouse.Id,
//                         o.OriginWarehouse.Name,
//                         o.OriginWarehouse.City
//                     } : null,
//                     currentWarehouse = o.CurrentWarehouse != null ? new
//                     {
//                         o.CurrentWarehouse.Id,
//                         o.CurrentWarehouse.Name,
//                         o.CurrentWarehouse.City
//                     } : null,
//                     destinationWarehouse = o.DestinationWarehouse != null ? new
//                     {
//                         o.DestinationWarehouse.Id,
//                         o.DestinationWarehouse.Name,
//                         o.DestinationWarehouse.City
//                     } : null
//                 })
//                 .ToListAsync();

//             return Ok(orders);
//         }

//         // ---------------------------------------------------------------------
//         // ASSIGNED ORDERS (Admin)
//         // ---------------------------------------------------------------------
//         [HttpGet("assigned")]
//         [Authorize(Roles = "Admin")]
//         public async Task<IActionResult> GetAssignedOrders()
//         {
//             var orders = await _context.Orders
//                 .Where(o => o.Status == "Assigned")
//                 .Include(o => o.Driver)
//                 .Include(o => o.OriginWarehouse)
//                 .Include(o => o.CurrentWarehouse)
//                 .Include(o => o.DestinationWarehouse)
//                 .OrderByDescending(o => o.CreatedAt)
//                 .Select(o => new
//                 {
//                     o.Id,
//                     o.TrackingId,
//                     o.Status,
//                     o.SenderName,
//                     o.PickupAddress,
//                     o.ReceiverName,
//                     o.ReceiverAddress,
//                     o.CreatedAt,
//                     o.EstimatedDeliveryDate,
//                     driverId = o.DriverId,
//                     driverName = o.Driver != null ? o.Driver.Name : null,
//                     originWarehouse = o.OriginWarehouse != null ? new
//                     {
//                         o.OriginWarehouse.Id,
//                         o.OriginWarehouse.Name,
//                         o.OriginWarehouse.City
//                     } : null,
//                     currentWarehouse = o.CurrentWarehouse != null ? new
//                     {
//                         o.CurrentWarehouse.Id,
//                         o.CurrentWarehouse.Name,
//                         o.CurrentWarehouse.City
//                     } : null,
//                     destinationWarehouse = o.DestinationWarehouse != null ? new
//                     {
//                         o.DestinationWarehouse.Id,
//                         o.DestinationWarehouse.Name,
//                         o.DestinationWarehouse.City
//                     } : null
//                 })
//                 .ToListAsync();

//             return Ok(orders);
//         }

//         // ---------------------------------------------------------------------
//         // CUSTOMER ORDERS
//         // ---------------------------------------------------------------------
//         [HttpGet("my-orders")]
//         [Authorize(Roles = "Customer")]
//         public async Task<IActionResult> GetCustomerOrders()
//         {
//             int userId = int.Parse(User.FindFirst("id")?.Value ?? "0");

//             var orders = await _context.Orders
//                 .Where(o => o.CustomerId == userId)
//                 .Include(o => o.Driver)
//                 .Include(o => o.OriginWarehouse)
//                 .Include(o => o.CurrentWarehouse)
//                 .Include(o => o.DestinationWarehouse)
//                 .OrderByDescending(o => o.CreatedAt)
//                 .Select(o => new
//                 {
//                     o.Id,
//                     o.TrackingId,
//                     o.Status,
//                     o.SenderName,
//                     o.PickupAddress,
//                     o.ReceiverName,
//                     o.ReceiverAddress,
//                     o.CreatedAt,
//                     o.EstimatedDeliveryDate,
//                     o.DeliveryLatitude,
//                     o.DeliveryLongitude,
//                     o.RescheduledAt,
//                     o.RescheduleReason,
//                     driver = o.Driver != null ? new
//                     {
//                         o.Driver.Id,
//                         o.Driver.Name
//                     } : null,
//                     originWarehouse = o.OriginWarehouse != null ? new
//                     {
//                         o.OriginWarehouse.Id,
//                         o.OriginWarehouse.Name,
//                         o.OriginWarehouse.City
//                     } : null,
//                     currentWarehouse = o.CurrentWarehouse != null ? new
//                     {
//                         o.CurrentWarehouse.Id,
//                         o.CurrentWarehouse.Name,
//                         o.CurrentWarehouse.City
//                     } : null,
//                     destinationWarehouse = o.DestinationWarehouse != null ? new
//                     {
//                         o.DestinationWarehouse.Id,
//                         o.DestinationWarehouse.Name,
//                         o.DestinationWarehouse.City
//                     } : null
//                 })
//                 .ToListAsync();

//             return Ok(orders);
//         }

//         // ---------------------------------------------------------------------
//         // SENDER ORDERS
//         // ---------------------------------------------------------------------
//         [HttpGet("my-sent-orders")]
//         [Authorize(Roles = "Sender")]
//         public async Task<IActionResult> GetSenderOrders()
//         {
//             int userId = int.Parse(User.FindFirst("id")?.Value ?? "0");

//             var orders = await _context.Orders
//                 .Where(o => o.SenderId == userId)
//                 .Include(o => o.Driver)
//                 .Include(o => o.OriginWarehouse)
//                 .Include(o => o.CurrentWarehouse)
//                 .Include(o => o.DestinationWarehouse)
//                 .OrderByDescending(o => o.CreatedAt)
//                 .Select(o => new
//                 {
//                     o.Id,
//                     o.TrackingId,
//                     o.Status,
//                     o.SenderName,
//                     o.PickupAddress,
//                     o.ReceiverName,
//                     o.ReceiverAddress,
//                     o.ReceiverEmail,
//                     o.ReceiverPhone,
//                     o.CreatedAt,
//                     o.EstimatedDeliveryDate,
//                     driver = o.Driver != null ? new
//                     {
//                         o.Driver.Id,
//                         o.Driver.Name
//                     } : null,
//                     originWarehouse = o.OriginWarehouse != null ? new
//                     {
//                         o.OriginWarehouse.Id,
//                         o.OriginWarehouse.Name,
//                         o.OriginWarehouse.City
//                     } : null,
//                     currentWarehouse = o.CurrentWarehouse != null ? new
//                     {
//                         o.CurrentWarehouse.Id,
//                         o.CurrentWarehouse.Name,
//                         o.CurrentWarehouse.City
//                     } : null,
//                     destinationWarehouse = o.DestinationWarehouse != null ? new
//                     {
//                         o.DestinationWarehouse.Id,
//                         o.DestinationWarehouse.Name,
//                         o.DestinationWarehouse.City
//                     } : null
//                 })
//                 .ToListAsync();

//             return Ok(orders);
//         }

//         // ---------------------------------------------------------------------
//         // APPROVE ORDER (Admin) - Legacy
//         // ---------------------------------------------------------------------
//         [HttpPost("{id}/approve")]
//         [Authorize(Roles = "Admin")]
//         public async Task<IActionResult> ApproveOrder(int id)
//         {
//             var order = await _context.Orders.FindAsync(id);
//             if (order == null) return NotFound();

//             order.Status = "Approved";

//             var driver = await _context.Users
//                 .FirstOrDefaultAsync(u => u.Role == "Driver" && u.IsAvailable);

//             if (driver != null)
//             {
//                 order.DriverId = driver.Id;
//                 order.Status = "Assigned";
//                 await _context.SaveChangesAsync();

//                 await _optimizationService.OptimizeRouteForDriver(driver.Id);
//             }
//             else
//             {
//                 await _context.SaveChangesAsync();
//             }

//             return Ok(order);
//         }
//     }
// }

using Backend.Data;
using Backend.Domain.Entity;
using Backend.DTOs;
using Backend.Services;
using Backend.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
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
        private readonly DriverRouteOptimizationService _driverRouteService;
        private readonly IHubContext<LogisticsHub> _hubContext;
        private readonly GeminiService _geminiService;

        public OrdersController(
            AppDbContext context,
            RouteOptimizationService optimizationService,
            DriverRouteOptimizationService driverRouteService,
            IHubContext<LogisticsHub> hubContext,
            GeminiService geminiService)
        {
            _context = context;
            _optimizationService = optimizationService;
            _driverRouteService = driverRouteService;
            _hubContext = hubContext;
            _geminiService = geminiService;
        }

        // 🆕 FEATURE 1: RESCHEDULE ORDER WITH AI PRIORITY CALCULATION
        [HttpPost("{id}/reschedule")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> RescheduleOrder(int id, [FromBody] RescheduleDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
                int customerId = int.Parse(userIdClaim?.Value ?? "0");

                var order = await _context.Orders
                    .Include(o => o.Driver)
                    .FirstOrDefaultAsync(o => o.Id == id && o.CustomerId == customerId);

                if (order == null)
                    return NotFound(new { message = "Order not found or not authorized" });

                if (order.Status == "Delivered" || order.Status == "Cancelled")
                    return BadRequest(new { message = "Cannot reschedule completed orders" });

                // Calculate delivery distance
                double deliveryDistance = CalculateDistance(
                    order.PickupLatitude, order.PickupLongitude,
                    order.DeliveryLatitude, order.DeliveryLongitude
                );

                // Get driver's current load
                int driverLoad = 0;
                if (order.DriverId.HasValue)
                {
                    driverLoad = await _context.Orders
                        .Where(o => o.DriverId == order.DriverId.Value && 
                                   o.Status != "Delivered" && 
                                   o.Status != "Cancelled")
                        .CountAsync();
                }

                // Calculate order age in hours
                int orderAgeHours = (int)(DateTime.UtcNow - order.CreatedAt).TotalHours;

                // 🔥 CALL GEMINI AI FOR PRIORITY CALCULATION
                var aiResult = await _geminiService.CalculateDeliveryPriority(
                    dto.NewDate,
                    deliveryDistance,
                    dto.Reason,
                    driverLoad,
                    orderAgeHours
                );

                // Update order with reschedule info and AI priority
                order.RescheduledAt = DateTime.UtcNow;
                order.RescheduleReason = dto.Reason;
                order.EstimatedDeliveryDate = DateTime.SpecifyKind(dto.NewDate, DateTimeKind.Utc);
                order.RescheduledDate = DateTime.SpecifyKind(dto.NewDate, DateTimeKind.Utc);
                
                // Apply AI priority
                order.AiPriority = aiResult.AiPriority;
                order.AiPriorityJustification = aiResult.Justification;
                order.Priority = aiResult.AiPriority; // Also update standard priority

                await _context.SaveChangesAsync();

                // 🚨 NOTIFY DRIVER VIA SIGNALR
                if (order.DriverId.HasValue)
                {
                    var eventData = new
                    {
                        orderId = order.Id,
                        trackingId = order.TrackingId,
                        newDate = order.EstimatedDeliveryDate,
                        reason = order.RescheduleReason,
                        customerName = order.ReceiverName,
                        customerEmail = order.ReceiverEmail,
                        customerPhone = order.ReceiverPhone,
                        aiPriority = order.AiPriority,
                        aiJustification = order.AiPriorityJustification
                    };

                    await _hubContext.Clients
                        .Group($"Driver_{order.DriverId.Value}_Route")
                        .SendAsync("OrderRescheduled", eventData);

                    // RE-OPTIMIZE DRIVER ROUTE
                    await _driverRouteService.OptimizeRouteAfterReschedule(order.DriverId.Value);

                    var optimizedRoute = await _driverRouteService.GenerateRouteForDriver(order.DriverId.Value);
                    await _hubContext.Clients
                        .Group($"Driver_{order.DriverId.Value}_Route")
                        .SendAsync("ReceiveRouteUpdate", optimizedRoute);
                }

                return Ok(new
                {
                    message = "Order rescheduled successfully with AI priority",
                    order = new
                    {
                        order.Id,
                        order.TrackingId,
                        order.EstimatedDeliveryDate,
                        order.RescheduledAt,
                        order.RescheduleReason,
                        order.AiPriority,
                        order.AiPriorityJustification
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = "Failed to reschedule order",
                    error = ex.Message
                });
            }
        }

        // Haversine distance calculation
        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371; // Earth radius in km
            var dLat = DegreesToRadians(lat2 - lat1);
            var dLon = DegreesToRadians(lon2 - lon1);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return R * c;
        }

        private double DegreesToRadians(double degrees) => degrees * Math.PI / 180.0;

        // CREATE ORDER (Sender)
        [HttpPost]
        [Authorize(Roles = "Sender")]
        public async Task<IActionResult> CreateOrder(
            Order order,
            [FromServices] IEmailService emailService)
        {
            try
            {
                if (order.ScheduledDate.HasValue)
                    order.ScheduledDate = DateTime.SpecifyKind(order.ScheduledDate.Value, DateTimeKind.Utc);

                var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
                order.SenderId = int.Parse(userIdClaim?.Value ?? "0");

                order.TrackingId = Guid.NewGuid().ToString("N")[..10].ToUpper();

                if (!string.IsNullOrWhiteSpace(order.ReceiverEmail))
                {
                    var customer = await _context.Users
                        .FirstOrDefaultAsync(u => u.Email == order.ReceiverEmail && u.Role == "Customer");

                    if (customer != null)
                        order.CustomerId = customer.Id;
                }

                order.Status = "PendingAssignment";
                order.CreatedAt = DateTime.UtcNow;

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                await emailService.SendOrderEmailsAsync(order);

                return Ok(order);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message,
                    innerException = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        // PUBLIC TRACKING ENDPOINT
        [HttpGet("track-public/{trackingId}")]
        [AllowAnonymous]
        public async Task<IActionResult> TrackPublic(string trackingId)
        {
            var order = await _context.Orders
                .Include(o => o.Driver)
                .Include(o => o.OriginWarehouse)
                .Include(o => o.CurrentWarehouse)
                .Include(o => o.DestinationWarehouse)
                .FirstOrDefaultAsync(o => o.TrackingId == trackingId);

            if (order == null)
                return NotFound(new { message = "Invalid tracking ID" });

            var driverLocation = await _context.DriverLocations
                .Where(dl => dl.DriverId == order.DriverId)
                .OrderByDescending(dl => dl.UpdatedAt)
                .FirstOrDefaultAsync();

            return Ok(new
            {
                order = new
                {
                    order.Id,
                    order.TrackingId,
                    order.Status,
                    order.ReceiverName,
                    order.ReceiverAddress,
                    order.PickupAddress,
                    order.EstimatedDeliveryDate,
                    order.CreatedAt,
                    order.AiPriority,
                    driver = order.Driver != null ? new
                    {
                        order.Driver.Id,
                        order.Driver.Name
                    } : null,
                    originWarehouse = order.OriginWarehouse != null ? new
                    {
                        order.OriginWarehouse.Id,
                        order.OriginWarehouse.Name,
                        order.OriginWarehouse.City
                    } : null,
                    currentWarehouse = order.CurrentWarehouse != null ? new
                    {
                        order.CurrentWarehouse.Id,
                        order.CurrentWarehouse.Name,
                        order.CurrentWarehouse.City
                    } : null,
                    destinationWarehouse = order.DestinationWarehouse != null ? new
                    {
                        order.DestinationWarehouse.Id,
                        order.DestinationWarehouse.Name,
                        order.DestinationWarehouse.City
                    } : null
                },
                driverLocation = driverLocation != null ? new
                {
                    latitude = driverLocation.Latitude,
                    longitude = driverLocation.Longitude,
                    updatedAt = driverLocation.UpdatedAt
                } : null
            });
        }

        // PENDING ORDERS (Admin)
        [HttpGet("pending")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPendingOrders()
        {
            var orders = await _context.Orders
                .Where(o => o.Status == "PendingAssignment")
                .Include(o => o.Driver)
                .Include(o => o.OriginWarehouse)
                .Include(o => o.CurrentWarehouse)
                .Include(o => o.DestinationWarehouse)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new
                {
                    o.Id,
                    o.TrackingId,
                    o.Status,
                    o.SenderName,
                    o.PickupAddress,
                    o.ReceiverName,
                    o.ReceiverAddress,
                    o.CreatedAt,
                    o.EstimatedDeliveryDate,
                    o.AiPriority,
                    driverId = o.DriverId,
                    driverName = o.Driver != null ? o.Driver.Name : null,
                    originWarehouse = o.OriginWarehouse != null ? new
                    {
                        o.OriginWarehouse.Id,
                        o.OriginWarehouse.Name,
                        o.OriginWarehouse.City
                    } : null,
                    currentWarehouse = o.CurrentWarehouse != null ? new
                    {
                        o.CurrentWarehouse.Id,
                        o.CurrentWarehouse.Name,
                        o.CurrentWarehouse.City
                    } : null,
                    destinationWarehouse = o.DestinationWarehouse != null ? new
                    {
                        o.DestinationWarehouse.Id,
                        o.DestinationWarehouse.Name,
                        o.DestinationWarehouse.City
                    } : null
                })
                .ToListAsync();

            return Ok(orders);
        }

        // ASSIGNED ORDERS (Admin)
        [HttpGet("assigned")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAssignedOrders()
        {
            var orders = await _context.Orders
                .Where(o => o.Status == "Assigned")
                .Include(o => o.Driver)
                .Include(o => o.OriginWarehouse)
                .Include(o => o.CurrentWarehouse)
                .Include(o => o.DestinationWarehouse)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new
                {
                    o.Id,
                    o.TrackingId,
                    o.Status,
                    o.SenderName,
                    o.PickupAddress,
                    o.ReceiverName,
                    o.ReceiverAddress,
                    o.CreatedAt,
                    o.EstimatedDeliveryDate,
                    o.AiPriority,
                    driverId = o.DriverId,
                    driverName = o.Driver != null ? o.Driver.Name : null,
                    originWarehouse = o.OriginWarehouse != null ? new
                    {
                        o.OriginWarehouse.Id,
                        o.OriginWarehouse.Name,
                        o.OriginWarehouse.City
                    } : null,
                    currentWarehouse = o.CurrentWarehouse != null ? new
                    {
                        o.CurrentWarehouse.Id,
                        o.CurrentWarehouse.Name,
                        o.CurrentWarehouse.City
                    } : null,
                    destinationWarehouse = o.DestinationWarehouse != null ? new
                    {
                        o.DestinationWarehouse.Id,
                        o.DestinationWarehouse.Name,
                        o.DestinationWarehouse.City
                    } : null
                })
                .ToListAsync();

            return Ok(orders);
        }

        // CUSTOMER ORDERS
        [HttpGet("my-orders")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetCustomerOrders()
        {
            int userId = int.Parse(User.FindFirst("id")?.Value ?? "0");

            var orders = await _context.Orders
                .Where(o => o.CustomerId == userId)
                .Include(o => o.Driver)
                .Include(o => o.OriginWarehouse)
                .Include(o => o.CurrentWarehouse)
                .Include(o => o.DestinationWarehouse)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new
                {
                    o.Id,
                    o.TrackingId,
                    o.Status,
                    o.SenderName,
                    o.PickupAddress,
                    o.ReceiverName,
                    o.ReceiverAddress,
                    o.CreatedAt,
                    o.EstimatedDeliveryDate,
                    o.DeliveryLatitude,
                    o.DeliveryLongitude,
                    o.RescheduledAt,
                    o.RescheduleReason,
                    o.AiPriority,
                    o.AiPriorityJustification,
                    driver = o.Driver != null ? new
                    {
                        o.Driver.Id,
                        o.Driver.Name
                    } : null,
                    originWarehouse = o.OriginWarehouse != null ? new
                    {
                        o.OriginWarehouse.Id,
                        o.OriginWarehouse.Name,
                        o.OriginWarehouse.City
                    } : null,
                    currentWarehouse = o.CurrentWarehouse != null ? new
                    {
                        o.CurrentWarehouse.Id,
                        o.CurrentWarehouse.Name,
                        o.CurrentWarehouse.City
                    } : null,
                    destinationWarehouse = o.DestinationWarehouse != null ? new
                    {
                        o.DestinationWarehouse.Id,
                        o.DestinationWarehouse.Name,
                        o.DestinationWarehouse.City
                    } : null
                })
                .ToListAsync();

            return Ok(orders);
        }

        // SENDER ORDERS
        [HttpGet("my-sent-orders")]
        [Authorize(Roles = "Sender")]
        public async Task<IActionResult> GetSenderOrders()
        {
            int userId = int.Parse(User.FindFirst("id")?.Value ?? "0");

            var orders = await _context.Orders
                .Where(o => o.SenderId == userId)
                .Include(o => o.Driver)
                .Include(o => o.OriginWarehouse)
                .Include(o => o.CurrentWarehouse)
                .Include(o => o.DestinationWarehouse)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new
                {
                    o.Id,
                    o.TrackingId,
                    o.Status,
                    o.SenderName,
                    o.PickupAddress,
                    o.ReceiverName,
                    o.ReceiverAddress,
                    o.ReceiverEmail,
                    o.ReceiverPhone,
                    o.CreatedAt,
                    o.EstimatedDeliveryDate,
                    o.AiPriority,
                    driver = o.Driver != null ? new
                    {
                        o.Driver.Id,
                        o.Driver.Name
                    } : null,
                    originWarehouse = o.OriginWarehouse != null ? new
                    {
                        o.OriginWarehouse.Id,
                        o.OriginWarehouse.Name,
                        o.OriginWarehouse.City
                    } : null,
                    currentWarehouse = o.CurrentWarehouse != null ? new
                    {
                        o.CurrentWarehouse.Id,
                        o.CurrentWarehouse.Name,
                        o.CurrentWarehouse.City
                    } : null,
                    destinationWarehouse = o.DestinationWarehouse != null ? new
                    {
                        o.DestinationWarehouse.Id,
                        o.DestinationWarehouse.Name,
                        o.DestinationWarehouse.City
                    } : null
                })
                .ToListAsync();

            return Ok(orders);
        }

        // APPROVE ORDER (Admin) - Legacy
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