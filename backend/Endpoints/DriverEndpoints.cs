using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Backend.Data;
using Backend.Domain.Entity;
using Backend.Services;
using System.Security.Claims;
using Backend.DTO;

public static class DriverEndpoints
{
    public static void MapDriverEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/driver")
                       .RequireAuthorization(new AuthorizeAttribute { Roles = "driver" }).WithTags("Driver");

        group.MapGet("/orders/today", async (HttpContext http, AppDbContext context) =>
        {
            var userIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
            var driverId = int.Parse(userIdClaim?.Value ?? "0");

            var orders = await context.Orders
                .Where(o => o.DriverId == driverId)
                .Where(o => o.Status != "Delivered" && o.Status != "Cancelled")
                .Include(o => o.Sender)
                .Include(o => o.OriginWarehouse)
                .Include(o => o.DestinationWarehouse)
                .Include(o => o.CurrentWarehouse)
                .OrderBy(o => o.Priority)
                .ToListAsync();

            return Results.Ok(orders);
        });

        group.MapGet("/orders/all", async (HttpContext http, AppDbContext context) =>
        {
            var userIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
            var driverId = int.Parse(userIdClaim?.Value ?? "0");

            var orders = await context.Orders
                .Where(o => o.DriverId == driverId)
                .Include(o => o.Sender)
                .Include(o => o.OriginWarehouse)
                .Include(o => o.DestinationWarehouse)
                .Include(o => o.CurrentWarehouse)
                .OrderByDescending(o => o.ScheduledDate)
                .ToListAsync();

            return Results.Ok(orders);
        });

        group.MapGet("/route/optimized", async (HttpContext http, DriverRouteOptimizationService routeService) =>
        {
            var userIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
            var driverId = int.Parse(userIdClaim?.Value ?? "0");

            var optimizedRoute = await routeService.GetOptimizedRouteForDriver(driverId);
            return Results.Ok(optimizedRoute);
        });

        group.MapPost("/location", async (
            HttpContext http,
            LocationUpdateDto update,
            AppDbContext context) =>
        {
            var userIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
            var driverId = int.Parse(userIdClaim?.Value ?? "0");

            var driver = await context.Users.FindAsync(driverId);
            if (driver == null)
                return Results.NotFound();

            driver.CurrentLatitude = update.Latitude;
            driver.CurrentLongitude = update.Longitude;

            var location = new DriverLocation
            {
                DriverId = driverId,
                Latitude = update.Latitude,
                Longitude = update.Longitude,
                Speed = update.Speed,
                Heading = update.Heading,
                UpdatedAt = DateTime.UtcNow
            };

            await context.DriverLocations.AddAsync(location);
            await context.SaveChangesAsync();

            return Results.Ok(new { message = "Location updated successfully" });
        });

        group.MapPost("/mark-delivered/{orderId}", async (int orderId, AppDbContext context) =>
        {
            var order = await context.Orders.FindAsync(orderId);
            if (order == null)
                return Results.NotFound();

            order.Status = "Delivered";
            await context.SaveChangesAsync();

            return Results.Ok(new { message = "Order marked as delivered" });
        });

        group.MapPost("/mark-attempted/{orderId}", async (
            int orderId,
            DeliveryAttemptDto attempt,
            AppDbContext context) =>
        {
            var order = await context.Orders.FindAsync(orderId);
            if (order == null)
                return Results.NotFound();

            order.Status = "DeliveryAttempted";
            order.DeliveryNotes = $"Attempt failed: {attempt.Reason}. {order.DeliveryNotes}";
            order.Priority = 3;

            await context.SaveChangesAsync();

            return Results.Ok(new { message = "Delivery attempt recorded" });
        });

        group.MapPost("/report-issue", async (
            HttpContext http,
            IssueReportDto report,
            AppDbContext context) =>
        {
            var userIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
            var driverId = int.Parse(userIdClaim?.Value ?? "0");

            var issue = new RoadIssue
            {
                DriverId = driverId,
                IssueType = report.IssueType,
                Description = report.Description,
                Latitude = report.Latitude,
                Longitude = report.Longitude,
                ReportedAt = DateTime.UtcNow
            };

            await context.RoadIssues.AddAsync(issue);
            await context.SaveChangesAsync();

            return Results.Ok(new { message = "Issue reported successfully", issueId = issue.Id });
        });
    }
}






