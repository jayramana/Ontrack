using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Backend.Services;

namespace Backend.Endpoints
{
    public static class PublicTrackingEndpoints
    {
        public static void MapPublicTrackingEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/public/tracking")
                           .WithTags("PublicTracking");

            group.MapGet("/{identifier}", async (string identifier, AppDbContext context, IEtaservice etaService) =>
            {
                Console.WriteLine($"[PublicTracking] Received request for identifier: '{identifier}'");

                // SECURITY: Public endpoint MUST only accept secure Tracking IDs (e.g. "E04F9D5156")
                // Do NOT allow lookup by short numeric Order ID to prevent enumeration attacks.
                
                // If the identifier looks like a plain short number (likely an Order ID), reject it.
                if (identifier.Length < 8 && int.TryParse(identifier, out _))
                {
                    Console.WriteLine($"[PublicTracking] Rejected short numeric identifier: '{identifier}'");
                    return Results.NotFound(new { message = "Invalid tracking ID format. Public tracking requires the full Tracking Number (e.g., E04F...)." });
                }

                var order = await context.Orders
                    .Include(o => o.Driver) // Needed for DriverId and Location
                    .Include(o => o.OriginWarehouse)
                    .Include(o => o.DestinationWarehouse)
                    // Case-insensitive check
                    .Where(o => o.TrackingId.ToLower() == identifier.ToLower())
                    .FirstOrDefaultAsync();
                
                if (order == null) Console.WriteLine($"[PublicTracking] Order not found for identifier: '{identifier}'");
                else Console.WriteLine($"[PublicTracking] Order found: {order.Id} (TrackingId: {order.TrackingId})");

                if (order == null)
                    return Results.NotFound(new { message = "Order not found. Please check your Tracking Number." });

                object? driverLocation = null;
                string? eta = null;

                if (order.DriverId.HasValue)
                {
                    var loc = await context.DriverLocations
                        .Where(dl => dl.DriverId == order.DriverId.Value)
                        .OrderByDescending(dl => dl.UpdatedAt)
                        .FirstOrDefaultAsync();
                    
                    if (loc != null)
                    {
                        driverLocation = new { latitude = loc.Latitude, longitude = loc.Longitude };
                        
                        // Calculate ETA
                        // Speed assumption: 60 km/h (Consistent with SimulationService)
                        double distance = etaService.GetDistance(loc.Latitude, loc.Longitude, order.DeliveryLatitude, order.DeliveryLongitude);
                        eta = etaService.GetETA(distance, 60); 
                    }
                }

                // Return reduced info
                return Results.Ok(new
                {
                    order = new 
                    {
                        order.Id,
                        order.TrackingId,
                        order.Status,
                        order.EstimatedDeliveryDate,
                        // Only expose delivery lat/long for map
                        order.DeliveryLatitude,
                        order.DeliveryLongitude,
                        // Enhanced details for Public View
                        driverName = order.Driver != null ? (order.Driver.UserFName + " " + order.Driver.UserLName) : null,
                        OriginCity = order.OriginWarehouse != null ? order.OriginWarehouse.City : order.PickupAddress.Split(',')[0], // Fallback to first part of address
                        DestinationCity = order.DestinationWarehouse != null ? order.DestinationWarehouse.City : order.ReceiverAddress.Split(',')[0],
                        CurrentStep = order.Status // Placeholder, could map status to user-friendly steps
                    },
                    driverLocation,
                    eta
                });
            });
        }
    }
}
