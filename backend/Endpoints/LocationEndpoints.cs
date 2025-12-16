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

            if (dto.SpeedKmph <= 0)
                return Results.BadRequest(new { message = "Invalid speed" });

            double distance = etaService.GetDistance(dto.DriverLat, dto.DriverLon, dto.CustomerLat, dto.CustomerLon);
            string etaString = etaService.GetETA(distance, dto.SpeedKmph);

            return Results.Ok(new
            {
                distance_km = Math.Round(distance, 3),
                speed_kmph = dto.SpeedKmph,
                eta = etaString
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

