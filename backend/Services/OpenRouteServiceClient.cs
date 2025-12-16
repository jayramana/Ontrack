using System.Net.Http.Json;
using System.Text.Json;

namespace Backend.Services
{
    public class OpenRouteServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public OpenRouteServiceClient(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _httpClient.BaseAddress = new Uri("https://api.openrouteservice.org/");
            _apiKey = config["OpenRouteService:ApiKey"];
        }

        public async Task<(double distanceKm, double durationSec)?> GetDistanceAndDurationAsync(
            double fromLat, double fromLng, double toLat, double toLng)
        {
            var body = new
            {
                coordinates = new[]
                {
                    new[] { fromLng, fromLat },
                    new[] { toLng, toLat }
                }
            };

            var request = new HttpRequestMessage(
                HttpMethod.Post,
                "v2/directions/driving-car"
            );

            request.Headers.Add("Authorization", _apiKey);
            request.Content = JsonContent.Create(body);

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
                return null;

            using var stream = await response.Content.ReadAsStreamAsync();
            var json = await JsonDocument.ParseAsync(stream);

            var summary = json.RootElement
                .GetProperty("features")[0]
                .GetProperty("properties")
                .GetProperty("summary");

            var distanceMeters = summary.GetProperty("distance").GetDouble();
            var durationSec = summary.GetProperty("duration").GetDouble();

            return (distanceMeters / 1000.0, durationSec);
        }
    }
}
