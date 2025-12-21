using Backend.Data;
using Backend.Domain.Entity;
using Backend.DTOs;
using Backend.Services;
using Backend.Hubs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

public static class OrdersEndpoints
{
    public static void MapOrdersEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/orders").WithTags("Orders");

        // ROLES:
        const string ROLE_CUSTOMER = "customer";
        const string ROLE_SENDER = "seller";
        const string ROLE_ADMIN = "admin";

        const string STATUS_PENDING_ASSIGNMENT = "Pending" ;
        const string STATUS_ORIGIN_ASSIGNMENT = "AtOriginWarehouse";
        const string STATUS_ASSIGNED = "Assigned";
        const string STATUS_APPROVED = "Approved";

        group.MapPost("/", async (
            HttpContext http,
            CreateOrderDto dto,
            AppDbContext context,
            IEmailService emailService,
            WarehouseAssignmentService warehouseService
        ) =>
        {
            try
            {
                var order = new Order
                {
                    ReceiverName = dto.ReceiverName,
                    ReceiverAddress = dto.ReceiverAddress,
                    ReceiverPhone = dto.ReceiverPhone,
                    ReceiverEmail = dto.ReceiverEmail,
                    ReceiverPincode = dto.ReceiverPincode,
                    PickupAddress = dto.PickupAddress,
                    PickupPincode = dto.PickupPincode,
                    DeliveryPincode = dto.DeliveryPincode,
                    ParcelSize = dto.ParcelSize,
                    Weight = dto.Weight,
                    Price = dto.Price,
                    DeliveryType = dto.DeliveryType,
                    DeliveryNotes = dto.DeliveryNotes,
                    SenderName = dto.SenderName,
                    SenderPhone = dto.SenderPhone,
                    SenderEmail = dto.SenderEmail,
                    PickupLatitude = dto.PickupLatitude,
                    PickupLongitude = dto.PickupLongitude,
                    DeliveryLatitude = dto.DeliveryLatitude,
                    DeliveryLongitude = dto.DeliveryLongitude,
                    ScheduledDate = dto.ScheduledDate.HasValue 
                        ? DateTime.SpecifyKind(dto.ScheduledDate.Value, DateTimeKind.Utc) 
                        : null,
                    ScheduledTimeSlot = dto.ScheduledTimeSlot,
                    
                    // 🆕 ASR FIELD
                    IsASR = dto.IsASR ?? false,
                    ASRStatus = (dto.IsASR ?? false) ? "NotStarted" : "NotApplicable",
                    
                    // Metadata
                    TrackingId = Guid.NewGuid().ToString("N")[..10].ToUpper(),
                    Status = "AtOriginWarehouse",
                    CreatedAt = DateTime.UtcNow
                };

                var userIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
                var userId = int.Parse(userIdClaim?.Value ?? "0");
                order.SenderId = userId;

                if (!string.IsNullOrWhiteSpace(order.ReceiverEmail))
                {
                    var customer = await context.Users
                        .FirstOrDefaultAsync(u => u.UserEmail == order.ReceiverEmail && u.UserRole == ROLE_CUSTOMER);

                    if (customer != null)
                        order.CustomerId = customer.UserId;
                }

                // --- WAREHOUSE LOGIC ---
                string? TryExtractPincode(string addr)
                {
                    if (string.IsNullOrWhiteSpace(addr)) return null;
                    var tokens = addr.Split(new[] { ' ', ',', '-' }, StringSplitOptions.RemoveEmptyEntries);
                    foreach(var t in tokens.Reverse())
                    {
                        if (t.Length >= 5 && t.All(char.IsDigit)) return t;
                    }
                    return null;
                }

                var pickupPincode = !string.IsNullOrWhiteSpace(order.PickupPincode)
                    ? order.PickupPincode
                    : TryExtractPincode(order.PickupAddress);

                var deliveryPincode = !string.IsNullOrWhiteSpace(order.DeliveryPincode)
                    ? order.DeliveryPincode
                    : !string.IsNullOrWhiteSpace(order.ReceiverPincode) ? order.ReceiverPincode
                    : TryExtractPincode(order.ReceiverAddress);

                Warehouse? originWarehouse = null;
                Warehouse? destinationWarehouse = null;

                if (!string.IsNullOrWhiteSpace(pickupPincode))
                    originWarehouse = await warehouseService.FindNearestWarehouseByPincodeAsync(pickupPincode);

                if (!string.IsNullOrWhiteSpace(deliveryPincode))
                    destinationWarehouse = await warehouseService.FindNearestWarehouseByPincodeAsync(deliveryPincode);

                // Fallback: Pick first available warehouse
                if (originWarehouse == null)
                    originWarehouse = await context.Warehouses.FirstOrDefaultAsync();

                if (destinationWarehouse == null)
                    destinationWarehouse = await context.Warehouses.FirstOrDefaultAsync();

                order.OriginWarehouseId = originWarehouse?.Id;
                order.DestinationWarehouseId = destinationWarehouse?.Id;
                order.CurrentWarehouseId = originWarehouse?.Id;

                context.Orders.Add(order);
                await context.SaveChangesAsync();

                // Update counters
                await warehouseService.AssignOrderToWarehousesAsync(order);

                await emailService.SendOrderPlacedEmailAsync(new OrderEmailDto
                {
                    OrderId = order.Id,
                    TrackingId = order.TrackingId,

                    SellerName = order.SenderName,
                    SellerPhone = order.SenderPhone,
                    SellerEmail = order.SenderEmail,

                    CustomerName = order.ReceiverName,
                    CustomerEmail = order.ReceiverEmail,
                    CustomerPhone = order.ReceiverPhone,

                    PickupAddress = order.PickupAddress,
                    DeliveryAddress = order.ReceiverAddress,

                    Price = order.Price,
                    IsASR = order.IsASR
                });


                return Results.Ok(order);
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new
                {
                    message = ex.Message,
                    innerException = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = ROLE_SENDER });

        // ... REST OF YOUR ENDPOINTS (keep as is) ...

        group.MapPost("/{id}/reschedule", async (
            int id,
            RescheduleDto dto,
            HttpContext http,
            AppDbContext context,
            GeminiService geminiService,
            DriverRouteOptimizationService driverRouteService,
            IHubContext<LogisticsHub> hubContext
        ) =>
        {
            var customerIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
            var customerId = int.Parse(customerIdClaim?.Value ?? "0");

            var order = await context.Orders
                .Include(o => o.Driver)
                .FirstOrDefaultAsync(o => o.Id == id && o.CustomerId == customerId);

            if (order == null)
                return Results.NotFound(new { message = "Order not found or not authorized" });

            if (order.Status == "Delivered" || order.Status == "Cancelled")
                return Results.BadRequest(new { message = "Cannot reschedule completed orders" });

            double distance = Haversine(order.PickupLatitude, order.PickupLongitude,
                                        order.DeliveryLatitude, order.DeliveryLongitude);

            int driverLoad = 0;
            if (order.DriverId.HasValue)
            {
                driverLoad = await context.Orders
                    .Where(o => o.DriverId == order.DriverId.Value &&
                                o.Status != "Delivered" &&
                                o.Status != "Cancelled")
                    .CountAsync();
            }

            int orderAgeHours = (int)(DateTime.UtcNow - order.CreatedAt).TotalHours;

            var ai = await geminiService.CalculateDeliveryPriority(
                dto.NewDate,
                distance,
                dto.Reason,
                driverLoad,
                orderAgeHours
            );

            // Update
            order.RescheduledAt = DateTime.UtcNow;
            order.RescheduledDate = dto.NewDate.ToUniversalTime();
            order.EstimatedDeliveryDate = dto.NewDate.ToUniversalTime();
            order.RescheduleReason = dto.Reason;
            order.AiPriority = ai.AiPriority;
            order.AiPriorityJustification = ai.Justification;
            order.Priority = ai.AiPriority;

            await context.SaveChangesAsync();

            if (order.DriverId.HasValue)
            {
                await hubContext.Clients
                    .Group($"Driver_{order.DriverId.Value}_Route")
                    .SendAsync("OrderRescheduled", new
                    {
                        orderId = order.Id,
                        order.TrackingId,
                        newDate = order.EstimatedDeliveryDate,
                        reason = order.RescheduleReason,
                        order.ReceiverName,
                        order.ReceiverEmail,
                        order.ReceiverPhone,
                        aiPriority = order.AiPriority,
                        aiJustification = order.AiPriorityJustification
                    });

                await driverRouteService.OptimizeRouteAfterReschedule(order.DriverId.Value);

                var optimized = await driverRouteService.GenerateRouteForDriver(order.DriverId.Value);

                await hubContext.Clients
                    .Group($"Driver_{order.DriverId.Value}_Route")
                    .SendAsync("ReceiveRouteUpdate", optimized);
            }

            return Results.Ok(new
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

        }).RequireAuthorization(new AuthorizeAttribute { Roles = ROLE_CUSTOMER });

        // Keep all other endpoints the same...
        group.MapGet("/track-public/{trackingId}", async (
            string trackingId,
            AppDbContext context
        ) =>
        {
            var order = await context.Orders
                .Include(o => o.Driver)
                .Include(o => o.OriginWarehouse)
                .Include(o => o.CurrentWarehouse)
                .Include(o => o.DestinationWarehouse)
                .FirstOrDefaultAsync(o => o.TrackingId == trackingId);

            if (order == null)
                return Results.NotFound(new { message = "Invalid tracking ID" });

            var latestLocation = await context.DriverLocations
                .Where(dl => dl.DriverId == order.DriverId)
                .OrderByDescending(dl => dl.UpdatedAt)
                .FirstOrDefaultAsync();

            return Results.Ok(new
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
                    order.IsASR,
                    order.ASRStatus,
                    driver = order.Driver != null ? new
                    {
                        order.Driver.UserId,
                        DriverName = order.Driver.UserFName + " " + order.Driver.UserLName
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
                driverLocation = latestLocation != null ? new
                {
                    latestLocation.Latitude,
                    latestLocation.Longitude,
                    latestLocation.UpdatedAt
                } : null
            });
        });

        group.MapGet("/admin/all", async (AppDbContext context) =>
        {
            var orders = await context.Orders
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
                    o.IsASR,
                    o.ASRStatus,
                    driverId = o.DriverId,
                    driverName = o.Driver != null ? o.Driver.UserFName + " " + o.Driver.UserLName : null
                })
                .ToListAsync();

            return Results.Ok(orders);
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = ROLE_ADMIN });

        group.MapGet("/pending", async (AppDbContext context) =>
        {
            var orders = await context.Orders
                .Where(o => o.Status == STATUS_PENDING_ASSIGNMENT || o.Status == STATUS_ORIGIN_ASSIGNMENT)
                .Include(o => o.Driver)
                .Include(o => o.OriginWarehouse)
                .Include(o => o.CurrentWarehouse)
                .Include(o => o.DestinationWarehouse)
                .OrderByDescending(o => o.IsASR)  // 🆕 ASR orders first
                .ThenByDescending(o => o.CreatedAt)
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
                    o.IsASR,
                    o.ASRStatus,
                    driverId = o.DriverId,
                    driverName = o.Driver != null ? o.Driver.UserFName + " " + o.Driver.UserLName : null
                })
                .ToListAsync();

            return Results.Ok(orders);
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = ROLE_ADMIN });

        group.MapGet("/assigned", async (AppDbContext context) =>
        {
            var orders = await context.Orders
                .Where(o => o.Status == STATUS_ASSIGNED)
                .Include(o => o.Driver)
                .Include(o => o.OriginWarehouse)
                .Include(o => o.CurrentWarehouse)
                .Include(o => o.DestinationWarehouse)
                .OrderByDescending(o => o.IsASR)  // 🆕 ASR orders first
                .ThenByDescending(o => o.CreatedAt)
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
                    o.IsASR,
                    o.ASRStatus,
                    driverId = o.DriverId,
                    driverName = o.Driver != null ? o.Driver.UserFName + " " + o.Driver.UserLName : null
                })
                .ToListAsync();

            return Results.Ok(orders);
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = ROLE_ADMIN });

        group.MapGet("/my-status-counts", async (HttpContext http, AppDbContext context) =>
        {
            var userIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
            int userId = int.Parse(userIdClaim?.Value ?? "0");

            var statusCounts = await context.Orders
                .Where(o => o.CustomerId == userId)
                .GroupBy(o => o.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToDictionaryAsync(g => g.Status ?? "Unknown", g => g.Count);

            return Results.Ok(statusCounts);
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = ROLE_CUSTOMER });

        group.MapGet("/my-orders", async (HttpContext http, AppDbContext context) =>
        {
            var userIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
            int userId = int.Parse(userIdClaim?.Value ?? "0");
            Console.WriteLine($"[DEBUG] /my-orders requested by UserId: {userId}");

            var orders = await context.Orders
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
                    o.Price,
                    o.SenderName,
                    o.PickupAddress,
                    o.ReceiverName,
                    o.ReceiverAddress,
                    o.CreatedAt,
                    o.EstimatedDeliveryDate,
                    o.RescheduledAt,
                    o.RescheduleReason,
                    o.AiPriority,
                    o.AiPriorityJustification,
                    o.IsASR,
                    o.ASRStatus,
                    o.DriverId,
                    driver = o.Driver != null ? new { o.Driver.UserId, DriverName = o.Driver.UserFName + " " + o.Driver.UserLName } : null,
                    originWarehouse = o.OriginWarehouse != null ? new { o.OriginWarehouse.Id, o.OriginWarehouse.Name, o.OriginWarehouse.City } : null,
                    currentWarehouse = o.CurrentWarehouse != null ? new { o.CurrentWarehouse.Id, o.CurrentWarehouse.Name, o.CurrentWarehouse.City } : null,
                    destinationWarehouse = o.DestinationWarehouse != null ? new { o.DestinationWarehouse.Id, o.DestinationWarehouse.Name, o.DestinationWarehouse.City } : null
                })
                .ToListAsync();

            return Results.Ok(orders);
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = ROLE_CUSTOMER });

        group.MapGet("/my-sent-orders", async (HttpContext http, AppDbContext context) =>
        {
            var userIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
            int userId = int.Parse(userIdClaim?.Value ?? "0");

            var orders = await context.Orders
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
                    o.Price,
                    o.SenderName,
                    o.PickupAddress,
                    o.ReceiverName,
                    o.ReceiverAddress,
                    o.ReceiverEmail,
                    o.ReceiverPhone,
                    o.CreatedAt,
                    o.EstimatedDeliveryDate,
                    o.AiPriority,
                    o.IsASR,
                    o.ASRStatus,
                    driver = o.Driver != null ? new { o.Driver.UserId, DriverName = (o.Driver.UserFName + " " + o.Driver.UserLName) } : null
                })
                .ToListAsync();

            return Results.Ok(orders);
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = ROLE_SENDER });

        group.MapPost("/{orderId}/assign-driver/{driverId}", async (
            int orderId,
            int driverId,
            AppDbContext context,
            RouteOptimizationService optimizationService,
            GeofenceService geofenceService
        ) =>
        {
            var order = await context.Orders.FindAsync(orderId);
            if (order == null) return Results.NotFound();

            var driver = await context.Users.FindAsync(driverId);
            if (driver == null || driver.UserRole != "driver")
                return Results.BadRequest(new { message = "Invalid driver" });

            order.DriverId = driverId;
            order.Status = STATUS_ASSIGNED;
            await context.SaveChangesAsync();

            await optimizationService.OptimizeRouteForDriver(driverId);

            var exists = await context.Geofences.AnyAsync(g => g.OrderId == orderId && g.IsActive);
            if (!exists)
                await geofenceService.CreateGeofenceForOrderAsync(order);

            return Results.Ok(order);
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = ROLE_ADMIN });

        group.MapPost("/{id}/approve", async (
            int id,
            AppDbContext context,
            RouteOptimizationService optimizationService,
            GeofenceService geofenceService
        ) =>
        {
            var order = await context.Orders.FindAsync(id);
            if (order == null) return Results.NotFound();

            order.Status = STATUS_APPROVED;

            var driver = await context.Users
                .FirstOrDefaultAsync(u => u.UserRole == "driver" && u.IsAvailable);

            if (driver != null)
            {
                order.DriverId = driver.UserId;
                order.Status = STATUS_ASSIGNED;
                await context.SaveChangesAsync();

                await optimizationService.OptimizeRouteForDriver(driver.UserId);

                var exists = await context.Geofences.AnyAsync(g => g.OrderId == order.Id && g.IsActive);
                if (!exists)
                    await geofenceService.CreateGeofenceForOrderAsync(order);
            }
            else
            {
                await context.SaveChangesAsync();
            }

            return Results.Ok(order);
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = ROLE_ADMIN });

        group.MapGet("/my-orders/{id}", async (int id, AppDbContext db) =>
        {
            var order = await db.Orders.Include(ord => ord.Driver).FirstOrDefaultAsync((ord) => ord.Id == id);
            if (order == null) return Results.NotFound("Id not found");

            Backend.Domain.Entity.DriverLocation? latestLoc = null;
            if (order.DriverId.HasValue)
            {
                latestLoc = await db.DriverLocations
                    .Where(d => d.DriverId == order.DriverId.Value)
                    .OrderByDescending(d => d.UpdatedAt)
                    .FirstOrDefaultAsync();
            }

            return Results.Ok(new { order, latestDriverLocation = latestLoc });
        });

        static double Haversine(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371;
            var dLat = (lat2 - lat1) * Math.PI / 180.0;
            var dLon = (lon2 - lon1) * Math.PI / 180.0;

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(lat1 * Math.PI / 180.0) *
                    Math.Cos(lat2 * Math.PI / 180.0) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }
    }
}