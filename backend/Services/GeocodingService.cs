using System.Net.Http.Json;

namespace Backend.Services
{
    public class GeocodingService
    {
        private readonly HttpClient _httpClient;

        public GeocodingService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "OntrackLogisticsApp/1.0");
        }

        public async Task<(double Latitude, double Longitude)?> GetCoordinatesAsync(string address)
        {
            try
            {
                var url = $"https://nominatim.openstreetmap.org/search?format=json&q={Uri.EscapeDataString(address)}&limit=1";
                var response = await _httpClient.GetFromJsonAsync<List<NominatimResult>>(url);

                if (response != null && response.Any())
                {
                    var result = response.First();
                    if (double.TryParse(result.lat, out double lat) && double.TryParse(result.lon, out double lon))
                    {
                        return (lat, lon);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Geocoding error: {ex.Message}");
            }

            return null;
        }

        public async Task<(double Latitude, double Longitude)?> GetCoordinatesFromPincodeAsync(string pincode)
        {
            try
            {
                // Query: pincode + India to get accurate results
                var query = $"{pincode}, India";
                var url = $"https://nominatim.openstreetmap.org/search?format=json&q={Uri.EscapeDataString(query)}&limit=1&countrycodes=in";
                var response = await _httpClient.GetFromJsonAsync<List<NominatimResult>>(url);

                if (response != null && response.Any())
                {
                    var result = response.First();
                    if (double.TryParse(result.lat, out double lat) && double.TryParse(result.lon, out double lon))
                    {
                        return (lat, lon);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Pincode geocoding error: {ex.Message}");
            }

            return null;
        }

        private class NominatimResult
        {
            public string lat { get; set; }
            public string lon { get; set; }
        }
    }
}
