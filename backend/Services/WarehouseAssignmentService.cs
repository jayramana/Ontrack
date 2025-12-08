using Backend.Data;
using Backend.Domain.Entity;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class WarehouseAssignmentService
    {
        private readonly AppDbContext _context;
        private readonly GeocodingService _geocodingService;

        public WarehouseAssignmentService(AppDbContext context, GeocodingService geocodingService)
        {
            _context = context;
            _geocodingService = geocodingService;
        }

        /// <summary>
        /// Find nearest warehouse based on pincode
        /// </summary>
        public async Task<Warehouse?> FindNearestWarehouseByPincodeAsync(string pincode)
        {
            // Geocode the pincode
            var coords = await _geocodingService.GetCoordinatesFromPincodeAsync(pincode);
            if (coords == null)
            {
                // Fallback: try to find by pincode prefix (first 3 digits indicate region)
                var pincodePrefix = pincode.Length >= 3 ? pincode.Substring(0, 3) : pincode;
                return await _context.Warehouses
                    .Where(w => w.Pincode.StartsWith(pincodePrefix))
                    .FirstOrDefaultAsync();
            }

            var (lat, lng) = coords.Value;

            // Find all warehouses
            var warehouses = await _context.Warehouses
                .Where(w => w.Latitude != null && w.Longitude != null)
                .ToListAsync();

            if (!warehouses.Any())
                return null;

            // Find nearest using Haversine formula
            var nearest = warehouses
                .Select(w => new
                {
                    Warehouse = w,
                    Distance = CalculateDistance(lat, lng, w.Latitude!.Value, w.Longitude!.Value)
                })
                .OrderBy(x => x.Distance)
                .FirstOrDefault();

            return nearest?.Warehouse;
        }

        /// <summary>
        /// Geocode all warehouses that don't have coordinates
        /// </summary>
        public async Task GeocodeWarehousesAsync()
        {
            var warehouses = await _context.Warehouses
                .Where(w => w.Latitude == null || w.Longitude == null)
                .ToListAsync();

            foreach (var warehouse in warehouses)
            {
                var coords = await _geocodingService.GetCoordinatesFromPincodeAsync(warehouse.Pincode);
                if (coords != null)
                {
                    warehouse.Latitude = coords.Value.Latitude;
                    warehouse.Longitude = coords.Value.Longitude;
                }

                // Add delay to respect API rate limits
                await Task.Delay(1000);
            }

            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Haversine formula to calculate distance between two points
        /// </summary>
        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371; // Earth radius in km

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
