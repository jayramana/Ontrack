// // // using Microsoft.AspNetCore.Mvc;
// // // using System.Net.Http;
// // // using System.Text;
// // // using System.Text.Json;

// // // [ApiController]
// // // [Route("api/route")]
// // // public class RouteController : ControllerBase
// // // {
// // //     private readonly IHttpClientFactory _httpClientFactory;

// // //     public RouteController(IHttpClientFactory httpClientFactory)
// // //     {
// // //         _httpClientFactory = httpClientFactory;
// // //     }

// // //     [HttpGet("osrm")]
// // //     public async Task<IActionResult> GetRoute([FromQuery] string coordinates)
// // //     {
// // //         try
// // //         {
// // //             if (string.IsNullOrEmpty(coordinates))
// // //             {
// // //                 return BadRequest("Coordinates parameter is required");
// // //             }

// // //             // Parse coordinates
// // //             var coords = coordinates.Split(';')
// // //                 .Select(c => c.Split(','))
// // //                 .Select(c => new CoordPoint 
// // //                 { 
// // //                     Lng = double.Parse(c[0]), 
// // //                     Lat = double.Parse(c[1]) 
// // //                 })
// // //                 .ToList();

// // //             if (coords.Count < 2)
// // //             {
// // //                 return BadRequest("At least 2 coordinates required");
// // //             }

// // //             var httpClient = _httpClientFactory.CreateClient();
// // //             httpClient.Timeout = TimeSpan.FromSeconds(30);

// // //             // ==========================================
// // //             // OPTION 1: Valhalla (Primary)
// // //             // ==========================================
// // //             try 
// // //             {
// // //                 // Build Valhalla request
// // //                 var locations = coords.Select(c => new 
// // //                 { 
// // //                     lat = c.Lat, 
// // //                     lon = c.Lng 
// // //                 }).ToArray();

// // //                 var valhallaRequest = new
// // //                 {
// // //                     locations = locations,
// // //                     costing = "auto",
// // //                     directions_options = new { units = "kilometers" }
// // //                 };

// // //                 var jsonContent = new StringContent(
// // //                     JsonSerializer.Serialize(valhallaRequest),
// // //                     Encoding.UTF8,
// // //                     "application/json"
// // //                 );

// // //                 var valhallaUrl = "https://valhalla1.openstreetmap.de/route";
// // //                 var response = await httpClient.PostAsync(valhallaUrl, jsonContent);

// // //                 if (response.IsSuccessStatusCode)
// // //                 {
// // //                     var content = await response.Content.ReadAsStringAsync();
// // //                     var valhallaResult = JsonSerializer.Deserialize<JsonElement>(content);

// // //                     // Convert Valhalla format to OSRM-like format
// // //                     var shape = valhallaResult.GetProperty("trip")
// // //                         .GetProperty("legs")[0]
// // //                         .GetProperty("shape")
// // //                         .GetString();

// // //                     if (shape != null)
// // //                     {
// // //                         var decodedCoords = DecodePolyline(shape);

// // //                         var osrmFormat = new
// // //                         {
// // //                             routes = new[]
// // //                             {
// // //                                 new
// // //                                 {
// // //                                     geometry = new
// // //                                     {
// // //                                         coordinates = decodedCoords,
// // //                                         type = "LineString"
// // //                                     },
// // //                                     distance = valhallaResult.GetProperty("trip")
// // //                                         .GetProperty("summary")
// // //                                         .GetProperty("length")
// // //                                         .GetDouble() * 1000, // Convert km to meters
// // //                                     duration = valhallaResult.GetProperty("trip")
// // //                                         .GetProperty("summary")
// // //                                         .GetProperty("time")
// // //                                         .GetDouble()
// // //                                 }
// // //                             }
// // //                         };

// // //                         return Ok(osrmFormat);
// // //                     }
// // //                 }
// // //             }
// // //             catch
// // //             {
// // //                 // Ignore Valhalla errors and continue
// // //             }

// // //             // ==========================================
// // //             // OPTION 2: OSRM (Backup)
// // //             // ==========================================
// // //             try 
// // //             {
// // //                 var osrmCoords = string.Join(";", coords.Select(c => $"{c.Lng},{c.Lat}"));
// // //                 //var osrmUrl = $"https://routing.openstreetmap.de/routed-car/route/v1/driving/{osrmCoords}?overview=full&geometries=geojson";
// // //                 var osrmUrl =
// // //     $"https://router.project-osrm.org/route/v1/driving/{osrmCoords}" +
// // //     "?overview=full&geometries=geojson";

// // //                 var request = new HttpRequestMessage(HttpMethod.Get, osrmUrl);
// // //                 request.Headers.Add("User-Agent", "Ontrack-Project/1.0");

// // //                 var response = await httpClient.SendAsync(request);

