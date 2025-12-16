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
        /// Try geocode pincode -> nearest warehouse. Falls back to prefix match and district mapping.
        /// </summary>
        public async Task<Warehouse?> FindNearestWarehouseByPincodeAsync(string? pincode)
        {
            if (string.IsNullOrWhiteSpace(pincode))
                return null;

            pincode = pincode.Trim();

            // Step 1: Try geocoding the pincode
            try
            {
                var coords = await _geocoding_service_safe(pincode);
                if (coords != null)
                {
                    var (lat, lng) = coords.Value;

                    var warehouses = await _context.Warehouses
                        .Where(w => w.Latitude != null && w.Longitude != null)
                        .ToListAsync();

                    if (warehouses.Any())
                    {
                        var nearest = warehouses
                            .Select(w => new
                            {
                                Warehouse = w,
                                Distance = CalculateDistance(lat, lng, w.Latitude!.Value, w.Longitude!.Value)
                            })
                            .OrderBy(x => x.Distance)
                            .FirstOrDefault();

                        if (nearest != null)
                            return nearest.Warehouse;
                    }
                }
            }
            catch
            {
                // swallow and fallback to prefix
            }

            // Step 2: prefix match (first 3 digits)
            if (pincode.Length >= 3)
            {
                var prefix = pincode.Substring(0, 3);
                var prefixMatch = await _context.Warehouses
                    .Where(w => w.Pincode.StartsWith(prefix))
                    .FirstOrDefaultAsync();

                if (prefixMatch != null)
                    return prefixMatch;
            }

            // Step 3: district fallback
            var district = GetDistrictFromPincode(pincode);
            if (!string.IsNullOrEmpty(district))
            {
                var districtWarehouse = await _context.Warehouses
                    .Where(w => EF.Functions.Like(w.City, $"%{district}%"))
                    .FirstOrDefaultAsync();

                if (districtWarehouse != null)
                    return districtWarehouse;
            }

            // Step 4: final fallback -> any warehouse with coordinates
            return await _context.Warehouses
                .Where(w => w.Latitude != null && w.Longitude != null)
                .FirstOrDefaultAsync();
        }

        // Helper wrapper around geocoding service to avoid exceptions bubbling to callers
        private async Task<(double Latitude, double Longitude)?> _geocoding_service_safe(string pincode)
        {
            try
            {
                return await _geocodingService.GetCoordinatesFromPincodeAsync(pincode);
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Centralized method: when an order is created, update origin/destination/current warehouse counters.
        /// Call this after the order entity is created and persisted (transactionally).
        /// </summary>
        public async Task AssignOrderToWarehousesAsync(Order order)
        {
            // origin
            if (order.OriginWarehouseId.HasValue)
            {
                var origin = await _context.Warehouses.FindAsync(order.OriginWarehouseId.Value);
                if (origin != null)
                {
                    origin.OutgoingParcels += 1;    // parcel awaiting pickup
                    origin.CurrentParcels += 1;     // physical parcel present
                }
            }

            // destination
            if (order.DestinationWarehouseId.HasValue)
            {
                var dest = await _context.Warehouses.FindAsync(order.DestinationWarehouseId.Value);
                if (dest != null)
                {
                    dest.ReceivedParcels += 1;      // will be received at destination
                }
            }

            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Map Tamil Nadu pincodes (prefix) to districts — extend as required.
        /// </summary>
        private string? GetDistrictFromPincode(string pincode)
        {
            if (string.IsNullOrWhiteSpace(pincode) || pincode.Length < 3)
                return null;

            var prefix = pincode.Substring(0, 3);

            return prefix switch
            {
                "600" => "Chennai",
                "601" => "Chennai",
                "602" => "Tiruvallur",
                "603" => "Kanchipuram",
                "604" => "Kanchipuram",
                "605" => "Villupuram",
                "606" => "Tiruvannamalai",
                "607" => "Cuddalore",
                "608" => "Thanjavur",
                "609" => "Nagapattinam",
                "610" => "Tiruvarur",
                "611" => "Nagapattinam",
                "612" => "Thanjavur",
                "613" => "Thanjavur",
                "614" => "Tiruvarur",
                "620" => "Trichy",
                "621" => "Perambalur",
                "622" => "Pudukkottai",
                "623" => "Ramanathapuram",
                "624" => "Dindigul",
                "625" => "Madurai",
                "626" => "Virudhunagar",
                "627" => "Tirunelveli",
                "628" => "Tuticorin",
                "629" => "Kanyakumari",
                "630" => "Sivaganga",
                "631" => "Kanchipuram",
                "632" => "Vellore",
                "635" => "Krishnagiri",
                "636" => "Salem",
                "637" => "Namakkal",
                "638" => "Erode",
                "639" => "Karur",
                "641" => "Coimbatore",
                "642" => "Coimbatore",
                "643" => "Nilgiris",
                _ => null
            };
        }

        // ADD THIS BACK – REQUIRED BY WarehouseController
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

        await Task.Delay(1000); // avoid rate limit
    }

    await _context.SaveChangesAsync();
}


        // Haversine formula
        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371; // km
            var dLat = DegreesToRadians(lat2 - lat1);
            var dLon = DegreesToRadians(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private double DegreesToRadians(double degrees) => degrees * Math.PI / 180.0;
    }
}