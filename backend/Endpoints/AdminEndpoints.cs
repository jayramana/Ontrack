using Backend.Data;
using Backend.Domain.Entity;
using Backend.Hubs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

public static class AdminEndpoints
{
    public static void MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        var admin = app.MapGroup("/api/admin")
                       .RequireAuthorization(new AuthorizeAttribute { Roles = "admin" }).WithTags("Admin");


        admin.MapGet("/dashboard", async (AppDbContext context) =>
        {
            var drivers = await context.Users
                .Where(u => u.UserRole == "driver")
                .Select(u => new { u.UserId, u.UserFName, u.UserLName, u.CurrentLatitude, u.CurrentLongitude, u.IsAvailable })
                .ToListAsync();

            var activeOrders = await context.Orders
                .Where(o => o.Status != "Delivered")
                .Include(o => o.Driver)
                .Select(o => new
                {
                    o.Id,
                    o.Status,
                    o.PickupLatitude,
                    o.PickupLongitude,
                    o.DeliveryLatitude,
                    o.DeliveryLongitude,
                    o.DriverId,
                    DriverName = o.Driver != null ? o.Driver.UserFName + " " + o.Driver.UserLName : null,
                    o.ReceiverName,
                    o.ReceiverAddress
                })
                .ToListAsync();

            var issues = await context.RoadIssues
                .Where(i => i.Status == "Active")
                .Include(i => i.Driver)
                .ToListAsync();

            var usersCount = await context.Users.CountAsync();

            return Results.Ok(new
            {
                Drivers = drivers,
                Orders = activeOrders,
                UnresolvedRoadIssues = issues.Count,
                UsersCount = usersCount
            });
        });


        admin.MapGet("/drivers", async (AppDbContext context) =>
        {
            var drivers = await context.Users
                .Where(u => u.UserRole == "driver")
                .Select(u => new { u.UserId, u.UserFName, u.UserLName, u.IsAvailable })
                .ToListAsync();

            return Results.Ok(drivers);
        });


