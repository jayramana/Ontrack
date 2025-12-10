// // // using Microsoft.AspNetCore.Mvc;
// // // using Microsoft.EntityFrameworkCore;
// // // using Microsoft.AspNetCore.Authorization;
// // // using Backend.Data;
// // // using Backend.Domain.Entity;
// // // using Backend.Services;
// // // using System.Security.Claims;

// // // namespace Backend.Endpoints
// // // {
// // //     [ApiController]
// // //     [Route("api/[controller]")]
// // //     public class DriverController : ControllerBase
// // //     {
// // //         private readonly AppDbContext _context;
// // //         private readonly DriverRouteOptimizationService _routeService;

// // //         public DriverController(AppDbContext context, DriverRouteOptimizationService routeService)
// // //         {
// // //             _context = context;
// // //             _routeService = routeService;
// // //         }

// // //         // GET: api/driver/orders/today
// // //         [HttpGet("orders/today")]
// // //         [Authorize(Roles = "Driver")]
// // //         public async Task<IActionResult> GetTodaysOrders()
// // //         {
// // //             var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
// // //             var driverId = int.Parse(userIdClaim?.Value ?? "0");

// // //             var orders = await _context.Orders
// // //                 .Where(o => o.DriverId == driverId)
// // //                 .Where(o => o.Status != "Delivered" && o.Status != "Cancelled")
// // //                 .Include(o => o.Sender)
// // //                 .Include(o => o.OriginWarehouse)
// // //                 .Include(o => o.DestinationWarehouse)
// // //                 .Include(o => o.CurrentWarehouse)
// // //                 .OrderBy(o => o.Priority)
// // //                 .ToListAsync();

// // //             return Ok(orders);
// // //         }

// // //         // GET: api/driver/route
// // //         [HttpGet("route")]
// // //         [Authorize(Roles = "Driver")]
// // //         public async Task<IActionResult> GetRouteStops()
// // //         {
// // //             var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
// // //             var driverId = int.Parse(userIdClaim?.Value ?? "0");

// // //             var routeStops = await _context.RouteStops
// // //                 .Where(rs => rs.DriverId == driverId)
// // //                 .Include(rs => rs.Order)
// // //                 .OrderBy(rs => rs.SequenceNumber)
// // //                 .ToListAsync();

// // //             return Ok(routeStops);
// // //         }


// // //         // GET: api/driver/route/optimized
// // //         [HttpGet("route/optimized")]
// // //         [Authorize(Roles = "Driver")]
// // //         public async Task<IActionResult> GetOptimizedRoute()
// // //         {
// // //             var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
// // //             var driverId = int.Parse(userIdClaim?.Value ?? "0");

// // //             var orders = await _context.Orders
// // //                 .Where(o => o.DriverId == driverId &&
// // //                     o.Status != "Delivered" &&
// // //                     o.Status != "Cancelled")
// // //                 .ToListAsync();

// // //             // Filter orders with invalid or missing coordinates
// // //             var validOrders = orders
// // //                 .Where(o =>
// // //                     o.DeliveryLatitude != 0 &&
// // //                     o.DeliveryLongitude != 0 &&
// // //                     !double.IsNaN(o.DeliveryLatitude) &&
// // //                     !double.IsNaN(o.DeliveryLongitude))
// // //                 .Select(o => new
// // //                 {
// // //                     id = o.Id,
// // //                     o.ReceiverAddress,
// // //                     o.PickupAddress,
// // //                     deliveryLatitude = o.DeliveryLatitude,
// // //                     deliveryLongitude = o.DeliveryLongitude,
// // //                     pickupLatitude = o.PickupLatitude,
// // //                     pickupLongitude = o.PickupLongitude,
// // //                     priority = o.Priority,
// // //                     scheduledDate = o.ScheduledDate
// // //                 })
// // //                 .ToList();

// // //             if (!validOrders.Any())
// // //             {
// // //                 return Ok(new { message = "No valid geocoded orders found", orders = new List<object>() });
// // //             }

// // //             return Ok(validOrders);
// // //         }


// // //         // POST: api/driver/location
// // //         [HttpPost("location")]
// // //         [Authorize(Roles = "Driver")]
// // //         public async Task<IActionResult> UpdateLocation([FromBody] LocationUpdate update)
// // //         {
// // //             var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
// // //             var driverId = int.Parse(userIdClaim?.Value ?? "0");

// // //             // Update user's current location
// // //             var driver = await _context.Users.FindAsync(driverId);
// // //             if (driver == null)
// // //                 return NotFound();

// // //             driver.CurrentLatitude = update.Latitude;
// // //             driver.CurrentLongitude = update.Longitude;

// // //             // Store in DriverLocations table for history
// // //             var location = new DriverLocation
// // //             {
// // //                 DriverId = driverId,
// // //                 Latitude = update.Latitude,
// // //                 Longitude = update.Longitude,
// // //                 Speed = update.Speed,
// // //                 Heading = update.Heading,
// // //                 UpdatedAt = DateTime.UtcNow
// // //             };

// // //             await _context.DriverLocations.AddAsync(location);
// // //             await _context.SaveChangesAsync();

// // //             // Future: Broadcast location via SignalR to customers tracking their orders

// // //             return Ok(new { message = "Location updated successfully" });
// // //         }

// // //         // POST: api/driver/mark-delivered/{orderId}
// // //         [HttpPost("mark-delivered/{orderId}")]
// // //         [Authorize(Roles = "Driver")]
// // //         public async Task<IActionResult> MarkDelivered(int orderId)
// // //         {
// // //             var order = await _context.Orders.FindAsync(orderId);
// // //             if (order == null)
// // //                 return NotFound();

// // //             order.Status = "Delivered";
// // //             await _context.SaveChangesAsync();

