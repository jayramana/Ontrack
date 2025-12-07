

using Backend.Services;
using Microsoft.AspNetCore.SignalR;

public static class LocationEndpoints
{
    private static double driverLat, driverLon, cusLat, cusLon, speed;
    public static void MapLocationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/loc").WithTags("Location");
    
                group.MapPost("/update-driver", async (
            double lat,
            double lon,
            double spd,
            IEtaservice eta,
            IHubContext<EtaHub> hub) =>
        {
            driverLat = lat;
            driverLon = lon;
            speed = spd;

            string etaString = "";

            if (cusLat != 0 && cusLon != 0 && speed > 0)
            {
                double distance = eta.GetDistance(driverLat, driverLon, cusLat, cusLon);
                etaString = eta.GetETA(distance, speed);

                await hub.Clients.All.SendAsync("ReceiveEtaUpdate", new {
                    distance_km = Math.Round(distance, 2),
                    speed_kmph = Math.Round(speed, 1),
                    eta = etaString
                });
            }

            return Results.Ok(new { message = "Driver update received", eta = etaString });
        });

        group.MapPost("/customer/location", (double lat, double lon) =>
        {
            cusLat = lat;
            cusLon = lon;

            return Results.Ok(new { message = "Customer location updated" });
        });
    
    }
}