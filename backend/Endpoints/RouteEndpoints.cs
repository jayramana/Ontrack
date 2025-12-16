using Microsoft.Extensions.Caching.Memory;
using System.Globalization;
using System.Text.Json;
using Backend.DTO;

public static class RouteEndpoints
{
    const int MaxStops = 25;
    const double MinLat = 8.0, MaxLat = 13.6;
    const double MinLng = 76.0, MaxLng = 80.4;
    
    // Made static readonly to be accessible from static methods
    static readonly Uri OsrmBase = new Uri("http://router.project-osrm.org/");
    static readonly SemaphoreSlim osrmGate = new SemaphoreSlim(8, 8);

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

            if (req.stops.Any(s => !IsInTN(s.lat, s.lng)))
                return Results.BadRequest("All coordinates must be inside Tamil Nadu.");

            var start = req.driverLocation != null &&
                        IsInTN(req.driverLocation.lat, req.driverLocation.lng)
                ? req.driverLocation
                : req.stops[0];

            var points = new List<StopDto> { start };
            points.AddRange(req.stops);

            var cacheKey = "osrm:table:" + string.Join("|", points.Select(p =>
                $"{Math.Round(p.lng, 5).ToString(CultureInfo.InvariantCulture)}," +
                $"{Math.Round(p.lat, 5).ToString(CultureInfo.InvariantCulture)}"));

            if (!cache.TryGetValue(cacheKey, out OsrmTableResult table))
            {
                table = await CallOsrmTable(points, httpFactory, osrmGate, OsrmBase);
                cache.Set(cacheKey, table, TimeSpan.FromMinutes(10));
            }

            var orderedStops = req.optimizationMode switch
            {
                "PriorityFirst" => OptimizePriorityFirst(req.stops, table),
                "TimeWindow"    => OptimizeTimeWindow(req.stops),
                "AvoidIssues"   => OptimizeAvoidIssues(req.stops, req.roadIssues ?? []),
                _               => OptimizeBalanced(req.stops, table, req.roadIssues ?? [])
            };

            var routePts = new List<StopDto> { start };
            routePts.AddRange(orderedStops);

            var routeJson = await CallOsrmRouteRaw(routePts, httpFactory, osrmGate, OsrmBase);
            return Results.Text(routeJson, "application/json");
        });
    }

    static List<StopDto> OptimizeBalanced(
        List<StopDto> stops,
        OsrmTableResult table,
        List<RoadIssueDto> issues)
    {
        return stops
            .OrderBy(s => table.Durations[0][stops.IndexOf(s) + 1] ?? double.MaxValue)
            .ThenByDescending(s => s.priority)
            .ToList();
    }

    static List<StopDto> OptimizePriorityFirst(
        List<StopDto> stops,
        OsrmTableResult table)
    {
        return stops
            .OrderByDescending(s => s.priority)
            .ThenBy(s => table.Durations[0][stops.IndexOf(s) + 1] ?? double.MaxValue)
            .ToList();
    }

    static List<StopDto> OptimizeTimeWindow(List<StopDto> stops) =>
        stops.OrderBy(s => s.windowStart ?? DateTime.MaxValue)
             .ThenByDescending(s => s.priority)
             .ToList();

    static List<StopDto> OptimizeAvoidIssues(
        List<StopDto> stops,
        List<RoadIssueDto> issues)
    {
        return stops
            .OrderBy(s => IssueRiskScore(s, issues))
            .ThenByDescending(s => s.priority)
            .ToList();
    }


    static async Task<OsrmTableResult> CallOsrmTable(
        List<StopDto> pts,
        IHttpClientFactory factory,
        SemaphoreSlim gate,
        Uri baseUri)
    {
        var coords = string.Join(";", pts.Select(p =>
            $"{p.lng.ToString(CultureInfo.InvariantCulture)}," +
            $"{p.lat.ToString(CultureInfo.InvariantCulture)}"));

        var url = new Uri(baseUri, $"table/v1/driving/{coords}?annotations=duration");
        var client = factory.CreateClient();

        await gate.WaitAsync();
        try
        {
            var json = await client.GetStringAsync(url);
            var root = JsonDocument.Parse(json).RootElement;
            return OsrmTableResult.FromJson(root);
        }
        finally { gate.Release(); }
    }

    static async Task<string> CallOsrmRouteRaw(
        List<StopDto> pts,
        IHttpClientFactory factory,
        SemaphoreSlim gate,
        Uri baseUri)
    {
        var coords = string.Join(";", pts.Select(p =>
            $"{p.lng.ToString(CultureInfo.InvariantCulture)}," +
            $"{p.lat.ToString(CultureInfo.InvariantCulture)}"));

        var url = new Uri(baseUri, $"route/v1/driving/{coords}?overview=full&geometries=geojson");
        var client = factory.CreateClient();

        await gate.WaitAsync();
        try { return await client.GetStringAsync(url); }
        finally { gate.Release(); }
    }

    static bool IsInTN(double lat, double lng) =>
        lat >= 8.0 && lat <= 13.6 && lng >= 76.0 && lng <= 80.4;

    static double IssueRiskScore(StopDto stop, List<RoadIssueDto> issues)
    {
        double score = 0;
        foreach (var i in issues)
        {
            var d = Haversine(stop.lat, stop.lng, i.latitude, i.longitude);
            if (d < 1.5 && i.severity == "Critical") score += 2;
            if (d < 1.0 && i.severity == "High") score += 1;
        }
        return score;
    }

    static double Haversine(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a =
            Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
            Math.Cos(lat1 * Math.PI / 180) *
            Math.Cos(lat2 * Math.PI / 180) *
            Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return 2 * R * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    public sealed class OsrmTableResult
    {
        public double?[][] Durations { get; init; } = default!;
        public static OsrmTableResult FromJson(JsonElement root)
        {
            var d = root.GetProperty("durations");
            var arr = new double?[d.GetArrayLength()][];
            for (int i = 0; i < arr.Length; i++)
                arr[i] = d[i].EnumerateArray().Select(x => (double?)x.GetDouble()).ToArray();
            return new() { Durations = arr };
        }
    }
}