        admin.MapPost("/seed-demo-data", async (
            AppDbContext context,
            RouteOptimizationService optimizationService) =>
        {
            // 1. Sender setup
            var sender = await context.Users.FirstOrDefaultAsync(u => u.UserRole == "seller");
            if (sender == null)
            {
                sender = new User
                {
                    UserFName = "Demo",
                    UserLName = "Sender",
                    UserEmail = "sender@demo.com",
                    UserPass = BCrypt.Net.BCrypt.HashPassword("password123"),
                    UserRole = "seller"
                };
                context.Users.Add(sender);
                await context.SaveChangesAsync();
            }
            else
            {
                sender.UserPass = BCrypt.Net.BCrypt.HashPassword("password123");
                await context.SaveChangesAsync();
            }

            var driver = await context.Users.FirstOrDefaultAsync(u => u.UserRole == "Driver");
            if (driver == null)
            {
                driver = new User
                {
                    UserFName = "Demo",
                    UserLName = "Driver",
                    UserEmail = "driver@demo.com",
                    UserPass = BCrypt.Net.BCrypt.HashPassword("password123"),
                    UserRole = "Driver",
                    IsAvailable = true
                };
                context.Users.Add(driver);
                await context.SaveChangesAsync();
            }
            else
            {
                driver.UserPass = BCrypt.Net.BCrypt.HashPassword("password123");
                await context.SaveChangesAsync();
            }

            // 3. Create 10 dummy orders
            var orders = new List<Order>();
            var random = new Random();
            double baseLat = 13.0827;
            double baseLng = 80.2707;

            for (int i = 0; i < 10; i++)
            {
                orders.Add(new Order
                {
                    SenderId = sender.UserId,
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
                    DriverId = driver.UserId
                });
            }

            context.Orders.AddRange(orders);
            await context.SaveChangesAsync();

            await optimizationService.OptimizeRouteForDriver(driver.UserId);

            return Results.Ok(new
            {
                message = "Seeded 10 orders and optimized route",
                driverId = driver.UserId
            });

        });
        admin.MapGet("/order/{id}", async (
    int id,
    AppDbContext context
) =>
{
    var order = await context.Orders
        .Include(o => o.Sender)
        .Include(o => o.Driver)
        .Include(o => o.OriginWarehouse)
        .Include(o => o.CurrentWarehouse)
        .Include(o => o.DestinationWarehouse)
        .Where(o => o.Id == id)
        .Select(o => new
        {
            o.Id,
            o.TrackingId,
            o.Status,
            senderName = o.SenderName,
            senderEmail = o.Sender != null ? o.Sender.UserEmail : null,
            senderPhone = o.SenderPhone,
            o.ReceiverName,
            o.ReceiverPhone,
            o.ReceiverEmail,
            o.PickupAddress,
            pickupLatitude = o.PickupLatitude,
            pickupLongitude = o.PickupLongitude,
            deliveryAddress = o.ReceiverAddress,
            deliveryLatitude = o.DeliveryLatitude,
            deliveryLongitude = o.DeliveryLongitude,
            o.ParcelSize,
            o.Priority,
            o.Weight,
            o.AiPriority,
            o.AiPriorityJustification,
            driver = o.Driver != null ? new
            {
                o.Driver.UserId,
                o.Driver.UserFName,
                o.Driver.UserLName,
                o.Driver.UserEmail,
                o.Driver.IsAvailable
            } : null,
            originWarehouse = o.OriginWarehouse != null ? new
            {
                o.OriginWarehouse.Id,
                o.OriginWarehouse.Name,
                o.OriginWarehouse.City,
                o.OriginWarehouse.Region,
                o.OriginWarehouse.Address
            } : null,
            currentWarehouse = o.CurrentWarehouse != null ? new
            {
                o.CurrentWarehouse.Id,
                o.CurrentWarehouse.Name,
                o.CurrentWarehouse.City,
                o.CurrentWarehouse.Region,
                o.CurrentWarehouse.Address
            } : null,
            destinationWarehouse = o.DestinationWarehouse != null ? new
            {
                o.DestinationWarehouse.Id,
                o.DestinationWarehouse.Name,
                o.DestinationWarehouse.City,
                o.DestinationWarehouse.Region,
                o.DestinationWarehouse.Address
            } : null,
            o.CreatedAt,
            o.EstimatedDeliveryDate,
            o.RescheduledAt,
            o.RescheduleReason
        })
        .FirstOrDefaultAsync();

    return order is null
        ? Results.NotFound(new { message = "Order not found" })
        : Results.Ok(order);
});
        admin.MapGet("/driver/{id}", async (
            int id,
            AppDbContext context
        ) =>
        {
            var driver = await context.Users
                .Where(u => u.UserId == id && u.UserRole == "driver")
                .Select(u => new
                {
                    u.UserId,
                    u.UserFName,
                    u.UserLName,
                    u.UserEmail,
                    u.IsAvailable,
                    u.CurrentLatitude,
                    u.CurrentLongitude
                })
                .FirstOrDefaultAsync();

            if (driver == null)
                return Results.NotFound(new { message = "Driver not found" });

            var totalCompleted = await context.Orders
                .Where(o => o.DriverId == id && o.Status == "Delivered")
                .CountAsync();

            var todayStart = DateTime.UtcNow.Date;

            var todayCompleted = await context.Orders
                .Where(o => o.DriverId == id &&
                            o.Status == "Delivered" &&
                            o.CreatedAt >= todayStart)
                .CountAsync();

            var activeDeliveries = await context.Orders
                .Where(o => o.DriverId == id && o.Status != "Delivered")
                .CountAsync();

            var orders = await context.Orders
                .Where(o => o.DriverId == id)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new
                {
                    o.Id,
                    o.TrackingId,
                    o.Status,
                    o.PickupAddress,
                    o.ReceiverAddress,
                    o.CreatedAt,
                    o.AiPriority
                })
                .Take(20)
                .ToListAsync();

            return Results.Ok(new
            {
                driver,
                statistics = new
                {
                    totalCompleted,
                    todayCompleted,
                    activeDeliveries
                },
                orders
            });
        });
        admin.MapGet("/orders", async (AppDbContext context) =>
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
                    o.ReceiverEmail,
                    o.ReceiverPhone,
                    o.CreatedAt,
                    o.EstimatedDeliveryDate,
                    o.DriverId,
                    o.AiPriority,
                    o.RescheduledAt,
                    driver = o.Driver != null ? new
                    {
                        o.Driver.UserId,
                        o.Driver.UserFName,
                        o.Driver.UserLName,
                        o.Driver.UserEmail
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

            return Results.Ok(orders);
        });

        admin.MapPost("/assign-driver/{orderId}/{driverId}", async (
            int orderId,
            int driverId,
            AppDbContext context,
            DriverRouteOptimizationService driverRouteService,
            RouteOptimizationService persistenceService,
            GeofenceService geofenceService,
            IHubContext<LogisticsHub> hubContext
        ) =>
        {
            var order = await context.Orders.FindAsync(orderId);
            if (order == null)
                return Results.NotFound(new { message = "Order not found" });

            order.DriverId = driverId;
            order.Status = "Assigned";
            await context.SaveChangesAsync();

            // 1. Create Geofence if missing (Prioritize tracking)
// 1. Create Geofence if missing
        try
        {
            var exists = await context.Geofences.AnyAsync(g => g.OrderId == orderId && g.IsActive);
            if (!exists)
            await geofenceService.CreateGeofenceForOrderAsync(order);
        }

        catch (Exception ex)
        {
            Console.WriteLine($"[Admin] Geofence Creation Failed: {ex}");
        }


            // 2. Persist route stops (OSRM/Haversine)
            try
            {
                await persistenceService.OptimizeRouteForDriver(driverId);
                Console.WriteLine($"[Admin] Route optimized for Driver {driverId}");
            }
            catch (Exception ex)
            {
                 Console.WriteLine($"[Admin] Route Persistence Failed: {ex.Message}");
                 // This is critical but we already assigned the order.
            }

            // 3. Generate UI-friendly route for SignalR
            var optimizedRoute = await driverRouteService.GenerateRouteForDriver(driverId);

            await hubContext.Clients
                .Group($"Driver_{driverId}_Route")
                .SendAsync("ReceiveRouteUpdate", optimizedRoute);

            return Results.Ok(new
            {
                message = "Driver assigned successfully",
                route = optimizedRoute
            });
        });

        admin.MapPost("/broadcast-road-issue/{issueId}", async (
            int issueId,
            AppDbContext context,
            DriverRouteOptimizationService routeService,
            IHubContext<LogisticsHub> hubContext
        ) =>
        {
            var issue = await context.RoadIssues
                .Include(r => r.Driver)
                .FirstOrDefaultAsync(r => r.Id == issueId);

            if (issue == null)
                return Results.NotFound(new { message = "Issue not found" });

            var activeDrivers = await context.Orders
                .Where(o => o.DriverId.HasValue && o.Status != "Delivered" && o.Status != "Cancelled")
                .Select(o => o.DriverId!.Value)
                .Distinct()
                .ToListAsync();

            foreach (var driverId in activeDrivers)
            {
                await hubContext.Clients
                    .Group($"Driver_{driverId}_Route")
                    .SendAsync("RoadIssueAlert", new
                    {
                        issueId = issue.Id,
                        issueType = issue.IssueType,
                        description = issue.Description,
                        latitude = issue.Latitude,
                        longitude = issue.Longitude,
                        severity = issue.Severity,
                        reportedBy = issue.Driver.UserFName + " " + issue.Driver.UserLName
                    });

                await routeService.RecalculateDriverRouteAsync(driverId);
                var updatedRoute = await routeService.GenerateRouteForDriver(driverId);

                await hubContext.Clients
                    .Group($"Driver_{driverId}_Route")
                    .SendAsync("ReceiveRouteUpdate", updatedRoute);
            }

            return Results.Ok(new
            {
                message = "Road issue broadcasted to all drivers",
                affectedDrivers = activeDrivers.Count
            });
        });




    }
}
