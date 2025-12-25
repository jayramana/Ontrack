using Backend.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Backend.DTO;

public static class LocationEndpoints
{
    // This endpoint calculates ETA given driver & customer coordinates in request body.
    // Use this when you want an immediate ETA response without relying on global state.
    public static void MapLocationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/loc").WithTags("Location");

        group.MapPost("/calculate-eta", (EtaRequestDto dto, IEtaservice etaService) =>
        {
            if (dto == null)
                return Results.BadRequest(new { message = "Invalid request" });

            // We calculate 3 scenarios:
            // Earliest: 50 km/h
            // Average:  35 km/h
            // Latest:   20 km/h

            double distance = etaService.GetDistance(dto.DriverLat, dto.DriverLon, dto.CustomerLat, dto.CustomerLon);
            
            // If speed is provided in DTO, we can use it as 'average' or ignore it. 
            // Here we enforce the triple strategy.
            
            string earliest = etaService.GetETA(distance, 50);
            string average = etaService.GetETA(distance, 35);
            string latest = etaService.GetETA(distance, 20);

            return Results.Ok(new
            {
                distance_km = Math.Round(distance, 3),
                speed_kmph = dto.SpeedKmph > 0 ? dto.SpeedKmph : 35, // Echo back or default
                eta = new 
                {
                    earliest,
                    average,
                    latest
                }
            });
        })
        .RequireAuthorization();

        group.MapPost("/customer/location", (CustomerLocationDto dto) =>
        {
            if (dto == null) return Results.BadRequest();
            return Results.Ok(new { message = "Customer location accepted" });
        })
        .RequireAuthorization();
    }
}

