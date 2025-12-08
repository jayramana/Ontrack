using System.Text;
using System.Text.Json;

namespace Backend.Services
{
    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GeminiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Gemini:ApiKey"] ?? "AIzaSyBDMoBiGEQCBexmMiRxa1oNYsbtcHL8DW8";
        }

        public async Task<string> AnalyzeText(string prompt)
        {
            if (string.IsNullOrEmpty(_apiKey)) return "API Key missing";

            var requestBody = new
            {
                contents = new[]
                {
                    new { parts = new[] { new { text = prompt } } }
                }
            };

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync($"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={_apiKey}", content);

            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                // Parse JSON to extract text (simplified)
                return json; 
            }

            return "Error calling Gemini API";
        }
    }
}
