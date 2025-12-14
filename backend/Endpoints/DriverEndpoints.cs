using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Backend.Data;
using Backend.Domain.Entity;
using Backend.Services;
using System.Security.Claims;
using Backend.DTO;
using Backend.Hubs;
using Microsoft.AspNetCore.SignalR;

public static class DriverEndpoints
{
    public static void MapDriverEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/driver")
                       .RequireAuthorization(new AuthorizeAttribute { Roles = "driver,Driver" }).WithTags("Driver");

        group.MapGet("/orders/today/full", async (HttpContext http, AppDbContext context) =>
        {
            var claim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
            int driverId = int.Parse(claim?.Value ?? "0");

            var orders = await context.Orders
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
                    o.DeliveryNotes,
                    RescheduledAt = o.RescheduledAt,
                    RescheduleReason = o.RescheduleReason,
                    CurrentWarehouse = o.CurrentWarehouse != null
                        ? new
                        {
                            o.CurrentWarehouse.Id,
                            o.CurrentWarehouse.Name,
                            o.CurrentWarehouse.City
                        }
                        : null,
                    DestinationWarehouse = o.DestinationWarehouse != null
                        ? new
                        {
                            o.DestinationWarehouse.Id,
                            o.DestinationWarehouse.Name,
                            o.DestinationWarehouse.City
                        }
                        : null
                })
                .ToListAsync();

            return Results.Ok(orders);
        });

        group.MapGet("/orders/today/analytics", async (HttpContext http, AppDbContext context) =>
        {
            var claim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
            int driverId = int.Parse(claim?.Value ?? "0");

            var orders = await context.Orders
                .Where(o => o.DriverId == driverId)
                 // No status filter: Returns Delivered, Cancelled, Pending for analytics
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
                    o.DeliveryNotes,
                    RescheduledAt = o.RescheduledAt,
                    RescheduleReason = o.RescheduleReason,
                    CurrentWarehouse = o.CurrentWarehouse != null
                        ? new
                        {
                            o.CurrentWarehouse.Id,
                            o.CurrentWarehouse.Name,
                            o.CurrentWarehouse.City
                        }
                        : null,
                    DestinationWarehouse = o.DestinationWarehouse != null
                        ? new
                        {
                            o.DestinationWarehouse.Id,
                            o.DestinationWarehouse.Name,
                            o.CurrentWarehouse.City
                        }
                        : null
                })
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

        group.MapGet("/route/optimized", async (HttpContext http, AppDbContext context) =>
        {
            var claim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
            int driverId = int.Parse(claim?.Value ?? "0");

            try
            {
                // OPTIMIZATION: Project directly in SQL query to avoid fetching full entities
                var validOrders = await context.Orders
                    .Where(o => o.DriverId == driverId 
                                && o.Status != "Delivered" 
                                && o.Status != "Cancelled"
                                && o.DeliveryLatitude != 0 
                                && o.DeliveryLongitude != 0) // Filter invalid coords in DB
                    .OrderByDescending(o => o.AiPriority ?? o.Priority)
                    .ThenBy(o => o.ScheduledDate)
                    .Select(o => new
                    {
                        id = o.Id,
                        receiverName = o.ReceiverName,
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
                    .AsNoTracking() // Performance boost for read-only query
                    .ToListAsync();

                return Results.Ok(validOrders);
            }
            catch (Exception ex)
            {
                return Results.Problem($"Backend Error: {ex.Message} - {ex.StackTrace}");
            }
        });

        group.MapPost("/location", async (
            HttpContext http,
            LocationUpdateDto update,
            AppDbContext context,
            IHubContext<LogisticsHub> hubContext) =>
        {
            var userIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
            var driverId = int.Parse(userIdClaim?.Value ?? "0");

            var driver = await context.Users.FindAsync(driverId);
            if (driver == null)
                return Results.NotFound();

            // 1. Always update Current Location (for live view/ETA fallback)
            driver.CurrentLatitude = update.Latitude;
            driver.CurrentLongitude = update.Longitude;
            driver.UpdatedAt = DateTime.UtcNow; // Explicit update for freshness check

            // 2. Smart History Logging: Only save to history if > 5 minutes have passed
            var lastHistory = await context.DriverLocations
                .Where(d => d.DriverId == driverId)
                .OrderByDescending(d => d.UpdatedAt)
                .FirstOrDefaultAsync();

            DriverLocation? newLocationEntry = null;

            if (lastHistory == null || (DateTime.UtcNow - lastHistory.UpdatedAt).TotalMinutes >= 5)
            {
                newLocationEntry = new DriverLocation
                {
                    DriverId = driverId,
                    Latitude = update.Latitude,
                    Longitude = update.Longitude,
                    Speed = update.Speed,
                    Heading = update.Heading,
                    UpdatedAt = DateTime.UtcNow
                };
                await context.DriverLocations.AddAsync(newLocationEntry);
            }

            // Save both User update and potential new History entry
            await context.SaveChangesAsync();

            await hubContext.Clients.All.SendAsync("ReceiveDriverLocation", new
            {
                driverId,
                update.Latitude,
                update.Longitude,
                update.Speed,
                updatedAt = newLocationEntry?.UpdatedAt ?? DateTime.UtcNow
            });

            return Results.Ok(new { message = "Location updated successfully" });
        });

        group.MapPost("/mark-delivered/{orderId}", async (int orderId, AppDbContext context) =>
        {
            var order = await context.Orders.FindAsync(orderId);
            if (order == null)
                return Results.NotFound();

            order.Status = "Delivered";
            order.DeliveredAt = DateTime.UtcNow;
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

        group.MapGet("/road-issues", async (AppDbContext context) =>
        {
            try 
            {
                var issues = await context.RoadIssues
                    .Where(r => !r.IsResolved) // or r.Status == "Active"
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

                return Results.Ok(issues);
            }
            catch (Exception ex)
            {
                return Results.Problem($"Backend Error: {ex.Message}");
            }
        });

        group.MapGet("/route", async (HttpContext http, AppDbContext context) =>
        {
            var claim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
            int driverId = int.Parse(claim?.Value ?? "0");

            var routeStops = await context.RouteStops
                .Where(rs => rs.DriverId == driverId)
                .Include(rs => rs.Order)
                .OrderBy(rs => rs.SequenceNumber)
                .ToListAsync();

            return Results.Ok(routeStops);
        });

        group.MapGet("/order/{id}", async (
            int id,
            HttpContext http,
            AppDbContext context
        ) =>
        {
            var claim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
            int driverId = int.Parse(claim?.Value ?? "0");

            var order = await context.Orders
                .Include(o => o.Sender)
                .Include(o => o.OriginWarehouse)
                .Include(o => o.DestinationWarehouse)
                .Include(o => o.CurrentWarehouse)
                .FirstOrDefaultAsync(o => o.Id == id && o.DriverId == driverId);

            if (order == null)
                return Results.NotFound(new { message = "Order not found for this driver" });

            return Results.Ok(new
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
        });

        group.MapGet("/track/{orderId}", async (int orderId, AppDbContext context) =>
        {
            var order = await context.Orders
                .Include(o => o.Driver)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                return Results.NotFound();

            var driverLoc = await context.DriverLocations
                .Where(dl => dl.DriverId == order.DriverId)
                .OrderByDescending(dl => dl.UpdatedAt)
                .FirstOrDefaultAsync();

            return Results.Ok(new
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
                    name = order.Driver.UserFName + " " + order.Driver.UserLName,
                    email = order.Driver.UserEmail
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
        });
    }
}
