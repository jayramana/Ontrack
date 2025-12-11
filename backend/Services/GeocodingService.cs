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

        // MAIN GEOCODER (Address + Pincode)
        public async Task<(double Latitude, double Longitude)?> GetCoordinatesAsync(string address, string? pincode = null)
        {
            try
            {
                string fullQuery = string.IsNullOrWhiteSpace(pincode) 
                    ? $"{address}, India"
                    : $"{address}, {pincode}, India";

                var url = $"https://nominatim.openstreetmap.org/search?format=json&q={Uri.EscapeDataString(fullQuery)}&limit=1&countrycodes=in";

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
                Console.WriteLine($"[Geocoding ERROR] {ex.Message}");
            }

            return null;
        }

        // PINCODE ONLY
        public async Task<(double Latitude, double Longitude)?> GetCoordinatesFromPincodeAsync(string pincode)
        {
            try
            {
                var url = $"https://nominatim.openstreetmap.org/search?format=json&q={pincode},India&limit=1&countrycodes=in";

                var response = await _httpClient.GetFromJsonAsync<List<NominatimResult>>(url);

                if (response != null && response.Any())
                {
                    var result = response.First();

                    if (double.TryParse(result.lat, out double lat) &&
                        double.TryParse(result.lon, out double lon))
                    {
                        return (lat, lon);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Pincode Geocoding ERROR] {ex.Message}");
            }

            return null;
        }

        // Backend/Services/GeocodingService.cs additions

        public async Task<string?> GetPincodeFromAddressAsync(string address)
        {
            try
            {
                var url = $"https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q={Uri.EscapeDataString(address)}&limit=1&countrycodes=in";
                var response = await _httpClient.GetFromJsonAsync<List<NominatimResult>>(url);
                var result = response?.FirstOrDefault();
                if (result?.address != null)
                {
                    // Nominatim might include postcode field
                    var postcode = result.address.postcode;
                    if (!string.IsNullOrWhiteSpace(postcode)) return postcode;
                }
            }
            catch
            {
                // ignore
            }
            return null;
        }

        // Extend NominatimResult class to include address object:
        private class NominatimResult
        {
            public string lat { get; set; }
            public string lon { get; set; }
            public NominatimAddress address { get; set; }
        }

        private class NominatimAddress
        {
            public string? postcode { get; set; }
            // other fields if needed
        }


        
    }
}

