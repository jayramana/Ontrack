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

        // 🆕 FEATURE 1: AI-BASED PRIORITY CALCULATION
        public async Task<AiPriorityResult> CalculateDeliveryPriority(
            DateTime rescheduleTime,
            double deliveryDistance,
            string? rescheduleReason,
            int currentDriverLoad,
            int orderAgeHours)
        {
            try
            {
                bool isAfter4PM = rescheduleTime.Hour >= 16;
                string trafficCondition = isAfter4PM ? "high" : "low";
                
                bool isUrgent = !string.IsNullOrEmpty(rescheduleReason) && 
                    (rescheduleReason.ToLower().Contains("urgent") || 
                     rescheduleReason.ToLower().Contains("emergency") ||
                     rescheduleReason.ToLower().Contains("asap"));

                string prompt = $@"You are an AI delivery prioritization system. Calculate a delivery priority score (1-5) based on these factors:

INPUTS:
- Reschedule Time: {rescheduleTime:yyyy-MM-dd HH:mm}
- After 4 PM: {isAfter4PM}
- Delivery Distance: {deliveryDistance:F2} km
- Customer Urgency: {(isUrgent ? "HIGH - contains urgent keywords" : "NORMAL")}
- Reschedule Reason: ""{rescheduleReason ?? "not specified"}""
- Driver Current Load: {currentDriverLoad} orders
- Order Age: {orderAgeHours} hours
- Expected Traffic: {trafficCondition}

RULES:
1. Priority 5 (CRITICAL): Urgent requests, very high traffic, long delays
2. Priority 4 (HIGH): After 4 PM rescheduling, high driver load, distant delivery
3. Priority 3 (MEDIUM): Normal conditions, moderate distance
4. Priority 2 (LOW): Early day, close delivery, low driver load
5. Priority 1 (MINIMAL): Can be delayed, no urgency

Respond ONLY with valid JSON (no markdown, no backticks):
{{
  ""aiPriority"": <number 1-5>,
  ""justification"": ""<brief explanation>""
}}";

                var requestBody = new
                {
                    contents = new[]
                    {
                        new { parts = new[] { new { text = prompt } } }
                    }
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(requestBody), 
                    Encoding.UTF8, 
                    "application/json"
                );

                var response = await _httpClient.PostAsync(
                    $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={_apiKey}", 
                    content
                );

                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var parsed = JsonDocument.Parse(json);
                    
                    var textContent = parsed.RootElement
                        .GetProperty("candidates")[0]
                        .GetProperty("content")
                        .GetProperty("parts")[0]
                        .GetProperty("text")
                        .GetString() ?? "";

                    // Clean up response (remove markdown if present)
                    textContent = textContent.Trim()
                        .Replace("```json", "")
                        .Replace("```", "")
                        .Trim();

                    var result = JsonSerializer.Deserialize<AiPriorityResult>(textContent);
                    
                    if (result != null && result.AiPriority >= 1 && result.AiPriority <= 5)
                    {
                        return result;
                    }
                }

                // Fallback to rule-based priority
                return CalculateFallbackPriority(
                    isAfter4PM, 
                    deliveryDistance, 
                    isUrgent, 
                    currentDriverLoad, 
                    orderAgeHours
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Gemini API Error: {ex.Message}");
                return new AiPriorityResult
                {
                    AiPriority = 3,
                    Justification = $"Fallback priority (API error: {ex.Message})"
                };
            }
        }

        private AiPriorityResult CalculateFallbackPriority(
            bool isAfter4PM,
            double distance,
            bool isUrgent,
            int driverLoad,
            int orderAge)
        {
            int priority = 3; // default medium
            var reasons = new List<string>();

            if (isUrgent)
            {
                priority = Math.Min(5, priority + 2);
                reasons.Add("urgent customer request");
            }

            if (isAfter4PM)
            {
                priority = Math.Min(5, priority + 1);
                reasons.Add("high traffic period");
            }

            if (distance > 20)
            {
                priority = Math.Min(5, priority + 1);
                reasons.Add("long distance delivery");
            }

            if (driverLoad > 8)
            {
                priority = Math.Max(1, priority - 1);
                reasons.Add("driver overloaded");
            }

            if (orderAge > 48)
            {
                priority = Math.Min(5, priority + 1);
                reasons.Add("order delayed significantly");
            }

            return new AiPriorityResult
            {
                AiPriority = priority,
                Justification = $"Priority {priority} due to: {string.Join(", ", reasons)}"
            };
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

            var content = new StringContent(
                JsonSerializer.Serialize(requestBody), 
                Encoding.UTF8, 
                "application/json"
            );

            var response = await _httpClient.PostAsync(
                $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={_apiKey}", 
                content
            );

            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                return json;
            }

            return "Error calling Gemini API";
        }
    }

    public class AiPriorityResult
    {
        public int AiPriority { get; set; }
        public string Justification { get; set; } = string.Empty;
    }
}