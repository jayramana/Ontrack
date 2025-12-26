using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;

public static class GeocodingEndpoints
{
    public static void MapGeocodingEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/geocode").WithTags("Geocode");

        group.MapGet("/reverse", async (
            double lat,
            double lon,
            HttpClient client
        ) =>
        {
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

        group.MapGet("/search", async (
            string q,
            HttpClient client
        ) =>
        {
            client.DefaultRequestHeaders.UserAgent.ParseAdd("OnTrackLogistics/1.0 (contact@ontrack.com)");

            var url =
                $"https://nominatim.openstreetmap.org/search" +
                $"?format=json" +
                $"&q={Uri.EscapeDataString(q)}" +
                $"&addressdetails=1" +
                $"&limit=10" +
                $"&countrycodes=in"; // Prioritize results in India

            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode)
                return Results.Problem("Failed to search geocode");

            var json = await response.Content.ReadAsStringAsync();
            return Results.Content(json, "application/json");
        });
    }
}