// // //                 if (response.IsSuccessStatusCode)
// // //                 {
// // //                     var content = await response.Content.ReadAsStringAsync();
// // //                     return Content(content, "application/json");
// // //                 }
// // //             }
// // //             catch
// // //             {
// // //                 // Ignore OSRM errors and continue
// // //             }

// // //             // ==========================================
// // //             // OPTION 3: Straight Line (Fallback)
// // //             // ==========================================
// // //             return Ok(GenerateStraightLineRoute(coords));
// // //         }
// // //         catch (Exception ex)
// // //         {
// // //             // Fallback to straight line on any crash
// // //             try
// // //             {
// // //                 var coords = coordinates.Split(';')
// // //                     .Select(c => c.Split(','))
// // //                     .Select(c => new CoordPoint 
// // //                     { 
// // //                         Lng = double.Parse(c[0]), 
// // //                         Lat = double.Parse(c[1]) 
// // //                     })
// // //                     .ToList();

// // //                 return Ok(GenerateStraightLineRoute(coords));
// // //             }
// // //             catch
// // //             {
// // //                 return StatusCode(500, new 
// // //                 { 
// // //                     error = "Route Error", 
// // //                     message = ex.Message
// // //                 });
// // //             }
// // //         }
// // //     }

// // //     private object GenerateStraightLineRoute(List<CoordPoint> coords)
// // //     {
// // //         // Create interpolated points for smoother lines
// // //         var allPoints = new List<double[]>();
        
// // //         for (int i = 0; i < coords.Count - 1; i++)
// // //         {
// // //             var start = coords[i];
// // //             var end = coords[i + 1];
            
// // //             // Add start point
// // //             allPoints.Add(new[] { start.Lng, start.Lat });
            
// // //             // Add 3 interpolated points for smooth curve
// // //             for (int j = 1; j <= 3; j++)
// // //             {
// // //                 var ratio = j / 4.0;
// // //                 var lng = start.Lng + (end.Lng - start.Lng) * ratio;
// // //                 var lat = start.Lat + (end.Lat - start.Lat) * ratio;
// // //                 allPoints.Add(new[] { lng, lat });
// // //             }
// // //         }
        
// // //         // Add last point
// // //         var lastCoord = coords[coords.Count - 1];
// // //         allPoints.Add(new[] { lastCoord.Lng, lastCoord.Lat });

// // //         // Calculate total distance
// // //         double totalDistance = 0;
// // //         for (int i = 0; i < coords.Count - 1; i++)
// // //         {
// // //             totalDistance += CalculateDistance(
// // //                 coords[i].Lat, coords[i].Lng,
// // //                 coords[i + 1].Lat, coords[i + 1].Lng
// // //             );
// // //         }

// // //         return new
// // //         {
// // //             routes = new[]
// // //             {
// // //                 new
// // //                 {
// // //                     geometry = new
// // //                     {
// // //                         coordinates = allPoints,
// // //                         type = "LineString"
// // //                     },
// // //                     distance = totalDistance * 1000, // km to meters
// // //                     duration = totalDistance * 50 // Rough estimate: 50 seconds per km
// // //                 }
// // //             }
// // //         };
// // //     }

// // //     private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
// // //     {
// // //         const double R = 6371; // Earth radius in km
// // //         var dLat = ToRadians(lat2 - lat1);
// // //         var dLon = ToRadians(lon2 - lon1);
// // //         var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
// // //                 Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
// // //                 Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
// // //         var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
// // //         return R * c;
// // //     }

// // //     private double ToRadians(double degrees) => degrees * Math.PI / 180.0;

// // //     // Decode Google polyline format
// // //     private List<double[]> DecodePolyline(string encoded)
// // //     {
// // //         var points = new List<double[]>();
// // //         int index = 0, len = encoded.Length;
// // //         int lat = 0, lng = 0;

// // //         while (index < len)
// // //         {
// // //             int b, shift = 0, result = 0;
// // //             do
// // //             {
// // //                 b = encoded[index++] - 63;
// // //                 result |= (b & 0x1f) << shift;
// // //                 shift += 5;
// // //             } while (b >= 0x20);
// // //             int dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
// // //             lat += dlat;

// // //             shift = 0;
// // //             result = 0;
// // //             do
// // //             {
// // //                 b = encoded[index++] - 63;
// // //                 result |= (b & 0x1f) << shift;
// // //                 shift += 5;
// // //             } while (b >= 0x20);
// // //             int dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
// // //             lng += dlng;

// // //             points.Add(new[] { lng / 1e5, lat / 1e5 });
// // //         }

// // //         return points;
// // //     }

// // //     // Helper class for coordinate points
// // //     private class CoordPoint
// // //     {
// // //         public double Lng { get; set; }
// // //         public double Lat { get; set; }
// // //     }
// // // }

// // using Microsoft.AspNetCore.Mvc;
// // using Microsoft.Extensions.Caching.Memory;
// // using System.Globalization;
// // using System.Text.Json;