// // //             return Ok(new { message = "Order marked as delivered" });
// // //         }

// // //         [HttpGet("track/{orderId}")]
// // //         public async Task<IActionResult> TrackOrder(int orderId)
// // //         {
// // //             var order = await _context.Orders
// // //                 .Include(o => o.Driver)
// // //                 .FirstOrDefaultAsync(o => o.Id == orderId);

// // //             if (order == null)
// // //                 return NotFound(new { message = "Order not found" });

// // //             // Last driver location
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
// // //                     speed = driverLocation.Speed,
// // //                     updatedAt = driverLocation.UpdatedAt
// // //                 } : null,
// // //                 estimatedDelivery = order.EstimatedDeliveryDate
// // //             });
// // //         }

// // //         // GET: api/driver/route/suggestions
// // //         [HttpGet("route/suggestions")]
// // //         [Authorize(Roles = "Driver")]
// // //         public async Task<IActionResult> GetRouteSuggestions()
// // //         {
// // //             var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
// // //             var driverId = int.Parse(userIdClaim?.Value ?? "0");

// // //             var orders = await _context.Orders
// // //                 .Where(o => o.DriverId == driverId && o.Status != "Delivered")
// // //                 .ToListAsync();

// // //             if (!orders.Any())
// // //                 return Ok(new { routes = new List<object>() });

// // //             // Simulated ORION strategies
// // //             var fastest = orders.OrderBy(o => o.Priority).ToList();
// // //             var shortest = orders.OrderBy(o => o.DeliveryLatitude).ThenBy(o => o.DeliveryLongitude).ToList();
// // //             var fuelEfficient = orders.OrderBy(o => o.Priority * 2).ThenBy(o => Math.Abs(o.DeliveryLongitude)).ToList();

// // //             var result = new[]
// // //             {
// // //                 new {
// // //                     name = "Fastest Route",
// // //                     description = "Optimized for minimum travel time & traffic",
// // //                     stops = fastest.Select((o,i)=> new {
// // //                         sequence = i+1, o.Id, o.ReceiverAddress, o.DeliveryLatitude, o.DeliveryLongitude
// // //                     })
// // //                 },
// // //                 new {
// // //                     name = "Shortest Distance Route",
// // //                     description = "Minimized travel distance based on geospatial clustering",
// // //                     stops = shortest.Select((o,i)=> new {
// // //                         sequence = i+1, o.Id, o.ReceiverAddress, o.DeliveryLatitude, o.DeliveryLongitude
// // //                     })
// // //                 },
// // //                 new {
// // //                     name = "Fuel Efficient Route",
// // //                     description = "Avoids unnecessary turns & long detours to reduce fuel consumption",
// // //                     stops = fuelEfficient.Select((o,i)=> new {
// // //                         sequence = i+1, o.Id, o.ReceiverAddress, o.DeliveryLatitude, o.DeliveryLongitude
// // //                     })
// // //                 }
// // //             };

// // //             return Ok(result);
// // //         }



// // //         // POST: api/driver/mark-attempted/{orderId}
// // //         [HttpPost("mark-attempted/{orderId}")]
// // //         [Authorize(Roles = "Driver")]
// // //         public async Task<IActionResult> MarkAttempted(int orderId, [FromBody] DeliveryAttempt attempt)
// // //         {
// // //             var order = await _context.Orders.FindAsync(orderId);
// // //             if (order == null)
// // //                 return NotFound();

// // //             order.Status = "DeliveryAttempted";
// // //             order.DeliveryNotes = $"Attempt failed: {attempt.Reason}. {order.DeliveryNotes}";
            
// // //             // Lower priority for next attempt
// // //             order.Priority = 3;

// // //             await _context.SaveChangesAsync();

// // //             return Ok(new { message = "Delivery attempt recorded" });
// // //         }

// // //         // POST: api/driver/report-issue
// // //         [HttpPost("report-issue")]
// // //         [Authorize(Roles = "Driver")]
// // //         public async Task<IActionResult> ReportIssue([FromBody] IssueReport report)
// // //         {
// // //             var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
// // //             var driverId = int.Parse(userIdClaim?.Value ?? "0");

// // //             var issue = new RoadIssue
// // //             {
// // //                 DriverId = driverId,
// // //                 IssueType = report.IssueType,
// // //                 Description = report.Description,
// // //                 Latitude = report.Latitude,
// // //                 Longitude = report.Longitude,
// // //                 ReportedAt = DateTime.UtcNow
// // //             };

// // //             await _context.RoadIssues.AddAsync(issue);
// // //             await _context.SaveChangesAsync();

// // //             return Ok(new { message = "Issue reported successfully", issueId = issue.Id });
// // //         }
// // //     }

// // //     // DTOs
// // //     public class LocationUpdate
// // //     {
// // //         public double Latitude { get; set; }
// // //         public double Longitude { get; set; }
// // //         public double Speed { get; set; } = 0;
// // //         public double Heading { get; set; } = 0;
// // //     }

// // //     public class DeliveryAttempt
// // //     {
// // //         public string Reason { get; set; } = string.Empty;
// // //     }

// // //     public class IssueReport
// // //     {
// // //         public string IssueType { get; set; } = string.Empty;
// // //         public string Description { get; set; } = string.Empty;
// // //         public double Latitude { get; set; }
// // //         public double Longitude { get; set; }
// // //     }
// // // }

// // using Microsoft.AspNetCore.Mvc;
// // using Microsoft.EntityFrameworkCore;
// // using Microsoft.AspNetCore.Authorization;
// // using Backend.Data;
// // using Backend.Domain.Entity;
// // using Backend.Services;
// // using System.Security.Claims;

