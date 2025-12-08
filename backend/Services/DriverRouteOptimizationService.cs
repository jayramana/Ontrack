// using Backend.Data;
// using Backend.Domain.Entity;
// using Microsoft.EntityFrameworkCore;

// namespace Backend.Services
// {
//     public class DriverRouteOptimizationService
//     {
//         private readonly AppDbContext _context;

//         public DriverRouteOptimizationService(AppDbContext context)
//         {
//             _context = context;
//         }

//         /// <summary>
//         /// Get optimized route for driver based on priority and distance
//         /// Priority 1 (High) comes first, then Priority 2 (Normal), then Priority 3 (Rescheduled)
//         /// Within same priority, sort by nearest location
//         /// </summary>
//         public async Task<List<Order>> GetOptimizedRouteForDriver(int driverId)
//         {
//             var driver = await _context.Users.FindAsync(driverId);
//             if (driver == null)
//                 return new List<Order>();

//             // Get all assigned orders for today that are not delivered
//             var orders = await _context.Orders
//                 .Where(o => o.DriverId == driverId)
//                 .Where(o => o.Status != "Delivered" && o.Status != "Cancelled")
//                 .Include(o => o.OriginWarehouse)
//                 .Include(o => o.DestinationWarehouse)
//                 .Include(o => o.CurrentWarehouse)
//                 .ToListAsync();

//             if (!orders.Any())
//                 return orders;

//             // Get driver's current location (or use first order's location as start)
//             double currentLat = driver.CurrentLatitude ?? orders.First().DeliveryLatitude;
//             double currentLng = driver.CurrentLongitude ?? orders.First().DeliveryLongitude;

//             // Sort by Priority first (1, 2, 3), then by distance
//             var optimizedOrders = orders
//                 .OrderBy(o => o.Priority)  // 1=High, 2=Normal, 3=Low/Rescheduled
//                 .ThenBy(o => CalculateDistance(currentLat, currentLng, o.DeliveryLatitude, o.DeliveryLongitude))
//                 .ToList();

//             return optimizedOrders;
//         }

//         /// <summary>
//         /// Recalculate route when order is rescheduled or priority changes
//         /// </summary>
//         public async Task RecalculateDriverRouteAsync(int driverId)
//         {
//             // This could trigger a SignalR notification to driver
//             var optimizedRoute = await GetOptimizedRouteForDriver(driverId);
//             // Future: Send notification to driver about route update
//             return;
//         }

//         private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
//         {
//             const double R = 6371; // Earth radius in km

//             var dLat = DegreesToRadians(lat2 - lat1);
//             var dLon = DegreesToRadians(lon2 - lon1);

//             var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
//                     Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2)) *
//                     Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

//             var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
//             return R * c;
//         }

//         private double DegreesToRadians(double degrees)
//         {
//             return degrees * Math.PI / 180.0;
//         }
//     }
// }

using Backend.Data;
using Backend.Domain.Entity;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class DriverRouteOptimizationService
    {
        private readonly AppDbContext _context;

        public DriverRouteOptimizationService(AppDbContext context)
        {
            _context = context;
        }

        // ---------------------------------------------
        // STEP C METHOD (Required for route updates)
        // ---------------------------------------------
        public async Task<object> GenerateRouteForDriver(int driverId)
        {
            var orders = await _context.Orders
                .Where(o => o.DriverId == driverId &&
                           (o.Status == "Assigned" || o.Status == "OutForDelivery" || o.Status == "InTransit"))
                .OrderBy(o => o.Priority)
                .ToListAsync();

            var routeStops = orders.Select((order, index) => new
            {
                sequence = index + 1,
                orderId = order.Id,
                pickupLat = order.PickupLatitude,
                pickupLng = order.PickupLongitude,
                deliveryLat = order.DeliveryLatitude,
                deliveryLng = order.DeliveryLongitude,
                etaMinutes = (index + 1) * 20 // Dummy ETA
            });

            return new
            {
                driverId = driverId,
                updatedAt = DateTime.UtcNow,
                stops = routeStops
            };
        }


        // ---------------------------------------------
        // Your existing optimized route logic
        // ---------------------------------------------
        public async Task<List<Order>> GetOptimizedRouteForDriver(int driverId)
        {
            var driver = await _context.Users.FindAsync(driverId);
            if (driver == null)
                return new List<Order>();

            var orders = await _context.Orders
                .Where(o => o.DriverId == driverId)
                .Where(o => o.Status != "Delivered" && o.Status != "Cancelled")
                .Include(o => o.OriginWarehouse)
                .Include(o => o.DestinationWarehouse)
                .Include(o => o.CurrentWarehouse)
                .ToListAsync();

            if (!orders.Any())
                return orders;

            double currentLat = driver.CurrentLatitude ?? orders.First().DeliveryLatitude;
            double currentLng = driver.CurrentLongitude ?? orders.First().DeliveryLongitude;

            var optimizedOrders = orders
                .OrderBy(o => o.Priority)
                .ThenBy(o => CalculateDistance(currentLat, currentLng, o.DeliveryLatitude, o.DeliveryLongitude))
                .ToList();

            return optimizedOrders;
        }

        public async Task RecalculateDriverRouteAsync(int driverId)
        {
            await GetOptimizedRouteForDriver(driverId);
        }

        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371;

            var dLat = DegreesToRadians(lat2 - lat1);
            var dLon = DegreesToRadians(lon2 - lon1);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return R * c;
        }

        private double DegreesToRadians(double degrees)
        {
            return degrees * Math.PI / 180.0;
        }
    }
}