// // namespace YourNamespace.Controllers
// // {
// //     [ApiController]
// //     [Route("api/route")]
// //     public class RouteController : ControllerBase
// //     {
// //         private const int MaxStops = 25;

// //         // Tamil Nadu bounds (lat: 8.0–13.6, lng: 76.0–80.4)
// //         private const double MinLat = 8.0, MaxLat = 13.6;
// //         private const double MinLng = 76.0, MaxLng = 80.4;

// //         private static readonly Uri OsrmBase = new("http://router.project-osrm.org/");
// //         private readonly IHttpClientFactory _httpClientFactory;
// //         private readonly IMemoryCache _cache;

// //         // Concurrency gate to avoid hammering public OSRM
// //         private static readonly SemaphoreSlim _osrmGate = new(8, 8);

// //         public RouteController(IHttpClientFactory httpClientFactory, IMemoryCache cache)
// //         {
// //             _httpClientFactory = httpClientFactory;
// //             _cache = cache;
// //         }

// //         // ---------- DTOs ----------
// //         public sealed record StopDto(
// //             double lat,
// //             double lng,
// //             int priority,
// //             DateTime? windowStart,
// //             DateTime? windowEnd
// //         );

// //         public sealed record RoadIssueDto(
// //             double latitude,
// //             double longitude,
// //             string severity
// //         );

// //         public sealed record OptimizeRouteRequest(
// //             List<StopDto> stops,
// //             List<RoadIssueDto>? roadIssues,
// //             StopDto? driverLocation
// //         );

// //         // ---------- Endpoint ----------
// //         [HttpPost("optimize")]
// //         public async Task<IActionResult> Optimize([FromBody] OptimizeRouteRequest req)
// //         {
// //             if (req?.stops == null || req.stops.Count < 2)
// //                 return BadRequest("At least 2 stops required.");

// //             if (req.stops.Count > MaxStops)
// //                 return BadRequest($"Max {MaxStops} stops allowed.");

// //             // Validate bounds + priority
// //             foreach (var s in req.stops)
// //             {
// //                 if (!IsInTamilNadu(s.lat, s.lng))
// //                     return BadRequest("All coordinates must be within Tamil Nadu bounds.");

// //                 if (s.priority is < 1 or > 5)
// //                     return BadRequest("Priority must be between 1 and 5.");
// //             }

// //             // Driver start point (optional)
// //             var start = req.driverLocation != null && IsInTamilNadu(req.driverLocation.lat, req.driverLocation.lng)
// //                 ? req.driverLocation
// //                 : req.stops[0]; // deterministic fallback

// //             // points for OSRM Table: index 0=start, 1..N=stops
// //             var points = new List<StopDto> { start };
// //             points.AddRange(req.stops);

// //             // Cache key (rounded coords)
// //             var cacheKey = "osrm:table:" + string.Join("|", points.Select(p =>
// //                 $"{Math.Round(p.lng, 5).ToString(CultureInfo.InvariantCulture)},{Math.Round(p.lat, 5).ToString(CultureInfo.InvariantCulture)}"));

// //             OsrmTableResult table;
// //             if (!_cache.TryGetValue(cacheKey, out table))
// //             {
// //                 table = await CallOsrmTable(points);
// //                 _cache.Set(cacheKey, table, TimeSpan.FromMinutes(10));
// //             }

// //             // Optimize order using matrix + road issues
// //             var orderedStops = OptimizeOrder(
// //                 start,
// //                 req.stops,
// //                 table,
// //                 req.roadIssues ?? new List<RoadIssueDto>()
// //             );

// //             // Now route using OSRM Route service in that order: start + orderedStops
// //             var routePoints = new List<StopDto> { start };
// //             routePoints.AddRange(orderedStops);

// //             var routeJson = await CallOsrmRouteRaw(routePoints);

// //             // Return OSRM JSON as-is (geometry.coordinates is [lng,lat])
// //             return Content(routeJson, "application/json");
// //         }

// //         private static bool IsInTamilNadu(double lat, double lng) =>
// //             lat >= MinLat && lat <= MaxLat && lng >= MinLng && lng <= MaxLng;

// //         // ----------------------------
// //         // OSRM calls
// //         // ----------------------------
// //         private async Task<OsrmTableResult> CallOsrmTable(List<StopDto> pts)
// //         {
// //             // /table/v1/driving/{coords}?annotations=duration,distance
// //             var coordStr = string.Join(";", pts.Select(p =>
// //                 $"{p.lng.ToString(CultureInfo.InvariantCulture)},{p.lat.ToString(CultureInfo.InvariantCulture)}"));

// //             var url = new Uri(OsrmBase, $"table/v1/driving/{coordStr}?annotations=duration,distance");

// //             var client = _httpClientFactory.CreateClient();
// //             client.Timeout = TimeSpan.FromSeconds(20);