// // namespace Backend.Endpoints
// // {
// //     [ApiController]
// //     [Route("api/[controller]")]
// //     public class DriverController : ControllerBase
// //     {
// //         private readonly AppDbContext _context;
// //         private readonly DriverRouteOptimizationService _routeService;

// //         public DriverController(AppDbContext context, DriverRouteOptimizationService routeService)
// //         {
// //             _context = context;
// //             _routeService = routeService;
// //         }

// //         // // ============================================================
// //         // // ✅ GET TODAY’S ORDERS (Frontend uses camelCase)
// //         // // ============================================================
// //         // [HttpGet("orders/today")]
// //         // [Authorize(Roles = "Driver")]
// //         // public async Task<IActionResult> GetTodaysOrders()
// //         // {
// //         //     var driverId = GetDriverId();

// //         //     var orders = await _context.Orders
// //         //         .Where(o => o.DriverId == driverId)
// //         //         .Where(o => o.Status != "Delivered" && o.Status != "Cancelled")
// //         //         .Include(o => o.CurrentWarehouse)
// //         //         .OrderBy(o => o.Priority)
// //         //         .ToListAsync();

// //         //     return Ok(
// //         //         orders.Select(o => new
// //         //         {
// //         //             id = o.Id,
// //         //             trackingId = o.TrackingId,
// //         //             receiverName = o.ReceiverName,
// //         //             receiverAddress = o.ReceiverAddress,
// //         //             pickupAddress = o.PickupAddress,
// //         //             status = o.Status,
// //         //             priority = o.Priority,
// //         //             scheduledDate = o.ScheduledDate,
// //         //             currentWarehouse = o.CurrentWarehouse == null ? null : new
// //         //             {
// //         //                 name = o.CurrentWarehouse.Name,
// //         //                 city = o.CurrentWarehouse.City
// //         //             }
// //         //         })
// //         //     );
// //         // }

// //         [HttpGet("orders/today")]
// // [Authorize(Roles = "Driver")]
// // public async Task<IActionResult> GetTodaysOrders()
// // {
// //     var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
// //     var driverId = int.Parse(userIdClaim?.Value ?? "0");

// //     var orders = await _context.Orders
// //         .Where(o => o.DriverId == driverId)
// //         .Where(o => o.Status != "Delivered" && o.Status != "Cancelled")
// //         .Include(o => o.Sender)
// //         .Include(o => o.OriginWarehouse)
// //         .Include(o => o.DestinationWarehouse)
// //         .Include(o => o.CurrentWarehouse)
// //         .OrderBy(o => o.Priority)
// //         .Select(o => new
// //         {
// //             o.Id,
// //             o.TrackingId,
// //             o.Status,
// //             ReceiverName = o.ReceiverName,
// //             ReceiverAddress = o.ReceiverAddress,
// //             ReceiverEmail = o.ReceiverEmail,
// //             ReceiverPhone = o.ReceiverPhone,
// //             PickupAddress = o.PickupAddress,
// //             o.PickupLatitude,
// //             o.PickupLongitude,
// //             o.DeliveryLatitude,
// //             o.DeliveryLongitude,
// //             o.Priority,
// //             o.ScheduledDate,
// //             // Reschedule details (nullable)
// //             RescheduledAt = o.RescheduledAt,
// //             RescheduleReason = o.RescheduleReason,
// //             // Warehouse info for display
// //             CurrentWarehouse = o.CurrentWarehouse != null ? new {
// //                 o.CurrentWarehouse.Id,
// //                 o.CurrentWarehouse.Name,
// //                 o.CurrentWarehouse.City
// //             } : null
// //         })
// //         .ToListAsync();

// //     return Ok(orders);
// // }

// //         // ============================================================
// //         // ✅ GET OPTIMIZED ROUTE (Frontend uses camelCase)
// //         // ============================================================
// //         [HttpGet("route/optimized")]
// //         [Authorize(Roles = "Driver")]
// //         public async Task<IActionResult> GetOptimizedRoute()
// //         {
// //             var driverId = GetDriverId();

// //             var orders = await _context.Orders
// //                 .Where(o => o.DriverId == driverId && o.Status != "Delivered" && o.Status != "Cancelled")
// //                 .ToListAsync();

// //             var validOrders = orders
// //                 .Where(o => o.DeliveryLatitude != 0 && o.DeliveryLongitude != 0)
// //                 .Select(o => new
// //                 {
// //                     id = o.Id,
// //                     receiverAddress = o.ReceiverAddress,
// //                     pickupAddress = o.PickupAddress,
// //                     deliveryLatitude = o.DeliveryLatitude,
// //                     deliveryLongitude = o.DeliveryLongitude,
// //                     pickupLatitude = o.PickupLatitude,
// //                     pickupLongitude = o.PickupLongitude,
// //                     priority = o.Priority,
// //                     scheduledDate = o.ScheduledDate
// //                 })
// //                 .ToList();

// //             return Ok(validOrders);
// //         }

// //         // ============================================================
// //         // ✅ GET ALL ROUTE STOPS
// //         // ============================================================
// //         [HttpGet("route")]
// //         [Authorize(Roles = "Driver")]
// //         public async Task<IActionResult> GetRouteStops()
// //         {
// //             var driverId = GetDriverId();

// //             var routeStops = await _context.RouteStops
// //                 .Where(rs => rs.DriverId == driverId)
// //                 .Include(rs => rs.Order)
// //                 .OrderBy(rs => rs.SequenceNumber)
// //                 .ToListAsync();

// //             return Ok(routeStops);
// //         }

// //         // ============================================================
// //         // ✅ DRIVER UPDATES LOCATION
// //         // ============================================================
// //         [HttpPost("location")]
// //         [Authorize(Roles = "Driver")]
// //         public async Task<IActionResult> UpdateLocation([FromBody] LocationUpdate update)
// //         {
// //             var driverId = GetDriverId();

