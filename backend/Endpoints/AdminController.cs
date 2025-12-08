using Backend.Data;
using Backend.Domain.Entity;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

public static class AdminEndpoints
{
    public static void MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        var admin = app.MapGroup("/api/admin")
                       .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" });


        admin.MapGet("/dashboard", async (AppDbContext context) =>
        {
            var drivers = await context.Users
                .Where(u => u.UserRole == "Driver")
                .Select(u => new { u.UserId, u.UserFName, u.UserLName, u.CurrentLatitude, u.CurrentLongitude, u.IsAvailable })
                .ToListAsync();

            var activeOrders = await context.Orders
                .Where(o => o.Status != "Delivered")
                .Include(o => o.Driver)
                .ToListAsync();

            var issues = await context.RoadIssues
                .Where(i => i.Status == "Active")
                .Include(i => i.Driver)
                .ToListAsync();

            return Results.Ok(new
            {
                Drivers = drivers,
                Orders = activeOrders
            });
        });

    
        admin.MapGet("/drivers", async (AppDbContext context) =>
        {
            var drivers = await context.Users
                .Where(u => u.UserRole == "Driver")
                .Select(u => new { u.UserId, u.UserFName, u.UserLName, u.IsAvailable })
                .ToListAsync();

            return Results.Ok(drivers);
        });


        app.MapPost("/api/admin/seed-demo-data", async (
            AppDbContext context,
            RouteOptimizationService optimizationService) =>
        {
            // 1. Sender setup
            var sender = await context.Users.FirstOrDefaultAsync(u => u.UserRole == "Sender");
            if (sender == null)
            {
                sender = new User
                {
                    UserFName = "Demo Sender",
                    UserEmail = "sender@demo.com",
                    UserPass = BCrypt.Net.BCrypt.HashPassword("password123"),
                    UserRole = "Sender"
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
                    UserFName = "Demo Driver",
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

            // 4. Trigger optimization
            await optimizationService.OptimizeRouteForDriver(driver.UserId);

            return Results.Ok(new
            {
                message = "Seeded 10 orders and optimized route",
                driverId = driver.UserId
            });
        });
    }
}