// //             await _osrmGate.WaitAsync();
// //             try
// //             {
// //                 using var req = new HttpRequestMessage(HttpMethod.Get, url);
// //                 req.Headers.UserAgent.ParseAdd("OnTrack-Routing/1.0");

// //                 using var resp = await client.SendAsync(req);
// //                 var body = await resp.Content.ReadAsStringAsync();

// //                 if (!resp.IsSuccessStatusCode)
// //                     throw new HttpRequestException($"OSRM table failed ({(int)resp.StatusCode}): {body}");

// //                 using var doc = JsonDocument.Parse(body);
// //                 var root = doc.RootElement;

// //                 if (root.GetProperty("code").GetString() != "Ok")
// //                     throw new InvalidOperationException("OSRM table returned non-Ok code.");

// //                 return OsrmTableResult.FromJson(root);
// //             }
// //             finally
// //             {
// //                 _osrmGate.Release();
// //             }
// //         }

// //         private async Task<string> CallOsrmRouteRaw(List<StopDto> pts)
// //         {
// //             // /route/v1/driving/{coords}?overview=full&geometries=geojson
// //             var coordStr = string.Join(";", pts.Select(p =>
// //                 $"{p.lng.ToString(CultureInfo.InvariantCulture)},{p.lat.ToString(CultureInfo.InvariantCulture)}"));

// //             var url = new Uri(OsrmBase, $"route/v1/driving/{coordStr}?overview=full&geometries=geojson");

// //             var client = _httpClientFactory.CreateClient();
// //             client.Timeout = TimeSpan.FromSeconds(25);

// //             await _osrmGate.WaitAsync();
// //             try
// //             {
// //                 using var req = new HttpRequestMessage(HttpMethod.Get, url);
// //                 req.Headers.UserAgent.ParseAdd("OnTrack-Routing/1.0");

// //                 using var resp = await client.SendAsync(req);
// //                 var body = await resp.Content.ReadAsStringAsync();

// //                 if (!resp.IsSuccessStatusCode)
// //                     throw new HttpRequestException($"OSRM route failed ({(int)resp.StatusCode}): {body}");

// //                 return body;
// //             }
// //             finally
// //             {
// //                 _osrmGate.Release();
// //             }
// //         }

// //         // ----------------------------
// //         // Optimization using OSRM matrix
// //         // ----------------------------
// //         private static List<StopDto> OptimizeOrder(
// //             StopDto start,
// //             List<StopDto> stops,
// //             OsrmTableResult table,
// //             List<RoadIssueDto> issues)
// //         {
// //             var remaining = stops.Select((s, idx) => (stop: s, matrixIndex: idx + 1)).ToList();
// //             var route = new List<(StopDto stop, int matrixIndex)>();

// //             const double wTime = 1.0;
// //             const double wPrio = 180.0;
// //             const double wRisk = 120.0;

// //             int currentIndex = 0; // start index in matrix

// //             while (remaining.Count > 0)
// //             {
// //                 int nextRank = route.Count + 1;

// //                 double bestScore = double.PositiveInfinity;
// //                 int bestIdx = 0;

// //                 for (int i = 0; i < remaining.Count; i++)
// //                 {
// //                     var cand = remaining[i];

// //                     var travelSec = table.Durations[currentIndex][cand.matrixIndex] ?? double.PositiveInfinity;

// //                     // priority 5 -> deliver early (lower penalty), priority 1 -> more penalty if early
// //                     var prioPenalty = (6 - cand.stop.priority) * 0.2;
// //                     var priorityLatePenalty = wPrio * prioPenalty * nextRank;

// //                     var riskPenalty = wRisk * IssueRiskScore(cand.stop, issues);

// //                     var score = wTime * travelSec + priorityLatePenalty + riskPenalty;

// //                     if (score < bestScore)
// //                     {
// //                         bestScore = score;
// //                         bestIdx = i;
// //                     }
// //                 }

// //                 var chosen = remaining[bestIdx];
// //                 remaining.RemoveAt(bestIdx);
// //                 route.Add(chosen);
// //                 currentIndex = chosen.matrixIndex;
// //             }

// //             return route.Select(x => x.stop).ToList();
// //         }

// //         private static double IssueRiskScore(StopDto stop, List<RoadIssueDto> issues)
// //         {
// //             double best = 0;

// //             foreach (var i in issues)
// //             {
// //                 if (!IsFinite(i.latitude, i.longitude)) continue;

// //                 var dKm = HaversineKm(stop.lat, stop.lng, i.latitude, i.longitude);

// //                 double radiusKm = i.severity switch
// //                 {
// //                     "Critical" => 1.5,
// //                     "High" => 1.0,
// //                     "Medium" => 0.6,
// //                     _ => 0.4
// //                 };

