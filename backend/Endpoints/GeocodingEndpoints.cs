using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;

public static class GeocodingEndpoints
{
    public static void MapGeocodingEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/geocode/reverse", async (
            double lat,
            double lon
        ) =>
        {
            var client = new HttpClient();
            client.DefaultRequestHeaders.UserAgent.ParseAdd("OnTrackLogistics/1.0 (contact@ontrack.com)");

            var url =
                $"https://nominatim.openstreetmap.org/reverse" +
                $"?format=json" +
                $"&lat={lat}" +
                $"&lon={lon}" +
                $"&addressdetails=1";

            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode)
                return Results.Problem("Failed to reverse geocode");

            var json = await response.Content.ReadAsStringAsync();
            return Results.Content(json, "application/json");
        });
    }
}
