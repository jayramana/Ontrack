
// using Backend.Domain.Entity;
// using Backend.Data;
// using Microsoft.EntityFrameworkCore;

// namespace Backend.Services
// {
//     public class RouteOptimizationService
//     {
//         private readonly AppDbContext _context;
//         private readonly OpenRouteServiceClient _ors;

//         public RouteOptimizationService(AppDbContext context, OpenRouteServiceClient ors)
//         {
//             _context = context;
//             _ors = ors;
//         }

//         public async Task OptimizeRouteForDriver(int driverId)
//         {
//             // 1. Fetch driver and assigned orders
//             var driver = await _context.Users.FindAsync(driverId);
//             if (driver == null) return;

//             var orders = await _context.Orders
//                 .Where(o => o.DriverId == driverId && o.Status == "Assigned")
//                 .ToListAsync();

//             if (!orders.Any()) return;

//             // 2. Convert orders to stops (only delivery stops for now)
//             var stops = new List<RouteStop>();
//             foreach (var order in orders)
//             {
//                 // Delivery Stop
//                 stops.Add(new RouteStop
//                 {
//                     DriverId = driverId,
//                     OrderId = order.Id,
//                     Latitude = order.DeliveryLatitude,
//                     Longitude = order.DeliveryLongitude,
//                     Status = "Pending",
//                     SequenceNumber = 0 // To be determined
//                 });
//             }

//             // 3. Start from driver's current location (fallback Chennai)
//             double currentLat = driver.CurrentLatitude ?? 13.0827;
//             double currentLng = driver.CurrentLongitude ?? 80.2707;

//             var unvisited = stops.ToList();
//             var orderedStops = new List<RouteStop>();
//             int sequence = 1;
//             DateTime currentEta = DateTime.UtcNow;

//             while (unvisited.Any())
//             {
//                 RouteStop? nearest = null;
//                 double bestDistance = double.MaxValue;
//                 double bestDuration = 0;

//                 foreach (var s in unvisited)
//                 {
//                     // Try ORS first
//                     var orsResult = await _ors.GetDistanceAndDurationAsync(
//                         currentLat, currentLng, s.Latitude, s.Longitude);

//                     double distanceKm;
//                     double durationSec;

//                     if (orsResult.HasValue)
//                     {
//                         distanceKm = orsResult.Value.distanceKm;
//                         durationSec = orsResult.Value.durationSec;
//                     }
//                     else
//                     {
//                         // Fallback to Haversine
//                         distanceKm = GetDistance(currentLat, currentLng, s.Latitude, s.Longitude);
//                         // Assume 40km/h
//                         durationSec = (distanceKm / 40.0) * 3600.0;
//                     }

//                     if (distanceKm < bestDistance)
//                     {
//                         bestDistance = distanceKm;
//                         bestDuration = durationSec;
//                         nearest = s;
//                     }
//                 }

//                 if (nearest == null) break;

//                 nearest.SequenceNumber = sequence++;
//                 currentEta = currentEta.AddSeconds(bestDuration);
//                 nearest.EstimatedArrival = currentEta;

//                 orderedStops.Add(nearest);
//                 unvisited.Remove(nearest);

//                 currentLat = nearest.Latitude;
//                 currentLng = nearest.Longitude;
//             }

//             // 4. Save to DB (replace previous stops for this driver)
//             var existing = _context.RouteStops.Where(rs => rs.DriverId == driverId);
//             _context.RouteStops.RemoveRange(existing);
//             await _context.RouteStops.AddRangeAsync(orderedStops);
//             await _context.SaveChangesAsync();
//         }

//         // Haversine fallback
//         private double GetDistance(double lat1, double lon1, double lat2, double lon2)
//         {
//             var R = 6371.0;
//             var dLat = Deg2Rad(lat2 - lat1);
//             var dLon = Deg2Rad(lon2 - lon1);
//             var a =
//                 Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
//                 Math.Cos(Deg2Rad(lat1)) * Math.Cos(Deg2Rad(lat2)) *
//                 Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
//             var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
//             return R * c;
//         }

//         private double Deg2Rad(double deg) => deg * (Math.PI / 180.0);
//     }
// }