// //                 if (dKm <= radiusKm)
// //                 {
// //                     double sev = i.severity switch
// //                     {
// //                         "Critical" => 1.0,
// //                         "High" => 0.7,
// //                         "Medium" => 0.4,
// //                         _ => 0.2
// //                     };

// //                     var score = sev * (1.0 - (dKm / radiusKm));
// //                     if (score > best) best = score;
// //                 }
// //             }

// //             return best;
// //         }

// //         private static bool IsFinite(double a, double b) =>
// //             !double.IsNaN(a) && !double.IsNaN(b) && !double.IsInfinity(a) && !double.IsInfinity(b);

// //         private static double HaversineKm(double lat1, double lon1, double lat2, double lon2)
// //         {
// //             const double R = 6371;
// //             double dLat = ToRad(lat2 - lat1);
// //             double dLon = ToRad(lon2 - lon1);

// //             double aa =
// //                 Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
// //                 Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) *
// //                 Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

// //             double c = 2 * Math.Atan2(Math.Sqrt(aa), Math.Sqrt(1 - aa));
// //             return R * c;
// //         }

// //         private static double ToRad(double deg) => deg * (Math.PI / 180.0);

// //         // Minimal typed result wrapper
// //         private sealed class OsrmTableResult
// //         {
// //             public double?[][] Durations { get; init; } = default!;
// //             public double?[][] Distances { get; init; } = default!;

// //             public static OsrmTableResult FromJson(JsonElement root)
// //             {
// //                 double?[][] ReadMatrix(string name)
// //                 {
// //                     var arr = root.GetProperty(name);
// //                     var outer = new double?[arr.GetArrayLength()][];

// //                     for (int i = 0; i < outer.Length; i++)
// //                     {
// //                         var row = arr[i];
// //                         var inner = new double?[row.GetArrayLength()];
// //                         for (int j = 0; j < inner.Length; j++)
// //                         {
// //                             inner[j] = row[j].ValueKind == JsonValueKind.Null ? null : row[j].GetDouble();
// //                         }
// //                         outer[i] = inner;
// //                     }
// //                     return outer;
// //                 }

// //                 return new OsrmTableResult
// //                 {
// //                     Durations = ReadMatrix("durations"),
// //                     Distances = ReadMatrix("distances")
// //                 };
// //             }
// //         }
// //     }
// // }

// using Microsoft.AspNetCore.Mvc;
// using Microsoft.Extensions.Caching.Memory;
// using System.Globalization;
// using System.Text.Json;

// namespace YourNamespace.Controllers
// {
//     [ApiController]
//     [Route("api/route")]
//     public class RouteController : ControllerBase
//     {
//         private const int MaxStops = 25;

//         private const double MinLat = 8.0, MaxLat = 13.6;
//         private const double MinLng = 76.0, MaxLng = 80.4;

//         private static readonly Uri OsrmBase = new("http://router.project-osrm.org/");
//         private readonly IHttpClientFactory _httpClientFactory;
//         private readonly IMemoryCache _cache;

//         private static readonly SemaphoreSlim _osrmGate = new(8, 8);

//         public RouteController(IHttpClientFactory httpClientFactory, IMemoryCache cache)
//         {
//             _httpClientFactory = httpClientFactory;
//             _cache = cache;
//         }

//         // ---------- ENDPOINT ----------
//         [HttpPost("optimize")]
//         public async Task<IActionResult> Optimize([FromBody] OptimizeRouteRequest req)
//         {
//             if (req.stops == null || req.stops.Count < 2)
//                 return BadRequest("At least 2 stops required.");

//             if (req.stops.Count > MaxStops)
//                 return BadRequest($"Max {MaxStops} stops allowed.");

//             foreach (var s in req.stops)
//             {
//                 if (!IsInTN(s.lat, s.lng))
//                     return BadRequest("All coordinates must be inside Tamil Nadu.");
//             }

//             var start = req.driverLocation != null && IsInTN(req.driverLocation.lat, req.driverLocation.lng)
//                 ? req.driverLocation
//                 : req.stops[0];

//             var points = new List<StopDto> { start };
//             points.AddRange(req.stops);

//             var cacheKey = "osrm:table:" + string.Join("|", points.Select(p =>
//                 $"{Math.Round(p.lng, 5).ToString(CultureInfo.InvariantCulture)}," +
//                 $"{Math.Round(p.lat, 5).ToString(CultureInfo.InvariantCulture)}"));

//             if (!_cache.TryGetValue(cacheKey, out OsrmTableResult table))
//             {
//                 table = await CallOsrmTable(points);
//                 _cache.Set(cacheKey, table, TimeSpan.FromMinutes(10));
//             }

//             var orderedStops = req.optimizationMode switch
//             {
//                 "PriorityFirst" => OptimizePriorityFirst(start, req.stops, table),
//                 "TimeWindow"    => OptimizeTimeWindow(req.stops),
//                 "AvoidIssues"   => OptimizeAvoidIssues(req.stops, req.roadIssues ?? []),
//                 _               => OptimizeBalanced(start, req.stops, table, req.roadIssues ?? [])
//             };

