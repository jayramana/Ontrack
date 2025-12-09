using Backend.Data;
using Backend.Domain.Entity;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

public static class OrdersEndpoints
{
    public static void MapOrdersEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/orders");

        group.MapPost("/", async (
            HttpContext http,
            Order order,
            AppDbContext context,
            RouteOptimizationService optimizationService,
            GeocodingService geocodingService,
            WarehouseAssignmentService warehouseService) =>
        {
            try
            {
                if (order.ScheduledDate.HasValue)
                    order.ScheduledDate = DateTime.SpecifyKind(order.ScheduledDate.Value, DateTimeKind.Utc);

                var userIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
                var userId = int.Parse(userIdClaim?.Value ?? "0");
                order.SenderId = userId;

                order.Status = "PendingAssignment";

                var pickupCoords = await geocodingService.GetCoordinatesAsync(order.PickupAddress);

                if (pickupCoords.HasValue)
                {
                    order.PickupLatitude = pickupCoords.Value.Latitude;
                    order.PickupLongitude = pickupCoords.Value.Longitude;
                }

                context.Orders.Add(order);
                await context.SaveChangesAsync();
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
        .RequireAuthorization(new AuthorizeAttribute { Roles = "seller" });

        group.MapGet("/pending", async (AppDbContext context) =>
        {
            var orders = await context.Orders
                .Where(o => o.Status == "Pending")
                .ToListAsync();

            return Results.Ok(orders);
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "admin" });

        group.MapGet("/assigned", async (AppDbContext context) =>
        {
            var orders = await context.Orders
                .Where(o => o.Status == "Assigned")
                .ToListAsync();

            return Results.Ok(orders);
        })
        .RequireAuthorization(new AuthorizeAttribute{Roles = "admin"});

        group.MapGet("/my-orders", async (HttpContext http, AppDbContext context) =>
        {
            var userId = int.Parse(http.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var orders = await context.Orders
                .Where(o => o.CustomerId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
            System.Console.WriteLine(userId);
            return Results.Ok(orders);
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "customer" });

        group.MapGet("/my-sent-orders", async (HttpContext http, AppDbContext context) =>
        {
            var userId = int.Parse(http.User.FindFirst("id")?.Value ?? "0");

            var orders = await context.Orders
                .Where(o => o.SenderId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Results.Ok(orders);
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "seller" });

        group.MapPost("/{orderId}/assign-driver/{driverId}", async (
            int orderId,
            int driverId,
            AppDbContext context,
            RouteOptimizationService optimizationService) =>
        {
            var order = await context.Orders.FindAsync(orderId);
            if (order == null) return Results.NotFound();

            var driver = await context.Users.FindAsync(driverId);
            if (driver == null || driver.UserRole != "driver")
                return Results.BadRequest("Invalid driver.");

            order.DriverId = driverId;
            order.Status = "Assigned";
            await context.SaveChangesAsync();

            await optimizationService.OptimizeRouteForDriver(driverId);

            return Results.Ok(order);
        })
        .RequireAuthorization(new AuthorizeAttribute{Roles = "admin"});

        group.MapPost("/{id}/approve", async (
            int id,
            AppDbContext context,
            RouteOptimizationService optimizationService) =>
        {
            var order = await context.Orders.FindAsync(id);
            if (order == null) return Results.NotFound();

            order.Status = "Approved";

            var driver = await context.Users
                .FirstOrDefaultAsync(u => u.UserRole == "driver" && u.IsAvailable);

            if (driver != null)
            {
                order.DriverId = driver.UserId;
                order.Status = "Assigned";
                await context.SaveChangesAsync();

                await optimizationService.OptimizeRouteForDriver(driver.UserId);
            }
            else
            {
                await context.SaveChangesAsync();
            }

            return Results.Ok(order);
        })
        .RequireAuthorization(new AuthorizeAttribute{Roles = "admin"});
    }
}
