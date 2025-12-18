using Backend.Data;
using Backend.Domain.Entity;
using Backend.DTO;
using Backend.Services;
using Microsoft.EntityFrameworkCore;

public static class GeofenceEndpoints
{
    public static void MapGeofenceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/geofence").WithTags("Geofence");

        group.MapPost("/create", async (GeofenceCreateDto dto, AppDbContext db) =>
        {
            var g = new Geofence
            {
                Name = dto.Name ?? $"gf-{Guid.NewGuid()}",
                CenterLat = dto.CenterLat,
                CenterLon = dto.CenterLon,
                RadiusMeters = dto.RadiusMeters,
                OrderId = dto.OrderId,
                OwnerUserId = dto.OwnerUserId,
                IsActive = true
            };

            db.Geofences.Add(g);
            await db.SaveChangesAsync();
            return Results.Ok(new { message = "created", geofenceId = g.GeofenceId });
        });

        group.MapPost("/driver-update", async (
            DriverLocationDto dto,
            GeofenceService geofenceService,
            AppDbContext db) =>
        {
            if (dto == null || dto.DriverId <= 0)
                return Results.BadRequest(new { message = "Invalid payload" });

            List<string> notifyGroups = new();

            if (dto.OrderId.HasValue)
            {
                notifyGroups.Add($"order-{dto.OrderId.Value}");

                var order = await db.Orders.FindAsync(dto.OrderId.Value);
                if (order != null && order.CustomerId > 0)
                {
                    notifyGroups.Add($"user-{order.CustomerId}");
                }
            }

            notifyGroups.Add($"driver-{dto.DriverId}");

            await geofenceService.CheckAndNotifyAsync(
                dto.DriverId,
                dto.Lat,
                dto.Lon,
                notifyGroups
            );

            return Results.Ok(new { message = "location processed" });
        });

        group.MapPost("/check", async (GeofenceCheckDto dto, AppDbContext db) =>
       {
           if (dto.DriverId <= 0 || dto.OrderId <= 0)
               return Results.BadRequest(new { message = "Invalid input" });

           var geofence = await db.Geofences
               .Where(g => g.OrderId == dto.OrderId && g.IsActive)
               .FirstOrDefaultAsync();

           if (geofence == null)
               return Results.NotFound(new { message = "No active geofence found" });

           double distance = Haversine(
               dto.Lat,
               dto.Lon,
               geofence.CenterLat,
               geofence.CenterLon
           );

           bool inside = distance <= geofence.RadiusMeters;

           return Results.Ok(new
           {
               inside,
               distanceMeters = Math.Round(distance),
               geofenceRadius = geofence.RadiusMeters,
               geofenceId = geofence.GeofenceId
           });
       });

        group.MapGet("/list", async (AppDbContext db) =>
        {
            // Fetch Active geofences, OR Inactive ones that are associated with Delivered orders (for history)
            // We need to Include Order to check status.
            var list = await db.Geofences
                .Include(g => g.Order)
                .Where(g => g.IsActive || (g.Order != null && g.Order.Status == "Delivered"))
                .ToListAsync();

            // Lazy-Expire: If we find any Active geofences where Order is Delivered, mark them Inactive and save.
            bool changes = false;
            foreach(var g in list)
            {
                if(g.IsActive && g.Order != null && (g.Order.Status == "Delivered" || g.Order.Status == "DeliveryAttempted"))
                {
                    g.IsActive = false;
                    changes = true;
                }
            }

            if(changes)
            {
                await db.SaveChangesAsync();
            }

            return Results.Ok(list);
        });
    }
    private static double Haversine(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371000;
        double dLat = ToRad(lat2 - lat1);
        double dLon = ToRad(lon2 - lon1);

        lat1 = ToRad(lat1);
        lat2 = ToRad(lat2);

        double a =
            Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
            Math.Cos(lat1) * Math.Cos(lat2) *
            Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return R * c;
    }

    private static double ToRad(double val) => Math.PI * val / 180.0;
}

public class GeofenceCheckDto
{
    public int DriverId { get; set; }
    public int OrderId { get; set; }
    public double Lat { get; set; }
    public double Lon { get; set; }
}