using Backend.Domain.Entity;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class RouteOptimizationService
    {
        private readonly AppDbContext _context;
        private readonly OpenRouteServiceClient _ors;

        public RouteOptimizationService(AppDbContext context, OpenRouteServiceClient ors)
        {
            _context = context;
            _ors = ors;
        }

        public async Task OptimizeRouteForDriver(int driverId)
        {
            // 1. Fetch driver and assigned orders
            var driver = await _context.Users.FindAsync(driverId);
            if (driver == null) return;

            var orders = await _context.Orders
                .Where(o => o.DriverId == driverId && o.Status == "Assigned")
                .ToListAsync();

            if (!orders.Any()) return;

            // ============================================
            // 🆕 ASR PRIORITY OVERRIDE
            // ============================================
            // Separate ASR orders and non-ASR orders
            var asrOrders = orders.Where(o => o.IsASR).ToList();
            var regularOrders = orders.Where(o => !o.IsASR).ToList();

            // ASR orders ALWAYS come first, regardless of distance or other priorities
            var prioritizedOrders = new List<Order>();
            prioritizedOrders.AddRange(asrOrders);
            prioritizedOrders.AddRange(regularOrders);

            // 2. Convert orders to stops
            var stops = new List<RouteStop>();
            foreach (var order in prioritizedOrders)
            {
                // Delivery Stop
                stops.Add(new RouteStop
                {
                    DriverId = driverId,
                    OrderId = order.Id,
                    Latitude = order.DeliveryLatitude,
                    Longitude = order.DeliveryLongitude,
                    Status = "Pending",
                    SequenceNumber = 0, // To be determined
                    // 🆕 Mark ASR stops
                    IsASR = order.IsASR,
                    ASRPriority = order.IsASR ? 1 : (order.AiPriority ?? order.Priority)
                });
            }

            // 3. Start from driver's current location (fallback Chennai)
            double currentLat = driver.CurrentLatitude ?? 13.0827;
            double currentLng = driver.CurrentLongitude ?? 80.2707;

            // ============================================
            // 🆕 ASR-AWARE ROUTING ALGORITHM
            // ============================================
            var unvisited = stops.ToList();
            var orderedStops = new List<RouteStop>();
            int sequence = 1;
            DateTime currentEta = DateTime.UtcNow;

            // PHASE 1: Process all ASR stops first (nearest neighbor among ASR)
            var asrStops = unvisited.Where(s => s.IsASR).ToList();
            
            while (asrStops.Any())
            {
                RouteStop? nearest = null;
                double bestDistance = double.MaxValue;
                double bestDuration = 0;

                foreach (var s in asrStops)
                {
                    var orsResult = await _ors.GetDistanceAndDurationAsync(
                        currentLat, currentLng, s.Latitude, s.Longitude);

                    double distanceKm;
                    double durationSec;

                    if (orsResult.HasValue)
                    {
                        distanceKm = orsResult.Value.distanceKm;
                        durationSec = orsResult.Value.durationSec;
                    }
                    else
                    {
                        distanceKm = GetDistance(currentLat, currentLng, s.Latitude, s.Longitude);
                        durationSec = (distanceKm / 40.0) * 3600.0;
                    }

                    if (distanceKm < bestDistance)
                    {
                        bestDistance = distanceKm;
                        bestDuration = durationSec;
                        nearest = s;
                    }
                }

                if (nearest == null) break;

                nearest.SequenceNumber = sequence++;
                currentEta = currentEta.AddSeconds(bestDuration);
                nearest.EstimatedArrival = currentEta;

                orderedStops.Add(nearest);
                asrStops.Remove(nearest);
                unvisited.Remove(nearest);

                currentLat = nearest.Latitude;
                currentLng = nearest.Longitude;
            }

            // PHASE 2: Process regular orders using weighted nearest neighbor
            while (unvisited.Any())
            {
                RouteStop? nearest = null;
                double bestScore = double.MaxValue;
                double bestDuration = 0;

                foreach (var s in unvisited)
                {
                    var orsResult = await _ors.GetDistanceAndDurationAsync(
                        currentLat, currentLng, s.Latitude, s.Longitude);

                    double distanceKm;
                    double durationSec;

                    if (orsResult.HasValue)
                    {
                        distanceKm = orsResult.Value.distanceKm;
                        durationSec = orsResult.Value.durationSec;
                    }
                    else
                    {
                        distanceKm = GetDistance(currentLat, currentLng, s.Latitude, s.Longitude);
                        durationSec = (distanceKm / 40.0) * 3600.0;
                    }

                    // Weighted scoring: distance / priority
                    var score = distanceKm / (s.ASRPriority > 0 ? s.ASRPriority : 1);

                    if (score < bestScore)
                    {
                        bestScore = score;
                        bestDuration = durationSec;
                        nearest = s;
                    }
                }

                if (nearest == null) break;

                nearest.SequenceNumber = sequence++;
                currentEta = currentEta.AddSeconds(bestDuration);
                nearest.EstimatedArrival = currentEta;

                orderedStops.Add(nearest);
                unvisited.Remove(nearest);

                currentLat = nearest.Latitude;
                currentLng = nearest.Longitude;
            }

            // 4. Save to DB (replace previous stops for this driver)
            var existing = _context.RouteStops.Where(rs => rs.DriverId == driverId);
            _context.RouteStops.RemoveRange(existing);
            await _context.RouteStops.AddRangeAsync(orderedStops);
            await _context.SaveChangesAsync();
        }

        // Haversine fallback
        private double GetDistance(double lat1, double lon1, double lat2, double lon2)
        {
            var R = 6371.0;
            var dLat = Deg2Rad(lat2 - lat1);
            var dLon = Deg2Rad(lon2 - lon1);
            var a =
                Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(Deg2Rad(lat1)) * Math.Cos(Deg2Rad(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private double Deg2Rad(double deg) => deg * (Math.PI / 180.0);
    }

    
}