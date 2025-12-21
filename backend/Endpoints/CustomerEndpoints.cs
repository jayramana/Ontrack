// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;
// using Backend.Data;
// using Backend.Domain.Entity;
// using Backend.Services;
// using System.Security.Claims;
// using Backend.DTO;
// using Backend.DTOs;

// public static class CustomerEndpoints
// {
//     public static RouteGroupBuilder MapCustomerEndpoints(this IEndpointRouteBuilder app)
//     {
//         var group = app.MapGroup("/api/customer").WithTags("Customer");

//         group.RequireAuthorization(new AuthorizeAttribute { Roles = "customer" });

//         group.MapGet("/orders", async (HttpContext http, AppDbContext context) =>
//         {
//             var userIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
//             if (userIdClaim == null)
//                 return Results.Unauthorized();

//             var customerId = int.Parse(userIdClaim.Value);

//             var orders = await context.Orders
//                 .Where(o => o.CustomerId == customerId)
//                 .Include(o => o.Driver)
//                 .Include(o => o.OriginWarehouse)
//                 .Include(o => o.DestinationWarehouse)
//                 .Include(o => o.CurrentWarehouse)
//                 .OrderByDescending(o => o.CreatedAt)
//                 .ToListAsync();

//             return Results.Ok(orders);
//         });

//         group.MapGet("/track/{identifier}", async (string identifier, AppDbContext context) =>
//         {
//             var isNumeric = int.TryParse(identifier, out int orderId);
//             if (!isNumeric && identifier.StartsWith("ORD-", StringComparison.OrdinalIgnoreCase))
//             {
//                  var numberPart = identifier.Substring(4);
//                  if (int.TryParse(numberPart, out int parsedId))
//                  {
//                      orderId = parsedId;
//                      isNumeric = true;
//                  }
//             }

//             var order = await context.Orders
//                 .Where(o => (isNumeric && o.Id == orderId) || o.TrackingId == identifier)
//                 .Include(o => o.Driver)
//                 .Include(o => o.OriginWarehouse)
//                 .Include(o => o.DestinationWarehouse)
//                 .Include(o => o.CurrentWarehouse)
//                 .FirstOrDefaultAsync();

//             if (order == null)
//                 return Results.NotFound(new { message = "Order not found. Please check your Order ID or Tracking Number." });

//             DriverLocation? driverLocation = null;

//             if (order.DriverId.HasValue)
//             {
//                 driverLocation = await context.DriverLocations
//                     .Where(dl => dl.DriverId == order.DriverId.Value)
//                     .OrderByDescending(dl => dl.UpdatedAt)
//                     .FirstOrDefaultAsync();
//             }

//             return Results.Ok(new
//             {
//                 order,
//                 driverLocation,
//                 estimatedDelivery = order.EstimatedDeliveryDate
//             });
//         });

//         group.MapPost("/reschedule/{orderId}", async (
//             int orderId,
//             RescheduleDto request,
//             AppDbContext context,
//             DriverRouteOptimizationService routeService) =>
//         {
//             var order = await context.Orders.FindAsync(orderId);
//             if (order == null)
//                 return Results.NotFound();

//             order.RescheduledDate = request.NewDate.ToUniversalTime();
//             order.Priority = 3;
//             order.DeliveryNotes =
//                 $"Rescheduled by customer: {request.Reason}. {order.DeliveryNotes ?? ""}".Trim();

//             await context.SaveChangesAsync();

//             if (order.DriverId.HasValue)
//                 await routeService.RecalculateDriverRouteAsync(order.DriverId.Value);

//             return Results.Ok(new
//             {
//                 message = "Delivery rescheduled successfully",
//                 newPriority = order.Priority
//             });
//         });

//         group.MapGet("/orders/by-email/{email}", async (string email, AppDbContext context) =>
// {
//     var customer = await context.Users
//         .Where(u => u.UserEmail == email && u.UserRole == "customer")
//         .FirstOrDefaultAsync();

