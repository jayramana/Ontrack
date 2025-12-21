// using Microsoft.Extensions.Caching.Memory;
// using System.Globalization;

// namespace Backend.Endpoints;

// public static class RouteEndpoints
// {
//     // CONSTANTS
//     private const int MaxStops = 25;
//     private const double MinLat = 8.0, MaxLat = 13.6;
//     private const double MinLng = 76.0, MaxLng = 80.4;

//     private static readonly Uri OsrmBase = new("http://router.project-osrm.org/");
//     private static readonly SemaphoreSlim osrmGate = new(8, 8);

//     public static void MapRouteEndpoints(this IEndpointRouteBuilder app)
//     {
//         app.MapPost("/api/route/optimize", async (
//             OptimizeRouteRequest req,
//             IHttpClientFactory httpFactory,
//             IMemoryCache cache
//         ) =>
//         {
//             if (req.stops == null || req.stops.Count < 2)
//                 return Results.BadRequest("At least 2 stops required.");

//             if (req.stops.Count > MaxStops)
//                 return Results.BadRequest($"Max {MaxStops} stops allowed.");

//             foreach (var s in req.stops)
//             {
//                 if (!IsInTN(s.lat, s.lng))
//                     return Results.BadRequest("All coordinates must be inside Tamil Nadu.");
//             }

//             var start = req.driverLocation != null &&
//                         IsInTN(req.driverLocation.lat, req.driverLocation.lng)
//                 ? req.driverLocation
//                 : req.stops[0];

//             var orderedStops = req.optimizationMode switch
//             {
//                 "PriorityFirst" => OptimizeWithPriorityAndDistance(req.stops, start, req.roadIssues ?? []),
//                 "TimeWindow"    => OptimizeTimeWindow(req.stops, start),
//                 "AvoidIssues"   => OptimizeAvoidIssues(req.stops, start, req.roadIssues ?? []),
//                 "AIOptimized"   => OptimizeWithPriorityAndDistance(req.stops, start, req.roadIssues ?? []),
//                 _               => OptimizeWithPriorityAndDistance(req.stops, start, req.roadIssues ?? [])
//             };

//             var routePoints = new List<StopDto> { start };
//             routePoints.AddRange(orderedStops);

//             var routeJson = await CallOsrmRouteRaw(routePoints, httpFactory);
//             return Results.Content(routeJson, "application/json");
//         })
//         .WithTags("Route Optimization");
//     }

//     // ---------------- OPTIMIZATION LOGIC ----------------

//     private static List<StopDto> OptimizeWithPriorityAndDistance(
//         List<StopDto> stops,
//         StopDto start,
//         List<RoadIssueDto> issues)
//     {
//         var high = stops.Where(s => s.priority >= 4).ToList();
//         var normal = stops.Where(s => s.priority < 4).ToList();

//         var result = new List<StopDto>();

//         if (high.Any())
//             result.AddRange(NearestNeighborSort(high, start));

//         if (normal.Any())
//         {
//             var cur = result.Any() ? result.Last() : start;
//             result.AddRange(NearestNeighborSort(normal, cur));
//         }

//         return result;
//     }

//     private static List<StopDto> OptimizeTimeWindow(List<StopDto> stops, StopDto start)
//     {
//         var timed = stops.Where(s => s.windowStart.HasValue).ToList();
//         var normal = stops.Where(s => !s.windowStart.HasValue).ToList();

//         var result = new List<StopDto>();

//         if (timed.Any())
//         {
//             result.AddRange(
//                 timed.OrderBy(s => s.windowStart)
//                      .ThenBy(s => Haversine(start.lat, start.lng, s.lat, s.lng))
//             );
//         }

//         if (normal.Any())
//         {
//             var cur = result.Any() ? result.Last() : start;
//             result.AddRange(NearestNeighborSort(normal, cur));
//         }

//         return result;
//     }

//     private static List<StopDto> OptimizeAvoidIssues(
//         List<StopDto> stops,
//         StopDto start,
//         List<RoadIssueDto> issues)
//     {
//         var sorted = stops
//             .OrderBy(s => IssueRiskScore(s, issues))
//             .ThenByDescending(s => s.priority)
//             .ToList();

//         return NearestNeighborSort(sorted, start);
//     }

//     // ---------------- HELPERS ----------------

//     private static List<StopDto> NearestNeighborSort(List<StopDto> stops, StopDto start)
//     {
//         var remaining = new List<StopDto>(stops);
//         var result = new List<StopDto>();
//         var current = start;