// //             var driver = await _context.Users.FindAsync(driverId);
// //             if (driver == null)
// //                 return NotFound();

// //             // Update live location
// //             driver.CurrentLatitude = update.Latitude;
// //             driver.CurrentLongitude = update.Longitude;

// //             // Save history
// //             await _context.DriverLocations.AddAsync(new DriverLocation
// //             {
// //                 DriverId = driverId,
// //                 Latitude = update.Latitude,
// //                 Longitude = update.Longitude,
// //                 Speed = update.Speed,
// //                 Heading = update.Heading,
// //                 UpdatedAt = DateTime.UtcNow
// //             });

// //             await _context.SaveChangesAsync();
// //             return Ok(new { message = "Location updated successfully" });
// //         }

// //         // ============================================================
// //         // ✅ MARK ORDER AS DELIVERED
// //         // ============================================================
// //         [HttpPost("mark-delivered/{orderId}")]
// //         [Authorize(Roles = "Driver")]
// //         public async Task<IActionResult> MarkDelivered(int orderId)
// //         {
// //             var order = await _context.Orders.FindAsync(orderId);
// //             if (order == null)
// //                 return NotFound();

// //             order.Status = "Delivered";
// //             order.DeliveredAt = DateTime.UtcNow;

// //             await _context.SaveChangesAsync();

// //             return Ok(new
// //             {
// //                 message = "Order delivered",
// //                 orderId = order.Id,
// //                 trackingId = order.TrackingId
// //             });
// //         }

// //         // ================= ORDER DETAILS FOR DRIVER =================
// // [HttpGet("order/{id}")]
// // [Authorize(Roles = "Driver")]
// // public async Task<IActionResult> GetOrderDetails(int id)
// // {
// //     var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
// //     int driverId = int.Parse(userIdClaim?.Value ?? "0");

// //     var order = await _context.Orders
// //         .Include(o => o.Sender)
// //         .Include(o => o.OriginWarehouse)
// //         .Include(o => o.DestinationWarehouse)
// //         .Include(o => o.CurrentWarehouse)
// //         .FirstOrDefaultAsync(o => o.Id == id && o.DriverId == driverId);

// //     if (order == null)
// //         return NotFound(new { message = "Order not found for this driver" });

// //     return Ok(new
// //     {
// //         order.Id,
// //         order.TrackingId,
// //         order.Status,

// //         // Customer details
// //         customerName = order.ReceiverName,
// //         customerEmail = order.ReceiverEmail,
// //         customerPhone = order.ReceiverPhone,

// //         // Reschedule section
// //         order.RescheduledAt,
// //         order.RescheduleReason,
// //         order.EstimatedDeliveryDate,

// //         // Addresses
// //         order.PickupAddress,
// //         order.ReceiverAddress,

// //         pickupLatitude = order.PickupLatitude,
// //         pickupLongitude = order.PickupLongitude,
// //         deliveryLatitude = order.DeliveryLatitude,
// //         deliveryLongitude = order.DeliveryLongitude,

// //         // Warehouse info
// //         originWarehouse = order.OriginWarehouse != null ? new 
// //         {
// //             order.OriginWarehouse.Id,
// //             order.OriginWarehouse.Name,
// //             order.OriginWarehouse.City
// //         } : null,

// //         destinationWarehouse = order.DestinationWarehouse != null ? new 
// //         {
// //             order.DestinationWarehouse.Id,
// //             order.DestinationWarehouse.Name,
// //             order.DestinationWarehouse.City
// //         } : null
// //     });
// // }


// //         // ============================================================
// //         // ✅ MARK DELIVERY ATTEMPTED
// //         // ============================================================
// //         [HttpPost("mark-attempted/{orderId}")]
// //         [Authorize(Roles = "Driver")]
// //         public async Task<IActionResult> MarkAttempted(int orderId, [FromBody] DeliveryAttempt attempt)
// //         {
// //             var order = await _context.Orders.FindAsync(orderId);
// //             if (order == null)
// //                 return NotFound();

// //             order.Status = "DeliveryAttempted";
// //             order.DeliveryNotes = $"Attempt failed: {attempt.Reason}. {order.DeliveryNotes}";
// //             order.Priority = 3; // lower priority for retries

// //             await _context.SaveChangesAsync();

// //             return Ok(new { message = "Attempt recorded", orderId = order.Id });
// //         }

// //         // ============================================================
// //         // ✅ CUSTOMER TRACKS ORDER (USED IN FRONTEND)
// //         // ============================================================
// //         [HttpGet("track/{orderId}")]
// //         public async Task<IActionResult> TrackOrder(int orderId)
// //         {
// //             var order = await _context.Orders
// //                 .Include(o => o.Driver)
// //                 .FirstOrDefaultAsync(o => o.Id == orderId);

// //             if (order == null)
// //                 return NotFound();

// //             var driverLoc = await _context.DriverLocations
// //                 .Where(dl => dl.DriverId == order.DriverId)
// //                 .OrderByDescending(dl => dl.UpdatedAt)
// //                 .FirstOrDefaultAsync();

// //             return Ok(new
// //             {
// //                 id = order.Id,
// //                 trackingId = order.TrackingId,
// //                 status = order.Status,
// //                 receiverName = order.ReceiverName,
// //                 receiverAddress = order.ReceiverAddress,
// //                 pickupAddress = order.PickupAddress,
// //                 driver = order.Driver == null ? null : new
// //                 {
// //                     name = order.Driver.Name,
// //                     email = order.Driver.Email
// //                 },
// //                 driverLocation = driverLoc == null ? null : new
// //                 {
// //                     latitude = driverLoc.Latitude,
// //                     longitude = driverLoc.Longitude,
// //                     speed = driverLoc.Speed,
// //                     updatedAt = driverLoc.UpdatedAt
// //                 },
// //                 estimatedDelivery = order.EstimatedDeliveryDate
// //             });
// //         }

        