//     if (customer == null)
//     {
//         var ordersByReceiverEmail = await context.Orders
//             .Where(o => o.ReceiverEmail == email)
//             .Include(o => o.Driver)
//             .Include(o => o.OriginWarehouse)
//             .Include(o => o.DestinationWarehouse)
//             .Include(o => o.CurrentWarehouse)
//             .OrderByDescending(o => o.CreatedAt)
//             .ToListAsync();

//         return Results.Ok(ordersByReceiverEmail);
//     }

//     var orders = await context.Orders
//         .Where(o => o.CustomerId == customer.UserId)
//         .Include(o => o.Driver)
//         .Include(o => o.OriginWarehouse)
//         .Include(o => o.DestinationWarehouse)
//         .Include(o => o.CurrentWarehouse)
//         .OrderByDescending(o => o.CreatedAt)
//         .ToListAsync();

//     return Results.Ok(orders);
// });


//         return group;
//     }
// }



using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Domain.Entity;
using Backend.Services;
using System.Security.Claims;
using Backend.DTO;
using Backend.DTOs;
using Backend.Hubs;
using Microsoft.AspNetCore.SignalR;

public static class CustomerEndpoints
{
    public static RouteGroupBuilder MapCustomerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/customer").WithTags("Customer");

        group.RequireAuthorization(new AuthorizeAttribute { Roles = "customer" });

        group.MapGet("/orders", async (HttpContext http, AppDbContext context) =>
        {
            var userIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Results.Unauthorized();

            var customerId = int.Parse(userIdClaim.Value);

            var orders = await context.Orders
                .Where(o => o.CustomerId == customerId)
                .Include(o => o.Driver)
                .Include(o => o.OriginWarehouse)
                .Include(o => o.DestinationWarehouse)
                .Include(o => o.CurrentWarehouse)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Results.Ok(orders);
        });

        group.MapGet("/track/{identifier}", async (string identifier, AppDbContext context, IEtaservice etaService) =>
        {
            var isNumeric = int.TryParse(identifier, out int orderId);
            if (!isNumeric && identifier.StartsWith("ORD-", StringComparison.OrdinalIgnoreCase))
            {
                 var numberPart = identifier.Substring(4);
                 if (int.TryParse(numberPart, out int parsedId))
                 {
                     orderId = parsedId;
                     isNumeric = true;
                 }
            }

            var order = await context.Orders
                .Where(o => (isNumeric && o.Id == orderId) || o.TrackingId == identifier)
                .Include(o => o.Driver)
                .Include(o => o.OriginWarehouse)
                .Include(o => o.DestinationWarehouse)
                .Include(o => o.CurrentWarehouse)
                .FirstOrDefaultAsync();

            if (order == null)
                return Results.NotFound(new { message = "Order not found. Please check your Order ID or Tracking Number." });

            DriverLocation? driverLocation = null;
            string? eta = null;

            if (order.DriverId.HasValue)
            {
                driverLocation = await context.DriverLocations
                    .Where(dl => dl.DriverId == order.DriverId.Value)
                    .OrderByDescending(dl => dl.UpdatedAt)
                    .FirstOrDefaultAsync();

                if (driverLocation != null)
                {
                     // Calculate ETA
                     // Speed assumption: 60 km/h
                     double distance = etaService.GetDistance(driverLocation.Latitude, driverLocation.Longitude, order.DeliveryLatitude, order.DeliveryLongitude);
                     eta = etaService.GetETA(distance, 60); 
                }
            }

            return Results.Ok(new
            {
                order,
                driver = order.Driver, // Explicitly return driver since it is [JsonIgnore] in Order entity
                driverLocation,
                estimatedDelivery = order.EstimatedDeliveryDate,
                eta
            });
        });