//             var routePoints = new List<StopDto> { start };
//             routePoints.AddRange(orderedStops);

//             var routeJson = await CallOsrmRouteRaw(routePoints);
//             return Content(routeJson, "application/json");
//         }

//         // ---------- OPTIMIZATION MODES ----------

//         private static List<StopDto> OptimizeBalanced(
//             StopDto start,
//             List<StopDto> stops,
//             OsrmTableResult table,
//             List<RoadIssueDto> issues)
//         {
//             return stops
//                 .OrderBy(s => table.Durations[0][stops.IndexOf(s) + 1] ?? double.MaxValue)
//                 .ThenByDescending(s => s.priority)
//                 .ToList();
//         }

//         private static List<StopDto> OptimizePriorityFirst(
//             StopDto start,
//             List<StopDto> stops,
//             OsrmTableResult table)
//         {
//             return stops
//                 .OrderByDescending(s => s.priority)
//                 .ThenBy(s => table.Durations[0][stops.IndexOf(s) + 1] ?? double.MaxValue)
//                 .ToList();
//         }

//         private static List<StopDto> OptimizeTimeWindow(List<StopDto> stops)
//         {
//             return stops
//                 .OrderBy(s => s.windowStart ?? DateTime.MaxValue)
//                 .ThenByDescending(s => s.priority)
//                 .ToList();
//         }

//         private static List<StopDto> OptimizeAvoidIssues(
//             List<StopDto> stops,
//             List<RoadIssueDto> issues)
//         {
//             return stops
//                 .OrderBy(s => IssueRiskScore(s, issues))
//                 .ThenByDescending(s => s.priority)
//                 .ToList();
//         }

//         // ---------- HELPERS ----------

//         private static bool IsInTN(double lat, double lng) =>
//             lat >= MinLat && lat <= MaxLat && lng >= MinLng && lng <= MaxLng;

//         private static double IssueRiskScore(StopDto stop, List<RoadIssueDto> issues)
//         {
//             double score = 0;
//             foreach (var i in issues)
//             {
//                 var d = Haversine(stop.lat, stop.lng, i.latitude, i.longitude);
//                 if (d < 1.5 && i.severity == "Critical") score += 2;
//                 if (d < 1.0 && i.severity == "High") score += 1;
//             }
//             return score;
//         }

//         private static double Haversine(double lat1, double lon1, double lat2, double lon2)
//         {
//             const double R = 6371;
//             var dLat = (lat2 - lat1) * Math.PI / 180;
//             var dLon = (lon2 - lon1) * Math.PI / 180;
//             var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
//                     Math.Cos(lat1 * Math.PI / 180) *
//                     Math.Cos(lat2 * Math.PI / 180) *
//                     Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
//             return 2 * R * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
//         }

//         // ---------- OSRM ----------

//         private async Task<OsrmTableResult> CallOsrmTable(List<StopDto> pts)
//         {
//             var coords = string.Join(";", pts.Select(p =>
//                 $"{p.lng.ToString(CultureInfo.InvariantCulture)}," +
//                 $"{p.lat.ToString(CultureInfo.InvariantCulture)}"));

//             var url = new Uri(OsrmBase, $"table/v1/driving/{coords}?annotations=duration");
//             var client = _httpClientFactory.CreateClient();

//             await _osrmGate.WaitAsync();
//             try
//             {
//                 var res = await client.GetStringAsync(url);
//                 var root = JsonDocument.Parse(res).RootElement;
//                 return OsrmTableResult.FromJson(root);
//             }
//             finally { _osrmGate.Release(); }
//         }

//         // private async Task<string> CallOsrmRouteRaw(List<StopDto> pts)
//         // {
//         //     var coords = string.Join(";", pts.Select(p =>
//         //         $"{p.lng.ToString(CultureInfo.InvariantCulture)}," +
//         //         $"{p.lat.ToString(CultureInfo.InvariantCulture)}"));

//         //     var url = new Uri(OsrmBase, $"route/v1/driving/{coords}?overview=full&geometries=geojson");
//         //     var client = _httpClientFactory.CreateClient();

//         //     await _osrmGate.WaitAsync();
//         //     try { return await client.GetStringAsync(url); }
//         //     finally { _osrmGate.Release(); }
//         // }

//         private async Task<string> CallOsrmRouteRaw(List<StopDto> pts)
//         {
//             var coordStr = string.Join(";", pts.Select(p =>
//                 $"{p.lng.ToString(CultureInfo.InvariantCulture)},{p.lat.ToString(CultureInfo.InvariantCulture)}"));

//             var url = new Uri(
//                 OsrmBase,
//                 $"route/v1/driving/{coordStr}?overview=full&geometries=geojson&steps=true"
//             );

