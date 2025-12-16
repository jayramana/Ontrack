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

        public async Task<object> GenerateRouteForDriver(int driverId)
        {
            var orders = await _context.Orders
                .Where(o => o.DriverId == driverId &&
                    o.Status != "Delivered" &&
                    o.Status != "Cancelled")
                .ToListAsync();

            // Filter valid coordinates
            orders = orders.Where(HasValidCoordinates).ToList();

            // 🔥 SORT BY AI PRIORITY FIRST, THEN FALLBACK TO STANDARD PRIORITY
            orders = orders
                .OrderByDescending(o => o.AiPriority ?? o.Priority)
                .ThenBy(o => o.EstimatedDeliveryDate)
                .ToList();

            var routeStops = orders.Select((order, index) => new
            {
                sequence = index + 1,
                orderId = order.Id,
                trackingId = order.TrackingId,
                receiverName = order.ReceiverName,
                receiverAddress = order.ReceiverAddress,
                pickupLat = order.PickupLatitude,
                pickupLng = order.PickupLongitude,
                deliveryLat = order.DeliveryLatitude,
                deliveryLng = order.DeliveryLongitude,
                priority = order.Priority,
                aiPriority = order.AiPriority,
                aiJustification = order.AiPriorityJustification,
                estimatedDelivery = order.EstimatedDeliveryDate,
                etaMinutes = (index + 1) * 20, // Dummy ETA
                rescheduledAt = order.RescheduledAt,
                rescheduleReason = order.RescheduleReason
            });

            return new
            {
                driverId = driverId,
                updatedAt = DateTime.UtcNow,
                totalStops = routeStops.Count(),
                stops = routeStops
            };
        }

        // OPTIMIZE ROUTE AFTER RESCHEDULE OR ROAD ISSUE
        public async Task OptimizeRouteAfterReschedule(int driverId)
        {
            await RecalculateDriverRouteAsync(driverId);
        }

        // 🆕 FEATURE 2: RECALCULATE ROUTE AVOIDING ROAD ISSUES
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

            // Get active road issues
            var activeIssues = await _context.RoadIssues
                .Where(r => r.Status == "Active")
                .ToListAsync();

            double currentLat = driver.CurrentLatitude ?? orders.First().DeliveryLatitude;
            double currentLng = driver.CurrentLongitude ?? orders.First().DeliveryLongitude;

            // Filter out orders near road issues (within danger radius)
            var safeOrders = orders.Where(order =>
            {
                foreach (var issue in activeIssues)
                {
                    double distance = CalculateDistance(
                        issue.Latitude, issue.Longitude,
                        order.DeliveryLatitude, order.DeliveryLongitude
                    );

                    // Danger radius based on severity
                    double dangerRadius = issue.Severity switch
                    {
                        "Critical" => 5.0, // 5km
                        "High" => 3.0,     // 3km
                        "Medium" => 2.0,   // 2km
                        _ => 1.0           // 1km
                    };

                    if (distance <= dangerRadius)
                        return false; // Skip this order
                }
                return true;
            }).ToList();

            // Sort by AI Priority, then by delivery date, then by distance
            var optimizedOrders = safeOrders
                .OrderByDescending(o => o.AiPriority ?? o.Priority)
                .ThenBy(o => o.EstimatedDeliveryDate)
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

        public bool HasValidCoordinates(Order o)
        {
            return 
                o.DeliveryLatitude != 0 &&
                o.DeliveryLongitude != 0 &&
                !double.IsNaN(o.DeliveryLatitude) &&
                !double.IsNaN(o.DeliveryLongitude);
        }

        private double DegreesToRadians(double degrees)
        {
            return degrees * Math.PI / 180.0;
        }
    }
}