// //         // ============================================================
// //         // ✅ ROAD ISSUE REPORT (SignalR + Recalculate Route)
// //         // ============================================================
// //         [HttpPost("report-issue")]
// //         [Authorize(Roles = "Driver")]
// //         public async Task<IActionResult> ReportIssue([FromBody] IssueReport report)
// //         {
// //             var driverId = GetDriverId();

// //             var issue = new RoadIssue
// //             {
// //                 DriverId = driverId,
// //                 IssueType = report.IssueType,
// //                 Description = report.Description,
// //                 Latitude = report.Latitude,
// //                 Longitude = report.Longitude,
// //                 ReportedAt = DateTime.UtcNow,
// //                 Status = "Active"
// //             };

// //             await _context.RoadIssues.AddAsync(issue);
// //             await _context.SaveChangesAsync();

// //             return Ok(new { message = "Issue reported", issueId = issue.Id });
// //         }

// //         // ============================================================
// //         // Helper: Extract driver ID from token
// //         // ============================================================
// //         private int GetDriverId()
// //         {
// //             var claim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
// //             return int.Parse(claim?.Value ?? "0");
// //         }
// //     }

// //     // ============================================================
// //     // DTO CLASSES
// //     // ============================================================
// //     public class LocationUpdate
// //     {
// //         public double Latitude { get; set; }
// //         public double Longitude { get; set; }
// //         public double Speed { get; set; } = 0;
// //         public double Heading { get; set; } = 0;
// //     }

// //     public class DeliveryAttempt
// //     {
// //         public string Reason { get; set; } = string.Empty;
// //     }

// //     public class IssueReport
// //     {
// //         public string IssueType { get; set; } = string.Empty;
// //         public string Description { get; set; } = string.Empty;
// //         public double Latitude { get; set; }
// //         public double Longitude { get; set; }
// //     }
// // }

// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.AspNetCore.Authorization;
// using Backend.Data;
// using Backend.Domain.Entity;
// using Backend.Services;
// using System.Security.Claims;

// namespace Backend.Endpoints
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     public class DriverController : ControllerBase
//     {
//         private readonly AppDbContext _context;
//         private readonly DriverRouteOptimizationService _routeService;

//         public DriverController(AppDbContext context, DriverRouteOptimizationService routeService)
//         {
//             _context = context;
//             _routeService = routeService;
//         }

//         // 🆕 GET TODAY'S ORDERS WITH AI PRIORITY
//         [HttpGet("orders/today")]
//         [Authorize(Roles = "Driver")]
//         public async Task<IActionResult> GetTodaysOrders()
//         {
//             var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
//             var driverId = int.Parse(userIdClaim?.Value ?? "0");

//             var orders = await _context.Orders
//                 .Where(o => o.DriverId == driverId)
//                 .Where(o => o.Status != "Delivered" && o.Status != "Cancelled")
//                 .Include(o => o.Sender)
//                 .Include(o => o.OriginWarehouse)
//                 .Include(o => o.DestinationWarehouse)
//                 .Include(o => o.CurrentWarehouse)
//                 .OrderByDescending(o => o.AiPriority ?? o.Priority) // 🔥 AI PRIORITY SORTING
//                 .Select(o => new
//                 {
//                     o.Id,
//                     o.TrackingId,
//                     o.Status,
//                     ReceiverName = o.ReceiverName,
//                     ReceiverAddress = o.ReceiverAddress,
//                     ReceiverEmail = o.ReceiverEmail,
//                     ReceiverPhone = o.ReceiverPhone,
//                     PickupAddress = o.PickupAddress,
//                     o.PickupLatitude,
//                     o.PickupLongitude,
//                     o.DeliveryLatitude,
//                     o.DeliveryLongitude,
//                     o.Priority,
//                     o.AiPriority, // 🆕 AI Priority
//                     o.AiPriorityJustification, // 🆕 AI Justification
//                     o.ScheduledDate,
//                     RescheduledAt = o.RescheduledAt,
//                     RescheduleReason = o.RescheduleReason,
//                     CurrentWarehouse = o.CurrentWarehouse != null ? new {
//                         o.CurrentWarehouse.Id,
//                         o.CurrentWarehouse.Name,
//                         o.CurrentWarehouse.City
//                     } : null
//                 })
//                 .ToListAsync();

//             return Ok(orders);
//         }

//         // 🆕 GET OPTIMIZED ROUTE WITH AI PRIORITY
//         [HttpGet("route/optimized")]
//         [Authorize(Roles = "Driver")]
//         public async Task<IActionResult> GetOptimizedRoute()
//         {
//             var driverId = GetDriverId();

//             var orders = await _context.Orders
//                 .Where(o => o.DriverId == driverId && o.Status != "Delivered" && o.Status != "Cancelled")
//                 .ToListAsync();

//             var validOrders = orders
//                 .Where(o => o.DeliveryLatitude != 0 && o.DeliveryLongitude != 0)
//                 .OrderByDescending(o => o.AiPriority ?? o.Priority) // 🔥 AI PRIORITY SORTING
//                 .ThenBy(o => o.ScheduledDate)
//                 .Select(o => new
//                 {
//                     id = o.Id,
//                     receiverAddress = o.ReceiverAddress,
//                     pickupAddress = o.PickupAddress,
//                     deliveryLatitude = o.DeliveryLatitude,
//                     deliveryLongitude = o.DeliveryLongitude,
//                     pickupLatitude = o.PickupLatitude,
//                     pickupLongitude = o.PickupLongitude,
//                     priority = o.Priority,
//                     aiPriority = o.AiPriority,
//                     scheduledDate = o.ScheduledDate,
//                     rescheduledAt = o.RescheduledAt,
//                     rescheduleReason = o.RescheduleReason
//                 })
//                 .ToList();