        group.MapPost("/reschedule/{orderId}", async (
            int orderId,
            RescheduleDto request,
            HttpContext http,
            AppDbContext context,
            GeminiService geminiService,
            DriverRouteOptimizationService routeService,
            IHubContext<LogisticsHub> hubContext) =>
        {
            var customerIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
            var customerId = int.Parse(customerIdClaim?.Value ?? "0");

            var order = await context.Orders
                .Include(o => o.Driver)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.CustomerId == customerId);

            if (order == null)
                return Results.NotFound(new { message = "Order not found or not authorized" });

            if (order.Status == "Delivered" || order.Status == "Cancelled")
                return Results.BadRequest(new { message = "Cannot reschedule completed orders" });

            // AI Priority Calculation
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
                request.NewDate,
                distance,
                request.Reason,
                driverLoad,
                orderAgeHours
            );

            // HANDLE DRIVER UNASSIGNMENT
            if (order.DriverId.HasValue)
            {
                int oldDriverId = order.DriverId.Value;
                order.PreviousDriverId = oldDriverId;
                
                // Update Order fields BEFORE notifying so we have consistency? 
                // Actually notify first is fine, or simultaneously.
                
                // Notify old driver to REMOVE the order from their active view
                await hubContext.Clients
                    .Group($"Driver_{oldDriverId}_Route")
                    .SendAsync("OrderRescheduled", new
                    {
                        orderId = order.Id,
                        order.TrackingId,
                        newDate = request.NewDate.ToUniversalTime(),
                        reason = request.Reason,
                        order.ReceiverName,
                        isRemoved = true,  // Frontend flag to hide/remove
                        status = "Pending"
                    });
            }

            // Update Order Fields
            order.RescheduledAt = DateTime.UtcNow;
            order.RescheduledDate = request.NewDate.ToUniversalTime();
            order.EstimatedDeliveryDate = request.NewDate.ToUniversalTime();
            order.RescheduleReason = request.Reason;
            order.AiPriority = ai.AiPriority;
            order.AiPriorityJustification = ai.Justification;
            order.Priority = ai.AiPriority;
            order.DeliveryNotes = $"Rescheduled: {request.Reason}. {order.DeliveryNotes ?? ""}".Trim();

            // RESET STATUS TO PENDING (UNASSIGNED)
            order.Status = "Pending";
            order.DriverId = null;

            await context.SaveChangesAsync();

            // Recalculate route for the PREVIOUS driver (Optimize their remaining route)
            if (order.PreviousDriverId.HasValue)
            {
                await routeService.RecalculateDriverRouteAsync(order.PreviousDriverId.Value);
                var optimized = await routeService.GenerateRouteForDriver(order.PreviousDriverId.Value);
                
                await hubContext.Clients
                    .Group($"Driver_{order.PreviousDriverId.Value}_Route")
                    .SendAsync("ReceiveRouteUpdate", optimized);
            }

            return Results.Ok(new
            {
                message = "Delivery rescheduled successfully. Order is now Pending assignment.",
                newPriority = order.Priority,
                status = order.Status
            });
        });

        // Helper function inside static class? Or make it a local function or member?
        // Method 1: Local function
        double Haversine(double lat1, double lon1, double lat2, double lon2)
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

        group.MapGet("/orders/by-email/{email}", async (string email, AppDbContext context) =>
{
    var customer = await context.Users
        .Where(u => u.UserEmail == email && u.UserRole == "customer")
        .FirstOrDefaultAsync();

    if (customer == null)
    {
        var ordersByReceiverEmail = await context.Orders
            .Where(o => o.ReceiverEmail == email)
            .Include(o => o.Driver)
            .Include(o => o.OriginWarehouse)
            .Include(o => o.DestinationWarehouse)
            .Include(o => o.CurrentWarehouse)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return Results.Ok(ordersByReceiverEmail);
    }

    var orders = await context.Orders
        .Where(o => o.CustomerId == customer.UserId)
        .Include(o => o.Driver)
        .Include(o => o.OriginWarehouse)
        .Include(o => o.DestinationWarehouse)
        .Include(o => o.CurrentWarehouse)
        .OrderByDescending(o => o.CreatedAt)
        .ToListAsync();

    return Results.Ok(orders);
});


        return group;
    }
}


