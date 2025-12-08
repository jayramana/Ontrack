// using Backend.Domain.Entity;
// using Backend.Data;
// using Microsoft.EntityFrameworkCore;

// namespace Backend.Services
// {
//     public class RouteOptimizationService
//     {
//         private readonly AppDbContext _context;

//         public RouteOptimizationService(AppDbContext context)
//         {
//             _context = context;
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

//             // 2. Convert orders to stops (Pickup and Delivery)
//             var stops = new List<RouteStop>();
//             foreach (var order in orders)
//             {
//                 // Pickup Stop
//                 stops.Add(new RouteStop
//                 {
//                     DriverId = driverId,
//                     OrderId = order.Id,
//                     Latitude = order.PickupLatitude,
//                     Longitude = order.PickupLongitude,
//                     Status = "Pending",
//                     SequenceNumber = 0 // To be determined
//                 });

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

//             // 3. Run VRP / TSP Algorithm (Simplified Nearest Neighbor for now)
//             // Start from driver's current location or warehouse
//             double currentLat = driver.CurrentLatitude ?? 13.0827; // Default to Chennai
//             double currentLng = driver.CurrentLongitude ?? 80.2707;

//             var unvisited = stops.ToList();
//             var orderedStops = new List<RouteStop>();
//             int sequence = 1;

//             while (unvisited.Any())
//             {
//                 var nearest = unvisited
//                     .OrderBy(s => GetDistance(currentLat, currentLng, s.Latitude, s.Longitude))
//                     .First();

//                 nearest.SequenceNumber = sequence++;
//                 // Estimate arrival (dummy calculation: 2 mins per km)
//                 double dist = GetDistance(currentLat, currentLng, nearest.Latitude, nearest.Longitude);
//                 nearest.EstimatedArrival = DateTime.UtcNow.AddMinutes(dist * 2);

//                 orderedStops.Add(nearest);
//                 unvisited.Remove(nearest);

//                 currentLat = nearest.Latitude;
//                 currentLng = nearest.Longitude;
//             }

//             // 4. Save to DB
//             _context.RouteStops.RemoveRange(_context.RouteStops.Where(rs => rs.DriverId == driverId));
//             await _context.RouteStops.AddRangeAsync(orderedStops);
//             await _context.SaveChangesAsync();
//         }

//         private double GetDistance(double lat1, double lon1, double lat2, double lon2)
//         {
//             // Haversine formula
//             var R = 6371; // Radius of the earth in km
//             var dLat = Deg2Rad(lat2 - lat1);
//             var dLon = Deg2Rad(lon2 - lon1); 
//             var a = 
//                 Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
//                 Math.Cos(Deg2Rad(lat1)) * Math.Cos(Deg2Rad(lat2)) * 
//                 Math.Sin(dLon / 2) * Math.Sin(dLon / 2); 
//             var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a)); 
//             var d = R * c; // Distance in km
//             return d;
//         }

//         private double Deg2Rad(double deg)
//         {
//             return deg * (Math.PI / 180);
//         }
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

            // 2. Convert orders to stops (only delivery stops for now)
            var stops = new List<RouteStop>();
            foreach (var order in orders)
            {
                // Delivery Stop
                stops.Add(new RouteStop
                {
                    DriverId = driverId,
                    OrderId = order.Id,
                    Latitude = order.DeliveryLatitude,
                    Longitude = order.DeliveryLongitude,
                    Status = "Pending",
                    SequenceNumber = 0 // To be determined
                });
            }

            // 3. Start from driver's current location (fallback Chennai)
            double currentLat = driver.CurrentLatitude ?? 13.0827;
            double currentLng = driver.CurrentLongitude ?? 80.2707;

            var unvisited = stops.ToList();
            var orderedStops = new List<RouteStop>();
            int sequence = 1;
            DateTime currentEta = DateTime.UtcNow;

            while (unvisited.Any())
            {
                RouteStop? nearest = null;
                double bestDistance = double.MaxValue;
                double bestDuration = 0;

                foreach (var s in unvisited)
                {
                    // Try ORS first
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
                        // Fallback to Haversine
                        distanceKm = GetDistance(currentLat, currentLng, s.Latitude, s.Longitude);
                        // Assume 40km/h
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