//             // return Ok(validOrders);
//             return Ok(new { stops = validOrders });

//         }

//         // GET ALL ROUTE STOPS
//         [HttpGet("route")]
//         [Authorize(Roles = "Driver")]
//         public async Task<IActionResult> GetRouteStops()
//         {
//             var driverId = GetDriverId();

//             var routeStops = await _context.RouteStops
//                 .Where(rs => rs.DriverId == driverId)
//                 .Include(rs => rs.Order)
//                 .OrderBy(rs => rs.SequenceNumber)
//                 .ToListAsync();

//             return Ok(routeStops);
//         }

//         // UPDATE LOCATION
//         [HttpPost("location")]
//         [Authorize(Roles = "Driver")]
//         public async Task<IActionResult> UpdateLocation([FromBody] LocationUpdate update)
//         {
//             var driverId = GetDriverId();

//             var driver = await _context.Users.FindAsync(driverId);
//             if (driver == null)
//                 return NotFound();

//             driver.CurrentLatitude = update.Latitude;
//             driver.CurrentLongitude = update.Longitude;

//             await _context.DriverLocations.AddAsync(new DriverLocation
//             {
//                 DriverId = driverId,
//                 Latitude = update.Latitude,
//                 Longitude = update.Longitude,
//                 Speed = update.Speed,
//                 Heading = update.Heading,
//                 UpdatedAt = DateTime.UtcNow
//             });

//             await _context.SaveChangesAsync();
//             return Ok(new { message = "Location updated successfully" });
//         }

//         // MARK ORDER AS DELIVERED
//         [HttpPost("mark-delivered/{orderId}")]
//         [Authorize(Roles = "Driver")]
//         public async Task<IActionResult> MarkDelivered(int orderId)
//         {
//             var order = await _context.Orders.FindAsync(orderId);
//             if (order == null)
//                 return NotFound();

//             order.Status = "Delivered";
//             order.DeliveredAt = DateTime.UtcNow;

//             await _context.SaveChangesAsync();

//             return Ok(new
//             {
//                 message = "Order delivered",
//                 orderId = order.Id,
//                 trackingId = order.TrackingId
//             });
//         }

//         // 🆕 ORDER DETAILS FOR DRIVER WITH AI PRIORITY
//         [HttpGet("order/{id}")]
//         [Authorize(Roles = "Driver")]
//         public async Task<IActionResult> GetOrderDetails(int id)
//         {
//             var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
//             int driverId = int.Parse(userIdClaim?.Value ?? "0");

//             var order = await _context.Orders
//                 .Include(o => o.Sender)
//                 .Include(o => o.OriginWarehouse)
//                 .Include(o => o.DestinationWarehouse)
//                 .Include(o => o.CurrentWarehouse)
//                 .FirstOrDefaultAsync(o => o.Id == id && o.DriverId == driverId);

//             if (order == null)
//                 return NotFound(new { message = "Order not found for this driver" });

//             return Ok(new
//             {
//                 order.Id,
//                 order.TrackingId,
//                 order.Status,
//                 customerName = order.ReceiverName,
//                 customerEmail = order.ReceiverEmail,
//                 customerPhone = order.ReceiverPhone,
//                 order.RescheduledAt,
//                 order.RescheduleReason,
//                 order.EstimatedDeliveryDate,
//                 order.PickupAddress,
//                 order.ReceiverAddress,
//                 pickupLatitude = order.PickupLatitude,
//                 pickupLongitude = order.PickupLongitude,
//                 deliveryLatitude = order.DeliveryLatitude,
//                 deliveryLongitude = order.DeliveryLongitude,
//                 order.Priority,
//                 order.AiPriority, // 🆕 AI Priority
//                 order.AiPriorityJustification, // 🆕 AI Justification
//                 originWarehouse = order.OriginWarehouse != null ? new 
//                 {
//                     order.OriginWarehouse.Id,
//                     order.OriginWarehouse.Name,
//                     order.OriginWarehouse.City
//                 } : null,
//                 destinationWarehouse = order.DestinationWarehouse != null ? new 
//                 {
//                     order.DestinationWarehouse.Id,
//                     order.DestinationWarehouse.Name,
//                     order.DestinationWarehouse.City
//                 } : null,
//                 senderName = order.SenderName,
//                 senderPhone = order.SenderPhone,
//                 senderEmail = order.SenderEmail
//             });
//         }

//         // MARK DELIVERY ATTEMPTED
//         [HttpPost("mark-attempted/{orderId}")]
//         [Authorize(Roles = "Driver")]
//         public async Task<IActionResult> MarkAttempted(int orderId, [FromBody] DeliveryAttempt attempt)
//         {
//             var order = await _context.Orders.FindAsync(orderId);
//             if (order == null)
//                 return NotFound();

//             order.Status = "DeliveryAttempted";
//             order.DeliveryNotes = $"Attempt failed: {attempt.Reason}. {order.DeliveryNotes}";
//             order.Priority = 3;

//             await _context.SaveChangesAsync();

//             return Ok(new { message = "Attempt recorded", orderId = order.Id });
//         }

//         // CUSTOMER TRACKS ORDER
//         [HttpGet("track/{orderId}")]
//         public async Task<IActionResult> TrackOrder(int orderId)
//         {
//             var order = await _context.Orders
//                 .Include(o => o.Driver)
//                 .FirstOrDefaultAsync(o => o.Id == orderId);

