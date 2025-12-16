using Backend.Data;
using Backend.Domain.Entity;
using Backend.DTOs;
using Backend.Hubs;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using Backend.DTO;

public static class RoadIssueEndpoints
{
    public static void MapRoadIssueEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/roadissue").WithTags("RoadIssues");

        group.MapPost("/report", async (
            HttpContext http,
            ReportIssueDto dto,
            AppDbContext context,
            IHubContext<LogisticsHub> hubContext,
            DriverRouteOptimizationService routeService
        ) =>
        {
            try
            {
                var claim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
                int driverId = int.Parse(claim?.Value ?? "0");

                var driver = await context.Users.FindAsync(driverId);
                if (driver == null || driver.UserRole != "driver")
                    return Results.Unauthorized();

                var issue = new RoadIssue
                {
                    DriverId = driverId,
                    IssueType = dto.IssueType,
                    Description = dto.Description,
                    Latitude = dto.Latitude,
                    Longitude = dto.Longitude,
                    ReportedAt = DateTime.UtcNow,
                    Status = "Active",
                    Severity = dto.Severity
                };

                context.RoadIssues.Add(issue);
                await context.SaveChangesAsync();

                await hubContext.Clients
                    .Group("Admins")
                    .SendAsync("RoadIssueReported", new
                    {
                        issueId = issue.Id,
                        driverId = issue.DriverId,
                        driverName = driver.UserFName + " " + driver.UserLName,
                        issueType = issue.IssueType,
                        description = issue.Description,
                        latitude = issue.Latitude,
                        longitude = issue.Longitude,
                        reportedAt = issue.ReportedAt,
                        severity = issue.Severity
                    });

                // Identify affected drivers within 10 km
                var affected = await GetDriversNearIssue(context, dto.Latitude, dto.Longitude, 10.0);

                foreach (var affectedDriverId in affected)
                {
                    // Recalculate route
                    await routeService.RecalculateDriverRouteAsync(affectedDriverId);

                    // Push updated route
                    var optimized = await routeService.GenerateRouteForDriver(affectedDriverId);

                    await hubContext.Clients
                        .Group($"Driver_{affectedDriverId}_Route")
                        .SendAsync("ReceiveRouteUpdate", optimized);
                }

                return Results.Ok(new
                {
                    message = "Road issue reported successfully",
                    issueId = issue.Id,
                    affectedDrivers = affected.Count
                });
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new
                {
                    message = "Failed to report issue",
                    error = ex.Message
                });
            }
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "driver" });


        group.MapGet("/", async (AppDbContext context) =>
        {
            var issues = await context.RoadIssues
                .Include(r => r.Driver)
                .OrderByDescending(r => r.ReportedAt)
                .Select(r => new
                {
                    r.Id,
                    r.IssueType,
                    r.Description,
                    r.Latitude,
                    r.Longitude,
                    r.ReportedAt,
                    r.Status,
                    r.Severity,
                    isResolved = r.Status == "Resolved",
                    driver = new
                    {
                        r.Driver.UserId,
                        DriverName = r.Driver.UserFName + r.Driver.UserLName,
                        r.Driver.UserEmail
                    }
                })
                .ToListAsync();

            return Results.Ok(issues);
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" });

      
        group.MapGet("/unresolved", async (AppDbContext context) =>
        {
            var issues = await context.RoadIssues
                .Include(r => r.Driver)
                .Where(r => r.Status == "Active")
                .OrderByDescending(r => r.ReportedAt)
                .Select(r => new
                {
                    r.Id,
                    r.IssueType,
                    r.Description,
                    r.Latitude,
                    r.Longitude,
                    r.ReportedAt,
                    r.Severity,
                    driver = new
                    {
                        r.Driver.UserId,
                        DriverName = r.Driver.UserFName + " " + r.Driver.UserLName
                    }
                })
                .ToListAsync();

            return Results.Ok(issues);
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "admin" });

        group.MapPost("/{id}/resolve", async (int id, AppDbContext context) =>
        {
            var issue = await context.RoadIssues.FindAsync(id);
            if (issue == null)
                return Results.NotFound(new { message = "Issue not found" });

            issue.Status = "Resolved";
            await context.SaveChangesAsync();

            return Results.Ok(new { message = "Issue marked as resolved" });
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "admin" });

        static async Task<List<int>> GetDriversNearIssue(
            AppDbContext context,
            double lat,
            double lng,
            double radiusKm)
        {
            var activeDrivers = await context.Orders
                .Where(o => o.DriverId.HasValue &&
                            o.Status != "Delivered" &&
                            o.Status != "Cancelled")
                .Select(o => o.DriverId!.Value)
                .Distinct()
                .ToListAsync();

            var nearby = new List<int>();

            foreach (var driverId in activeDrivers)
            {
                var driver = await context.Users.FindAsync(driverId);
                if (driver == null ||
                    !driver.CurrentLatitude.HasValue ||
                    !driver.CurrentLongitude.HasValue)
                    continue;

                double dist = Haversine(
                    lat, lng,
                    driver.CurrentLatitude.Value,
                    driver.CurrentLongitude.Value
                );

                if (dist <= radiusKm)
                    nearby.Add(driverId);
            }

            return nearby;
        }

        static double Haversine(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371;
            var dLat = Degrees((lat2 - lat1));
            var dLon = Degrees((lon2 - lon1));

            var a =
                Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(Deg(lat1)) * Math.Cos(Deg(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return R * c;

            static double Degrees(double deg) => deg * Math.PI / 180.0;
            static double Deg(double deg) => deg * Math.PI / 180.0;
        }
    }
}