//             var client = _httpClientFactory.CreateClient();
//             client.Timeout = TimeSpan.FromSeconds(25);

//             using var req = new HttpRequestMessage(HttpMethod.Get, url);
//             req.Headers.UserAgent.ParseAdd("OnTrack-Navigation/1.0");

//             using var resp = await client.SendAsync(req);
//             var body = await resp.Content.ReadAsStringAsync();

//             if (!resp.IsSuccessStatusCode)
//                 throw new HttpRequestException($"OSRM route failed ({resp.StatusCode})");

//             return body;
//         }


//         private sealed class OsrmTableResult
//         {
//             public double?[][] Durations { get; init; } = default!;
//             public static OsrmTableResult FromJson(JsonElement root)
//             {
//                 var d = root.GetProperty("durations");
//                 var arr = new double?[d.GetArrayLength()][];
//                 for (int i = 0; i < arr.Length; i++)
//                     arr[i] = d[i].EnumerateArray().Select(x => x.GetDouble()).Cast<double?>().ToArray();
//                 return new() { Durations = arr };
//             }
//         }
//     }
// }

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System.Globalization;
using System.Text.Json;

namespace YourNamespace.Controllers
{
    [ApiController]
    [Route("api/route")]
    public class RouteController : ControllerBase
    {
        private const int MaxStops = 25;

        private const double MinLat = 8.0, MaxLat = 13.6;
        private const double MinLng = 76.0, MaxLng = 80.4;

        private static readonly Uri OsrmBase = new("http://router.project-osrm.org/");
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IMemoryCache _cache;

        private static readonly SemaphoreSlim _osrmGate = new(8, 8);

        public RouteController(IHttpClientFactory httpClientFactory, IMemoryCache cache)
        {
            _httpClientFactory = httpClientFactory;
            _cache = cache;
        }

        // ---------- ENDPOINT ----------
        [HttpPost("optimize")]
        public async Task<IActionResult> Optimize([FromBody] OptimizeRouteRequest req)
        {
            if (req.stops == null || req.stops.Count < 2)
                return BadRequest("At least 2 stops required.");

            if (req.stops.Count > MaxStops)
                return BadRequest($"Max {MaxStops} stops allowed.");

            foreach (var s in req.stops)
            {
                if (!IsInTN(s.lat, s.lng))
                    return BadRequest("All coordinates must be inside Tamil Nadu.");
            }

            var start = req.driverLocation != null && IsInTN(req.driverLocation.lat, req.driverLocation.lng)
                ? req.driverLocation
                : req.stops[0];

            // SMART OPTIMIZATION: Prioritize high priority stops, then use nearest neighbor
            var orderedStops = req.optimizationMode switch
            {
                "PriorityFirst" => OptimizeWithPriorityAndDistance(req.stops, start, req.roadIssues ?? []),
                "TimeWindow" => OptimizeTimeWindow(req.stops, start),
                "AvoidIssues" => OptimizeAvoidIssues(req.stops, start, req.roadIssues ?? []),
                "AIOptimized" => OptimizeWithPriorityAndDistance(req.stops, start, req.roadIssues ?? []),
                _ => OptimizeWithPriorityAndDistance(req.stops, start, req.roadIssues ?? []) // Balanced default
            };

            var routePoints = new List<StopDto> { start };
            routePoints.AddRange(orderedStops);

            var routeJson = await CallOsrmRouteRaw(routePoints);
            return Content(routeJson, "application/json");
        }

        // ---------- ADVANCED OPTIMIZATION: PRIORITY FIRST + NEAREST NEIGHBOR ----------

        private List<StopDto> OptimizeWithPriorityAndDistance(
            List<StopDto> stops,
            StopDto start,
            List<RoadIssueDto> issues)
        {
            // Separate high priority and normal priority stops
            var highPriority = stops.Where(s => s.priority >= 4).ToList();
            var normalPriority = stops.Where(s => s.priority < 4).ToList();

            var result = new List<StopDto>();

            // First, handle high priority stops with nearest neighbor
            if (highPriority.Any())
            {
                var orderedHigh = NearestNeighborSort(highPriority, start);
                result.AddRange(orderedHigh);
            }

            // Then handle normal priority stops starting from last high priority stop
            if (normalPriority.Any())
            {
                var currentPos = result.Any() ? result.Last() : start;
                var orderedNormal = NearestNeighborSort(normalPriority, currentPos);
                result.AddRange(orderedNormal);
            }

            return result;
        }

        // ---------- NEAREST NEIGHBOR ALGORITHM ----------
        