//             if (order == null)
//                 return NotFound();

//             var driverLoc = await _context.DriverLocations
//                 .Where(dl => dl.DriverId == order.DriverId)
//                 .OrderByDescending(dl => dl.UpdatedAt)
//                 .FirstOrDefaultAsync();

//             return Ok(new
//             {
//                 id = order.Id,
//                 trackingId = order.TrackingId,
//                 status = order.Status,
//                 receiverName = order.ReceiverName,
//                 receiverAddress = order.ReceiverAddress,
//                 pickupAddress = order.PickupAddress,
//                 aiPriority = order.AiPriority,
//                 driver = order.Driver == null ? null : new
//                 {
//                     name = order.Driver.Name,
//                     email = order.Driver.Email
//                 },
//                 driverLocation = driverLoc == null ? null : new
//                 {
//                     latitude = driverLoc.Latitude,
//                     longitude = driverLoc.Longitude,
//                     speed = driverLoc.Speed,
//                     updatedAt = driverLoc.UpdatedAt
//                 },
//                 estimatedDelivery = order.EstimatedDeliveryDate
//             });
//         }

//         private int GetDriverId()
//         {
//             var claim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
//             return int.Parse(claim?.Value ?? "0");
//         }
//     }

//     public class LocationUpdate
//     {
//         public double Latitude { get; set; }
//         public double Longitude { get; set; }
//         public double Speed { get; set; } = 0;
//         public double Heading { get; set; } = 0;
//     }

//     public class DeliveryAttempt
//     {
//         public string Reason { get; set; } = string.Empty;
//     }
// }

// Backend/Endpoints/DriverController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Backend.Data;
using Backend.Domain.Entity;
using Backend.Services;
using System.Security.Claims;

namespace Backend.Endpoints
{
    [ApiController]
    [Route("api/[controller]")]
    public class DriverController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly DriverRouteOptimizationService _routeService;

        public DriverController(AppDbContext context, DriverRouteOptimizationService routeService)
        {
            _context = context;
            _routeService = routeService;
        }

        // GET TODAY'S ORDERS WITH AI PRIORITY
        [HttpGet("orders/today")]
        [Authorize(Roles = "Driver")]
        public async Task<IActionResult> GetTodaysOrders()
        {
            var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            var driverId = int.Parse(userIdClaim?.Value ?? "0");

            var orders = await _context.Orders
                .Where(o => o.DriverId == driverId)
                .Where(o => o.Status != "Delivered" && o.Status != "Cancelled")
                .Include(o => o.Sender)
                .Include(o => o.OriginWarehouse)
                .Include(o => o.DestinationWarehouse)
                .Include(o => o.CurrentWarehouse)
                .OrderByDescending(o => o.AiPriority ?? o.Priority)
                .Select(o => new
                {
                    o.Id,
                    o.TrackingId,
                    o.Status,
                    ReceiverName = o.ReceiverName,
                    ReceiverAddress = o.ReceiverAddress,
                    ReceiverEmail = o.ReceiverEmail,
                    ReceiverPhone = o.ReceiverPhone,
                    PickupAddress = o.PickupAddress,
                    o.PickupLatitude,
                    o.PickupLongitude,
                    o.DeliveryLatitude,
                    o.DeliveryLongitude,
                    o.Priority,
                    o.AiPriority,
                    o.AiPriorityJustification,
                    o.ScheduledDate,
                    RescheduledAt = o.RescheduledAt,
                    RescheduleReason = o.RescheduleReason,
                    CurrentWarehouse = o.CurrentWarehouse != null
                        ? new
                        {
                            o.CurrentWarehouse.Id,
                            o.CurrentWarehouse.Name,
                            o.CurrentWarehouse.City
                        }
                        : null
                })
                .ToListAsync();

            return Ok(orders);
        }

        // GET OPTIMIZED ROUTE WITH AI PRIORITY
        [HttpGet("route/optimized")]
        [Authorize(Roles = "Driver")]
        public async Task<IActionResult> GetOptimizedRoute()
        {
            var driverId = GetDriverId();

            var orders = await _context.Orders
                .Where(o => o.DriverId == driverId && o.Status != "Delivered" && o.Status != "Cancelled")
                .ToListAsync();

            var validOrders = orders
                .Where(o => o.DeliveryLatitude != 0 && o.DeliveryLongitude != 0)
                .OrderByDescending(o => o.AiPriority ?? o.Priority)
                .ThenBy(o => o.ScheduledDate)
                .Select(o => new
                {
                    id = o.Id,
                    receiverAddress = o.ReceiverAddress,
                    pickupAddress = o.PickupAddress,
                    deliveryLatitude = o.DeliveryLatitude,
                    deliveryLongitude = o.DeliveryLongitude,
                    pickupLatitude = o.PickupLatitude,
                    pickupLongitude = o.PickupLongitude,
                    priority = o.Priority,
                    aiPriority = o.AiPriority,
                    scheduledDate = o.ScheduledDate,
                    rescheduledAt = o.RescheduledAt,
                    rescheduleReason = o.RescheduleReason
                })
                .ToList();

            return Ok(validOrders);
        }

        // 🆕 ACTIVE ROAD ISSUES FOR DRIVER MAP
        [HttpGet("road-issues")]
        [Authorize(Roles = "Driver")]
        public async Task<IActionResult> GetActiveRoadIssues()
        {
            // Adjust filter according to your RoadIssue entity (IsResolved / Status)
            var issues = await _context.RoadIssues
                .Where(r => !r.IsResolved)        // or r.Status == "Active"
                .OrderByDescending(r => r.ReportedAt)
                .Select(r => new
                {
                    r.Id,
                    IssueType = r.IssueType,
                    r.Description,
                    r.Severity,
                    r.Latitude,
                    r.Longitude,
                    r.ReportedAt
                })
                .ToListAsync();

            return Ok(issues);
        }

