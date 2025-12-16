using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Domain.Entity;
using Backend.Services;
using System.Security.Claims;
using Backend.DTO;
using Backend.DTOs;

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

        group.MapGet("/track/{identifier}", async (string identifier, AppDbContext context) =>
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

            if (order.DriverId.HasValue)
            {
                driverLocation = await context.DriverLocations
                    .Where(dl => dl.DriverId == order.DriverId.Value)
                    .OrderByDescending(dl => dl.UpdatedAt)
                    .FirstOrDefaultAsync();
            }

            return Results.Ok(new
            {
                order,
                driverLocation,
                estimatedDelivery = order.EstimatedDeliveryDate
            });
        });

        group.MapPost("/reschedule/{orderId}", async (
            int orderId,
            RescheduleDto request,
            AppDbContext context,
            DriverRouteOptimizationService routeService) =>
        {
            var order = await context.Orders.FindAsync(orderId);
            if (order == null)
                return Results.NotFound();

            order.RescheduledDate = request.NewDate.ToUniversalTime();
            order.Priority = 3;
            order.DeliveryNotes =
                $"Rescheduled by customer: {request.Reason}. {order.DeliveryNotes ?? ""}".Trim();

            await context.SaveChangesAsync();

            if (order.DriverId.HasValue)
                await routeService.RecalculateDriverRouteAsync(order.DriverId.Value);

            return Results.Ok(new
            {
                message = "Delivery rescheduled successfully",
                newPriority = order.Priority
            });
        });

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