        private List<StopDto> NearestNeighborSort(List<StopDto> stops, StopDto startPos)
        {
            if (!stops.Any()) return new List<StopDto>();

            var sorted = new List<StopDto>();
            var remaining = new List<StopDto>(stops);
            var current = startPos;

            while (remaining.Any())
            {
                // Find nearest stop to current position
                var nearest = remaining
                    .OrderBy(s => Haversine(current.lat, current.lng, s.lat, s.lng))
                    .First();

                sorted.Add(nearest);
                remaining.Remove(nearest);
                current = nearest;
            }

            return sorted;
        }

        // ---------- OTHER OPTIMIZATION MODES ----------

        private List<StopDto> OptimizeTimeWindow(List<StopDto> stops, StopDto start)
        {
            var rescheduled = stops.Where(s => s.windowStart.HasValue).ToList();
            var normal = stops.Where(s => !s.windowStart.HasValue).ToList();

            var result = new List<StopDto>();

            // Handle rescheduled stops first
            if (rescheduled.Any())
            {
                var orderedRescheduled = rescheduled
                    .OrderBy(s => s.windowStart)
                    .ThenBy(s => Haversine(start.lat, start.lng, s.lat, s.lng))
                    .ToList();
                result.AddRange(orderedRescheduled);
            }

            // Then handle normal stops
            if (normal.Any())
            {
                var currentPos = result.Any() ? result.Last() : start;
                var orderedNormal = NearestNeighborSort(normal, currentPos);
                result.AddRange(orderedNormal);
            }

            return result;
        }

        private List<StopDto> OptimizeAvoidIssues(
            List<StopDto> stops,
            StopDto start,
            List<RoadIssueDto> issues)
        {
            // Sort stops by issue risk (least risky first), then apply nearest neighbor
            var sortedByRisk = stops
                .OrderBy(s => IssueRiskScore(s, issues))
                .ThenByDescending(s => s.priority)
                .ToList();

            return NearestNeighborSort(sortedByRisk, start);
        }

        // ---------- HELPERS ----------

        private static bool IsInTN(double lat, double lng) =>
            lat >= MinLat && lat <= MaxLat && lng >= MinLng && lng <= MaxLng;

        private static double IssueRiskScore(StopDto stop, List<RoadIssueDto> issues)
        {
            double score = 0;
            foreach (var i in issues)
            {
                var d = Haversine(stop.lat, stop.lng, i.latitude, i.longitude);
                if (d < 5.0) // Within 5km danger zone
                {
                    score += i.severity switch
                    {
                        "Critical" => 10,
                        "High" => 5,
                        "Medium" => 2,
                        _ => 1
                    };
                }
            }
            return score;
        }

        private static double Haversine(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371; // Earth radius in km
            var dLat = (lat2 - lat1) * Math.PI / 180;
            var dLon = (lon2 - lon1) * Math.PI / 180;
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(lat1 * Math.PI / 180) *
                    Math.Cos(lat2 * Math.PI / 180) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            return 2 * R * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        }

        // ---------- OSRM ----------

        private async Task<OsrmTableResult> CallOsrmTable(List<StopDto> pts)
        {
            var coords = string.Join(";", pts.Select(p =>
                $"{p.lng.ToString(CultureInfo.InvariantCulture)}," +
                $"{p.lat.ToString(CultureInfo.InvariantCulture)}"));

            var url = new Uri(OsrmBase, $"table/v1/driving/{coords}?annotations=duration");
            var client = _httpClientFactory.CreateClient();

            await _osrmGate.WaitAsync();
            try
            {
                var res = await client.GetStringAsync(url);
                var root = JsonDocument.Parse(res).RootElement;
                return OsrmTableResult.FromJson(root);
            }
            finally { _osrmGate.Release(); }
        }

        private async Task<string> CallOsrmRouteRaw(List<StopDto> pts)
        {
            var coordStr = string.Join(";", pts.Select(p =>
                $"{p.lng.ToString(CultureInfo.InvariantCulture)},{p.lat.ToString(CultureInfo.InvariantCulture)}"));

            var url = new Uri(
                OsrmBase,
                $"route/v1/driving/{coordStr}?overview=full&geometries=geojson&steps=true"
            );

            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(25);

            using var req = new HttpRequestMessage(HttpMethod.Get, url);
            req.Headers.UserAgent.ParseAdd("OnTrack-Navigation/1.0");

            using var resp = await client.SendAsync(req);
            var body = await resp.Content.ReadAsStringAsync();

            if (!resp.IsSuccessStatusCode)
                throw new HttpRequestException($"OSRM route failed ({resp.StatusCode})");

            return body;
        }

        private sealed class OsrmTableResult
        {
            public double?[][] Durations { get; init; } = default!;
            public static OsrmTableResult FromJson(JsonElement root)
            {
                var d = root.GetProperty("durations");
                var arr = new double?[d.GetArrayLength()][];
                for (int i = 0; i < arr.Length; i++)
                    arr[i] = d[i].EnumerateArray().Select(x => x.GetDouble()).Cast<double?>().ToArray();
                return new() { Durations = arr };
            }
        }
    }
}