//         while (remaining.Any())
//         {
//             var nearest = remaining
//                 .OrderBy(s => Haversine(current.lat, current.lng, s.lat, s.lng))
//                 .First();

//             result.Add(nearest);
//             remaining.Remove(nearest);
//             current = nearest;
//         }

//         return result;
//     }

//     private static bool IsInTN(double lat, double lng) =>
//         lat >= MinLat && lat <= MaxLat && lng >= MinLng && lng <= MaxLng;

//     private static double IssueRiskScore(StopDto stop, List<RoadIssueDto> issues)
//     {
//         double score = 0;
//         foreach (var i in issues)
//         {
//             var d = Haversine(stop.lat, stop.lng, i.latitude, i.longitude);
//             if (d < 5)
//             {
//                 score += i.severity switch
//                 {
//                     "Critical" => 10,
//                     "High"     => 5,
//                     "Medium"   => 2,
//                     _          => 1
//                 };
//             }
//         }
//         return score;
//     }

//     private static double Haversine(double lat1, double lon1, double lat2, double lon2)
//     {
//         const double R = 6371;
//         var dLat = (lat2 - lat1) * Math.PI / 180;
//         var dLon = (lon2 - lon1) * Math.PI / 180;

//         var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
//                 Math.Cos(lat1 * Math.PI / 180) *
//                 Math.Cos(lat2 * Math.PI / 180) *
//                 Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

//         return 2 * R * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
//     }

//     // ---------------- OSRM ----------------

//     private static async Task<string> CallOsrmRouteRaw(
//         List<StopDto> pts,
//         IHttpClientFactory factory)
//     {
//         var coordStr = string.Join(";", pts.Select(p =>
//             $"{p.lng.ToString(CultureInfo.InvariantCulture)}," +
//             $"{p.lat.ToString(CultureInfo.InvariantCulture)}"));

//         var url = new Uri(
//             OsrmBase,
//             $"route/v1/driving/{coordStr}?overview=full&geometries=geojson&steps=true"
//         );

//         var client = factory.CreateClient();
//         client.Timeout = TimeSpan.FromSeconds(25);

//         using var req = new HttpRequestMessage(HttpMethod.Get, url);
//         req.Headers.UserAgent.ParseAdd("OnTrack-Navigation/1.0");

//         using var resp = await client.SendAsync(req);
//         var body = await resp.Content.ReadAsStringAsync();

//         if (!resp.IsSuccessStatusCode)
//             throw new HttpRequestException($"OSRM route failed ({resp.StatusCode})");

//         return body;
//     }
// }


using Microsoft.Extensions.Caching.Memory;
using System.Globalization;

namespace Backend.Endpoints;

public static class RouteEndpoints
{
    // CONSTANTS
    private const int MaxStops = 25;
    private const double MinLat = 8.0, MaxLat = 13.6;
    private const double MinLng = 76.0, MaxLng = 80.4;

    private static readonly Uri OsrmBase = new("http://router.project-osrm.org/");
    private static readonly SemaphoreSlim osrmGate = new(8, 8);