        // GET ALL ROUTE STOPS
        [HttpGet("route")]
        [Authorize(Roles = "Driver")]
        public async Task<IActionResult> GetRouteStops()
        {
            var driverId = GetDriverId();

            var routeStops = await _context.RouteStops
                .Where(rs => rs.DriverId == driverId)
                .Include(rs => rs.Order)
                .OrderBy(rs => rs.SequenceNumber)
                .ToListAsync();

            return Ok(routeStops);
        }

        // UPDATE LOCATION
        [HttpPost("location")]
        [Authorize(Roles = "Driver")]
        public async Task<IActionResult> UpdateLocation([FromBody] LocationUpdate update)
        {
            var driverId = GetDriverId();

            var driver = await _context.Users.FindAsync(driverId);
            if (driver == null)
                return NotFound();

            driver.CurrentLatitude = update.Latitude;
            driver.CurrentLongitude = update.Longitude;

            await _context.DriverLocations.AddAsync(new DriverLocation
            {
                DriverId = driverId,
                Latitude = update.Latitude,
                Longitude = update.Longitude,
                Speed = update.Speed,
                Heading = update.Heading,
                UpdatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Location updated successfully" });
        }

        // MARK ORDER AS DELIVERED
        [HttpPost("mark-delivered/{orderId}")]
        [Authorize(Roles = "Driver")]
        public async Task<IActionResult> MarkDelivered(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                return NotFound();

            order.Status = "Delivered";
            order.DeliveredAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Order delivered",
                orderId = order.Id,
                trackingId = order.TrackingId
            });
        }

        // ORDER DETAILS FOR DRIVER WITH AI PRIORITY
        [HttpGet("order/{id}")]
        [Authorize(Roles = "Driver")]
        public async Task<IActionResult> GetOrderDetails(int id)
        {
            var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            int driverId = int.Parse(userIdClaim?.Value ?? "0");

            var order = await _context.Orders
                .Include(o => o.Sender)
                .Include(o => o.OriginWarehouse)
                .Include(o => o.DestinationWarehouse)
                .Include(o => o.CurrentWarehouse)
                .FirstOrDefaultAsync(o => o.Id == id && o.DriverId == driverId);

            if (order == null)
                return NotFound(new { message = "Order not found for this driver" });

            return Ok(new
            {
                order.Id,
                order.TrackingId,
                order.Status,
                customerName = order.ReceiverName,
                customerEmail = order.ReceiverEmail,
                customerPhone = order.ReceiverPhone,
                order.RescheduledAt,
                order.RescheduleReason,
                order.EstimatedDeliveryDate,
                order.PickupAddress,
                order.ReceiverAddress,
                pickupLatitude = order.PickupLatitude,
                pickupLongitude = order.PickupLongitude,
                deliveryLatitude = order.DeliveryLatitude,
                deliveryLongitude = order.DeliveryLongitude,
                order.Priority,
                order.AiPriority,
                order.AiPriorityJustification,
                originWarehouse = order.OriginWarehouse != null ? new
                {
                    order.OriginWarehouse.Id,
                    order.OriginWarehouse.Name,
                    order.OriginWarehouse.City
                } : null,
                destinationWarehouse = order.DestinationWarehouse != null ? new
                {
                    order.DestinationWarehouse.Id,
                    order.DestinationWarehouse.Name,
                    order.DestinationWarehouse.City
                } : null,
                senderName = order.SenderName,
                senderPhone = order.SenderPhone,
                senderEmail = order.SenderEmail
            });
        }

        // MARK DELIVERY ATTEMPTED
        [HttpPost("mark-attempted/{orderId}")]
        [Authorize(Roles = "Driver")]
        public async Task<IActionResult> MarkAttempted(int orderId, [FromBody] DeliveryAttempt attempt)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                return NotFound();

            order.Status = "DeliveryAttempted";
            order.DeliveryNotes = $"Attempt failed: {attempt.Reason}. {order.DeliveryNotes}";
            order.Priority = 3;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Attempt recorded", orderId = order.Id });
        }

        // CUSTOMER TRACKS ORDER
        [HttpGet("track/{orderId}")]
        public async Task<IActionResult> TrackOrder(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.Driver)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                return NotFound();

            var driverLoc = await _context.DriverLocations
                .Where(dl => dl.DriverId == order.DriverId)
                .OrderByDescending(dl => dl.UpdatedAt)
                .FirstOrDefaultAsync();

            return Ok(new
            {
                id = order.Id,
                trackingId = order.TrackingId,
                status = order.Status,
                receiverName = order.ReceiverName,
                receiverAddress = order.ReceiverAddress,
                pickupAddress = order.PickupAddress,
                aiPriority = order.AiPriority,
                driver = order.Driver == null ? null : new
                {
                    name = order.Driver.Name,
                    email = order.Driver.Email
                },
                driverLocation = driverLoc == null ? null : new
                {
                    latitude = driverLoc.Latitude,
                    longitude = driverLoc.Longitude,
                    speed = driverLoc.Speed,
                    updatedAt = driverLoc.UpdatedAt
                },
                estimatedDelivery = order.EstimatedDeliveryDate
            });
        }

        private int GetDriverId()
        {
            var claim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            return int.Parse(claim?.Value ?? "0");
        }
    }

    public class LocationUpdate
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double Speed { get; set; } = 0;
        public double Heading { get; set; } = 0;
    }

    public class DeliveryAttempt
    {
        public string Reason { get; set; } = string.Empty;
    }
}
