using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Endpoints
{
    public static class TrackingEndpoints
    {
        public static void MapTrackingEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/track")
                           .WithTags("Tracking");

            group.MapGet("/{trackingId}", async (
                string trackingId,
                AppDbContext db) =>
            {
                var order = await db.Orders
                    .Include(o => o.Driver)
                    .FirstOrDefaultAsync(o => o.TrackingId == trackingId);

                if (order == null)
                    return Results.NotFound(new { message = "Invalid tracking ID" });

                var lastLocation = await db.DriverLocations
                    .Where(l => l.DriverId == order.DriverId)
                    .OrderByDescending(l => l.UpdatedAt)
                    .FirstOrDefaultAsync();

                return Results.Ok(new
                {
                    order.Id,
                    order.TrackingId,
                    order.Status,
                    order.PickupAddress,
                    DeliveryAddress = order.ReceiverAddress,
                    DriverLatitude = lastLocation?.Latitude,
                    DriverLongitude = lastLocation?.Longitude,
                    DriverName = order.Driver != null
                        ? $"{order.Driver.UserFName} {order.Driver.UserLName}"
                        : null,
                    DriverPhone = order.Driver?.UserPhonePrimary
                });
            });
        }
    }
}