    public static void MapRouteEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/route/optimize", async (
            OptimizeRouteRequest req,
            IHttpClientFactory httpFactory,
            IMemoryCache cache
        ) =>
        {
            if (req.stops == null || req.stops.Count < 2)
                return Results.BadRequest("At least 2 stops required.");

            if (req.stops.Count > MaxStops)
                return Results.BadRequest($"Max {MaxStops} stops allowed.");

            foreach (var s in req.stops)
            {
                if (!IsInTN(s.lat, s.lng))
                    return Results.BadRequest("All coordinates must be inside Tamil Nadu.");
            }

            // Use driver location as start if provided
            var start = req.driverLocation != null &&
                        IsInTN(req.driverLocation.lat, req.driverLocation.lng)
                ? req.driverLocation
                : req.stops[0];

            // Optimize stops based on mode
            var orderedStops = req.optimizationMode switch
            {
                "PriorityFirst" => OptimizeWithPriorityAndDistance(req.stops, start, req.roadIssues ?? []),
                "TimeWindow"    => OptimizeTimeWindow(req.stops, start),
                "AvoidIssues"   => OptimizeAvoidIssues(req.stops, start, req.roadIssues ?? []),
                "AIOptimized"   => OptimizeWithPriorityAndDistance(req.stops, start, req.roadIssues ?? []),
                _               => OptimizeWithPriorityAndDistance(req.stops, start, req.roadIssues ?? [])
            };

            // Build route points (driver location + stops)
            var routePoints = new List<StopDto> { start };
            routePoints.AddRange(orderedStops);

            // Get route with turn-by-turn instructions
            var routeJson = await CallOsrmRouteWithSteps(routePoints, httpFactory);
            return Results.Content(routeJson, "application/json");
        })
        .WithTags("Route Optimization");
    }

    // ---------------- OPTIMIZATION LOGIC ----------------

    private static List<StopDto> OptimizeWithPriorityAndDistance(
        List<StopDto> stops,
        StopDto start,
        List<RoadIssueDto> issues)
    {
        var high = stops.Where(s => s.priority >= 4).ToList();
        var normal = stops.Where(s => s.priority < 4).ToList();

        var result = new List<StopDto>();

        // High priority stops first with nearest neighbor
        if (high.Any())
            result.AddRange(NearestNeighborSort(high, start));

        // Then normal priority from last high priority location
        if (normal.Any())
        {
            var cur = result.Any() ? result.Last() : start;
            result.AddRange(NearestNeighborSort(normal, cur));
        }

        return result;
    }

    private static List<StopDto> OptimizeTimeWindow(List<StopDto> stops, StopDto start)
    {
        var timed = stops.Where(s => s.windowStart.HasValue).ToList();
        var normal = stops.Where(s => !s.windowStart.HasValue).ToList();

        var result = new List<StopDto>();

        if (timed.Any())
        {
            result.AddRange(
                timed.OrderBy(s => s.windowStart)
                     .ThenBy(s => Haversine(start.lat, start.lng, s.lat, s.lng))
            );
        }

        if (normal.Any())
        {
            var cur = result.Any() ? result.Last() : start;
            result.AddRange(NearestNeighborSort(normal, cur));
        }

        return result;
    }

    private static List<StopDto> OptimizeAvoidIssues(
        List<StopDto> stops,
        StopDto start,
        List<RoadIssueDto> issues)
    {
        // Sort by issue risk score (lowest risk first)
        var sorted = stops
            .OrderBy(s => IssueRiskScore(s, issues))
            .ThenByDescending(s => s.priority)
            .ToList();

        return NearestNeighborSort(sorted, start);
    }

    // ---------------- NEAREST NEIGHBOR ALGORITHM ----------------

    private static List<StopDto> NearestNeighborSort(List<StopDto> stops, StopDto start)
    {
        var remaining = new List<StopDto>(stops);
        var result = new List<StopDto>();
        var current = start;

        while (remaining.Any())
        {
            var nearest = remaining
                .OrderBy(s => Haversine(current.lat, current.lng, s.lat, s.lng))
                .First();

            result.Add(nearest);
            remaining.Remove(nearest);
            current = nearest;
        }

        return result;
    }

    // ---------------- HELPERS ----------------

    private static bool IsInTN(double lat, double lng) =>
        lat >= MinLat && lat <= MaxLat && lng >= MinLng && lng <= MaxLng;

    private static double IssueRiskScore(StopDto stop, List<RoadIssueDto> issues)
    {
        double score = 0;
        foreach (var i in issues)
        {
            var d = Haversine(stop.lat, stop.lng, i.latitude, i.longitude);
            if (d < 5)
            {
                score += i.severity switch
                {
                    "Critical" => 10,
                    "High"     => 5,
                    "Medium"   => 2,
                    _          => 1
                };
            }
        }
        return score;
    }

    private static double Haversine(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180) *
                Math.Cos(lat2 * Math.PI / 180) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        return 2 * R * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    // ---------------- OSRM WITH TURN-BY-TURN STEPS ----------------

    private static async Task<string> CallOsrmRouteWithSteps(
        List<StopDto> pts,
        IHttpClientFactory factory)
    {
        var coordStr = string.Join(";", pts.Select(p =>
            $"{p.lng.ToString(CultureInfo.InvariantCulture)}," +
            $"{p.lat.ToString(CultureInfo.InvariantCulture)}"));

        // Request route with steps=true for turn-by-turn instructions
        var url = new Uri(
            OsrmBase,
            $"route/v1/driving/{coordStr}?overview=full&geometries=geojson&steps=true&annotations=true"
        );

        var client = factory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(30);

        using var req = new HttpRequestMessage(HttpMethod.Get, url);
        req.Headers.UserAgent.ParseAdd("OnTrack-Navigation/2.0");

        await osrmGate.WaitAsync();
        try
        {
            using var resp = await client.SendAsync(req);
            var body = await resp.Content.ReadAsStringAsync();

            if (!resp.IsSuccessStatusCode)
                throw new HttpRequestException($"OSRM route failed ({resp.StatusCode}): {body}");

            return body;
        }
        finally
        {
            osrmGate.Release();
        }
    }
}