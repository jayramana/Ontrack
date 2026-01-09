// // using System.Text;
// // using System.Text.Json;

// // namespace Backend.Services
// // {
// //     public class GeminiService
// //     {
// //         private readonly HttpClient _httpClient;
// //         private readonly string _apiKey;

// //         public GeminiService(HttpClient httpClient, IConfiguration configuration)
// //         {
// //             _httpClient = httpClient;
// //             _apiKey = configuration["Gemini:ApiKey"] ?? "AIzaSyBDMoBiGEQCBexmMiRxa1oNYsbtcHL8DW8";
// //         }

// //         // 🆕 FEATURE 1: AI-BASED PRIORITY CALCULATION
// //         public async Task<AiPriorityResult> CalculateDeliveryPriority(
// //             DateTime rescheduleTime,
// //             double deliveryDistance,
// //             string? rescheduleReason,
// //             int currentDriverLoad,
// //             int orderAgeHours)
// //         {
// //             try
// //             {
// //                 bool isAfter4PM = rescheduleTime.Hour >= 16;
// //                 string trafficCondition = isAfter4PM ? "high" : "low";
                
// //                 bool isUrgent = !string.IsNullOrEmpty(rescheduleReason) && 
// //                     (rescheduleReason.ToLower().Contains("urgent") || 
// //                      rescheduleReason.ToLower().Contains("emergency") ||
// //                      rescheduleReason.ToLower().Contains("asap"));

// //                 string prompt = $@"You are an AI delivery prioritization system. Calculate a delivery priority score (1-5) based on these factors:

// // INPUTS:
// // - Reschedule Time: {rescheduleTime:yyyy-MM-dd HH:mm}
// // - After 4 PM: {isAfter4PM}
// // - Delivery Distance: {deliveryDistance:F2} km
// // - Customer Urgency: {(isUrgent ? "HIGH - contains urgent keywords" : "NORMAL")}
// // - Reschedule Reason: ""{rescheduleReason ?? "not specified"}""
// // - Driver Current Load: {currentDriverLoad} orders
// // - Order Age: {orderAgeHours} hours
// // - Expected Traffic: {trafficCondition}

// // RULES:
// // 1. Priority 5 (CRITICAL): Urgent requests, very high traffic, long delays
// // 2. Priority 4 (HIGH): After 4 PM rescheduling, high driver load, distant delivery
// // 3. Priority 3 (MEDIUM): Normal conditions, moderate distance
// // 4. Priority 2 (LOW): Early day, close delivery, low driver load
// // 5. Priority 1 (MINIMAL): Can be delayed, no urgency

// // Respond ONLY with valid JSON (no markdown, no backticks):
// // {{
// //   ""aiPriority"": <number 1-5>,
// //   ""justification"": ""<brief explanation>""
// // }}";

// //                 var requestBody = new
// //                 {
// //                     contents = new[]
// //                     {
// //                         new { parts = new[] { new { text = prompt } } }
// //                     }
// //                 };

// //                 var content = new StringContent(
// //                     JsonSerializer.Serialize(requestBody), 
// //                     Encoding.UTF8, 
// //                     "application/json"
// //                 );

// //                 var response = await _httpClient.PostAsync(
// //                     $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={_apiKey}", 
// //                     content
// //                 );

// //                 if (response.IsSuccessStatusCode)
// //                 {
// //                     var json = await response.Content.ReadAsStringAsync();
// //                     var parsed = JsonDocument.Parse(json);
                    
// //                     var textContent = parsed.RootElement
// //                         .GetProperty("candidates")[0]
// //                         .GetProperty("content")
// //                         .GetProperty("parts")[0]
// //                         .GetProperty("text")
// //                         .GetString() ?? "";

// //                     // Clean up response (remove markdown if present)
// //                     textContent = textContent.Trim()
// //                         .Replace("```json", "")
// //                         .Replace("```", "")
// //                         .Trim();

// //                     var result = JsonSerializer.Deserialize<AiPriorityResult>(textContent);
                    
// //                     if (result != null && result.AiPriority >= 1 && result.AiPriority <= 5)
// //                     {
// //                         return result;
// //                     }
// //                 }

// //                 // Fallback to rule-based priority
// //                 return CalculateFallbackPriority(
// //                     isAfter4PM, 
// //                     deliveryDistance, 
// //                     isUrgent, 
// //                     currentDriverLoad, 
// //                     orderAgeHours
// //                 );
// //             }
// //             catch (Exception ex)
// //             {
// //                 Console.WriteLine($"Gemini API Error: {ex.Message}");
// //                 return new AiPriorityResult
// //                 {
// //                     AiPriority = 3,
// //                     Justification = $"Fallback priority (API error: {ex.Message})"
// //                 };
// //             }
// //         }

// //         private AiPriorityResult CalculateFallbackPriority(
// //             bool isAfter4PM,
// //             double distance,
// //             bool isUrgent,
// //             int driverLoad,
// //             int orderAge)
// //         {
// //             int priority = 3; // default medium
// //             var reasons = new List<string>();

// //             if (isUrgent)
// //             {
// //                 priority = Math.Min(5, priority + 2);
// //                 reasons.Add("urgent customer request");
// //             }

// //             if (isAfter4PM)
// //             {
// //                 priority = Math.Min(5, priority + 1);
// //                 reasons.Add("high traffic period");
// //             }

// //             if (distance > 20)
// //             {
// //                 priority = Math.Min(5, priority + 1);
// //                 reasons.Add("long distance delivery");
// //             }

// //             if (driverLoad > 8)
// //             {
// //                 priority = Math.Max(1, priority - 1);
// //                 reasons.Add("driver overloaded");
// //             }

// //             if (orderAge > 48)
// //             {
// //                 priority = Math.Min(5, priority + 1);
// //                 reasons.Add("order delayed significantly");
// //             }

// //             return new AiPriorityResult
// //             {
// //                 AiPriority = priority,
// //                 Justification = $"Priority {priority} due to: {string.Join(", ", reasons)}"
// //             };
// //         }

// //         public async Task<string> AnalyzeText(string prompt)
// //         {
// //             if (string.IsNullOrEmpty(_apiKey)) return "API Key missing";

// //             var requestBody = new
// //             {
// //                 contents = new[]
// //                 {
// //                     new { parts = new[] { new { text = prompt } } }
// //                 }
// //             };

// //             var content = new StringContent(
// //                 JsonSerializer.Serialize(requestBody), 
// //                 Encoding.UTF8, 
// //                 "application/json"
// //             );

// //             var response = await _httpClient.PostAsync(
// //                 $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={_apiKey}", 
// //                 content
// //             );

// //             if (response.IsSuccessStatusCode)
// //             {
// //                 var json = await response.Content.ReadAsStringAsync();
// //                 return json;
// //             }

// //             return "Error calling Gemini API";
// //         }
// //     }

// //     public class AiPriorityResult
// //     {
// //         public int AiPriority { get; set; }
// //         public string Justification { get; set; } = string.Empty;
// //     }
// // }

// // using System.Text;
// // using System.Text.Json;
// // using Backend.Services;

// // namespace Backend.Services
// // {
// //     public class GeminiService
// //     {
// //         private readonly HttpClient _httpClient;
// //         private readonly string _apiKey;

// //         public GeminiService(IConfiguration configuration)
// //         {
// //             _httpClient = new HttpClient();
// //             _apiKey = configuration["Gemini:ApiKey"] 
// //                 ?? throw new Exception("Gemini API Key not configured");
// //         }

// //         /// <summary>
// //         /// Existing method for delivery priority calculation
// //         /// </summary>
// //         public async Task<(int AiPriority, string Justification)> CalculateDeliveryPriority(
// //             DateTime scheduledDate,
// //             double distance,
// //             string? rescheduleReason,
// //             int driverLoad,
// //             int orderAgeHours)
// //         {
// //             var prompt = $@"
// // You are an AI logistics priority calculator. Analyze this delivery and assign a priority from 1 (low) to 5 (critical).

// // DELIVERY INFO:
// // - Scheduled Date: {scheduledDate}
// // - Distance: {distance:F2} km
// // - Driver Current Load: {driverLoad} orders
// // - Order Age: {orderAgeHours} hours
// // - Reschedule Reason: {rescheduleReason ?? "N/A"}

// // PRIORITY RULES:
// // 5 = Critical (urgent medical, same-day, VIP)
// // 4 = High (next-day, perishable)
// // 3 = Normal (standard delivery)
// // 2 = Low (flexible timeline)
// // 1 = Rescheduled/Delayed

// // Return ONLY valid JSON:
// // {{
// //   ""priority"": 3,
// //   ""justification"": ""Standard delivery within normal timeframe""
// // }}";

// //             var response = await CallGeminiAsync(prompt);
// //             return ParsePriorityResponse(response);
// //         }

// //         /// <summary>
// //         /// 🆕 NEW: ASR Document Verification using Gemini Vision API
// //         /// </summary>
// //         public async Task<ASRVerificationResult> VerifyASRDocumentsAsync(
// //             List<string> documentUrls,
// //             string customerPhotoUrl,
// //             string signatureUrl,
// //             string expectedName,
// //             string shippingLabelName)
// //         {
// //             var prompt = $@"
// // You are an AI document verification system for Adult Signature Required (ASR) delivery verification.

// // VERIFICATION TASK:
// // Analyze the provided documents and verify:
// // 1. Face on ID card matches customer photo
// // 2. Name on ID matches shipping label name
// // 3. Signature matches customer signature
// // 4. Detect fraud: tampering, mismatched fonts, forged documents

// // PROVIDED DOCUMENTS:
// // - ID Documents (Aadhaar/PAN): {string.Join(", ", documentUrls)}
// // - Customer Photo (taken by driver): {customerPhotoUrl}
// // - Customer Signature: {signatureUrl}

// // EXPECTED INFORMATION:
// // - Name on Shipping Label: {shippingLabelName}
// // - Expected Customer Name: {expectedName}

// // VERIFICATION CRITERIA:
// // ✓ Face Match: Does the face on ID match the customer photo?
// // ✓ Name Match: Does the ID name match the shipping label?
// // ✓ Signature Match: Does the signature look consistent?
// // ✓ Document Authenticity: Any signs of tampering or forgery?

// // Return ONLY valid JSON:
// // {{
// //   ""isVerified"": true,
// //   ""score"": 0.95,
// //   ""reasons"": [
// //     ""Face match: 95% confidence"",
// //     ""Name matches shipping label"",
// //     ""Signature appears authentic"",
// //     ""No tampering detected""
// //   ]
// // }}

// // If verification fails, set isVerified to false and provide detailed reasons.";

// //             var response = await CallGeminiVisionAsync(prompt, documentUrls, customerPhotoUrl, signatureUrl);
// //             return ParseASRResponse(response);
// //         }

// //         // ========================================
// //         // HELPER METHODS
// //         // ========================================

// //         private async Task<string> CallGeminiAsync(string prompt)
// //         {
// //             var requestBody = new
// //             {
// //                 contents = new[]
// //                 {
// //                     new
// //                     {
// //                         parts = new[] { new { text = prompt } }
// //                     }
// //                 }
// //             };

// //             var json = JsonSerializer.Serialize(requestBody);
// //             var content = new StringContent(json, Encoding.UTF8, "application/json");

// //             var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={_apiKey}";
// //             var response = await _httpClient.PostAsync(url, content);
// //             response.EnsureSuccessStatusCode();

// //             var responseText = await response.Content.ReadAsStringAsync();
// //             var jsonResponse = JsonDocument.Parse(responseText);

// //             return jsonResponse.RootElement
// //                 .GetProperty("candidates")[0]
// //                 .GetProperty("content")
// //                 .GetProperty("parts")[0]
// //                 .GetProperty("text")
// //                 .GetString() ?? "";
// //         }

// //         private async Task<string> CallGeminiVisionAsync(
// //             string prompt, 
// //             List<string> documentUrls,
// //             string customerPhotoUrl,
// //             string signatureUrl)
// //         {
// //             // Gemini 2.5 Flash supports multimodal input
// //             var parts = new List<object>
// //             {
// //                 new { text = prompt }
// //             };

// //             // Add document images
// //             foreach (var docUrl in documentUrls)
// //             {
// //                 parts.Add(new
// //                 {
// //                     inlineData = new
// //                     {
// //                         mimeType = "image/jpeg",
// //                         data = await DownloadImageAsBase64(docUrl)
// //                     }
// //                 });
// //             }

// //             // Add customer photo
// //             parts.Add(new
// //             {
// //                 inlineData = new
// //                 {
// //                     mimeType = "image/jpeg",
// //                     data = await DownloadImageAsBase64(customerPhotoUrl)
// //                 }
// //             });

// //             // Add signature
// //             parts.Add(new
// //             {
// //                 inlineData = new
// //                 {
// //                     mimeType = "image/jpeg",
// //                     data = await DownloadImageAsBase64(signatureUrl)
// //                 }
// //             });

// //             var requestBody = new
// //             {
// //                 contents = new[]
// //                 {
// //                     new { parts = parts.ToArray() }
// //                 }
// //             };

// //             var json = JsonSerializer.Serialize(requestBody);
// //             var content = new StringContent(json, Encoding.UTF8, "application/json");

// //             var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={_apiKey}";
// //             var response = await _httpClient.PostAsync(url, content);
// //             response.EnsureSuccessStatusCode();

// //             var responseText = await response.Content.ReadAsStringAsync();
// //             var jsonResponse = JsonDocument.Parse(responseText);

// //             return jsonResponse.RootElement
// //                 .GetProperty("candidates")[0]
// //                 .GetProperty("content")
// //                 .GetProperty("parts")[0]
// //                 .GetProperty("text")
// //                 .GetString() ?? "";
// //         }

// //         private async Task<string> DownloadImageAsBase64(string imageUrl)
// //         {
// //             try
// //             {
// //                 var imageBytes = await _httpClient.GetByteArrayAsync(imageUrl);
// //                 return Convert.ToBase64String(imageBytes);
// //             }
// //             catch
// //             {
// //                 // Return placeholder if image download fails
// //                 return "";
// //             }
// //         }

// //         private (int AiPriority, string Justification) ParsePriorityResponse(string response)
// //         {
// //             try
// //             {
// //                 var cleaned = response.Replace("```json", "").Replace("```", "").Trim();
// //                 var json = JsonDocument.Parse(cleaned);
// //                 var priority = json.RootElement.GetProperty("priority").GetInt32();
// //                 var justification = json.RootElement.GetProperty("justification").GetString() ?? "";
// //                 return (priority, justification);
// //             }
// //             catch
// //             {
// //                 return (3, "AI parsing failed, using default priority");
// //             }
// //         }

// //         private ASRVerificationResult ParseASRResponse(string response)
// //         {
// //             try
// //             {
// //                 var cleaned = response.Replace("```json", "").Replace("```", "").Trim();
// //                 var json = JsonDocument.Parse(cleaned);

// //                 var isVerified = json.RootElement.GetProperty("isVerified").GetBoolean();
// //                 var score = json.RootElement.GetProperty("score").GetDouble();
// //                 var reasons = new List<string>();

// //                 if (json.RootElement.TryGetProperty("reasons", out var reasonsArray))
// //                 {
// //                     foreach (var reason in reasonsArray.EnumerateArray())
// //                     {
// //                         reasons.Add(reason.GetString() ?? "");
// //                     }
// //                 }

// //                 return new ASRVerificationResult
// //                 {
// //                     IsVerified = isVerified,
// //                     Score = score,
// //                     Reasons = reasons
// //                 };
// //             }
// //             catch
// //             {
// //                 return new ASRVerificationResult
// //                 {
// //                     IsVerified = false,
// //                     Score = 0,
// //                     Reasons = new List<string> { "AI verification parsing failed" }
// //                 };
// //             }
// //         }
// //     }
// // }

// using System.Text;
// using System.Text.Json;

// namespace Backend.Services
// {
//     public class GeminiService
//     {
//         private readonly HttpClient _httpClient;
//         private readonly string _apiKey;

//         public GeminiService(HttpClient httpClient, IConfiguration configuration)
//         {
//             _httpClient = httpClient;
//             _apiKey = configuration["Gemini:ApiKey"] 
//                 ?? throw new Exception("Gemini API Key not configured");
//         }

//         /// <summary>
//         /// Existing method for delivery priority calculation
//         /// </summary>
//         public async Task<(int AiPriority, string Justification)> CalculateDeliveryPriority(
//             DateTime scheduledDate,
//             double distance,
//             string? rescheduleReason,
//             int driverLoad,
//             int orderAgeHours)
//         {
//             var prompt = $@"
// You are an AI logistics priority calculator. Analyze this delivery and assign a priority from 1 (low) to 5 (critical).

// DELIVERY INFO:
// - Scheduled Date: {scheduledDate}
// - Distance: {distance:F2} km
// - Driver Current Load: {driverLoad} orders
// - Order Age: {orderAgeHours} hours
// - Reschedule Reason: {rescheduleReason ?? "N/A"}

// PRIORITY RULES:
// 5 = Critical (urgent medical, same-day, VIP)
// 4 = High (next-day, perishable)
// 3 = Normal (standard delivery)
// 2 = Low (flexible timeline)
// 1 = Rescheduled/Delayed

// Return ONLY valid JSON:
// {{
//   ""priority"": 3,
//   ""justification"": ""Standard delivery within normal timeframe""
// }}";

//             var response = await CallGeminiAsync(prompt);
//             return ParsePriorityResponse(response);
//         }

//         /// <summary>
//         /// ASR Document Verification (optional - can be disabled if using Python service)
//         /// </summary>
//         public async Task<ASRVerificationResult> VerifyASRDocumentsAsync(
//             List<string> documentUrls,
//             string customerPhotoUrl,
//             string signatureUrl,
//             string expectedName,
//             string shippingLabelName)
//         {
//             var prompt = $@"
// You are an AI document verification system for Adult Signature Required (ASR) delivery verification.

// VERIFICATION TASK:
// Analyze the provided documents and verify:
// 1. Face on ID card matches customer photo
// 2. Name on ID matches shipping label name
// 3. Signature matches customer signature
// 4. Detect fraud: tampering, mismatched fonts, forged documents

// PROVIDED DOCUMENTS:
// - ID Documents (Aadhaar/PAN): {string.Join(", ", documentUrls)}
// - Customer Photo (taken by driver): {customerPhotoUrl}
// - Customer Signature: {signatureUrl}

// EXPECTED INFORMATION:
// - Name on Shipping Label: {shippingLabelName}
// - Expected Customer Name: {expectedName}

// VERIFICATION CRITERIA:
// ✓ Face Match: Does the face on ID match the customer photo?
// ✓ Name Match: Does the ID name match the shipping label?
// ✓ Signature Match: Does the signature look consistent?
// ✓ Document Authenticity: Any signs of tampering or forgery?

// Return ONLY valid JSON:
// {{
//   ""isVerified"": true,
//   ""score"": 0.95,
//   ""reasons"": [
//     ""Face match: 95% confidence"",
//     ""Name matches shipping label"",
//     ""Signature appears authentic"",
//     ""No tampering detected""
//   ]
// }}

// If verification fails, set isVerified to false and provide detailed reasons.";

//             var response = await CallGeminiVisionAsync(prompt, documentUrls, customerPhotoUrl, signatureUrl);
//             return ParseASRResponse(response);
//         }

//         // ========================================
//         // HELPER METHODS
//         // ========================================

//         private async Task<string> CallGeminiAsync(string prompt)
//         {
//             var requestBody = new
//             {
//                 contents = new[]
//                 {
//                     new
//                     {
//                         parts = new[] { new { text = prompt } }
//                     }
//                 }
//             };

//             var json = JsonSerializer.Serialize(requestBody);
//             var content = new StringContent(json, Encoding.UTF8, "application/json");

//             var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={_apiKey}";
//             var response = await _httpClient.PostAsync(url, content);
//             response.EnsureSuccessStatusCode();

//             var responseText = await response.Content.ReadAsStringAsync();
//             var jsonResponse = JsonDocument.Parse(responseText);

//             return jsonResponse.RootElement
//                 .GetProperty("candidates")[0]
//                 .GetProperty("content")
//                 .GetProperty("parts")[0]
//                 .GetProperty("text")
//                 .GetString() ?? "";
//         }

//         private async Task<string> CallGeminiVisionAsync(
//             string prompt, 
//             List<string> documentUrls,
//             string customerPhotoUrl,
//             string signatureUrl)
//         {
//             // Gemini 2.5 Flash supports multimodal input
//             var parts = new List<object>
//             {
//                 new { text = prompt }
//             };

//             // Add document images
//             foreach (var docUrl in documentUrls)
//             {
//                 parts.Add(new
//                 {
//                     inlineData = new
//                     {
//                         mimeType = "image/jpeg",
//                         data = await DownloadImageAsBase64(docUrl)
//                     }
//                 });
//             }

//             // Add customer photo
//             parts.Add(new
//             {
//                 inlineData = new
//                 {
//                     mimeType = "image/jpeg",
//                     data = await DownloadImageAsBase64(customerPhotoUrl)
//                 }
//             });

//             // Add signature
//             parts.Add(new
//             {
//                 inlineData = new
//                 {
//                     mimeType = "image/jpeg",
//                     data = await DownloadImageAsBase64(signatureUrl)
//                 }
//             });

//             var requestBody = new
//             {
//                 contents = new[]
//                 {
//                     new { parts = parts.ToArray() }
//                 }
//             };

//             var json = JsonSerializer.Serialize(requestBody);
//             var content = new StringContent(json, Encoding.UTF8, "application/json");

//             var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={_apiKey}";
//             var response = await _httpClient.PostAsync(url, content);
//             response.EnsureSuccessStatusCode();

//             var responseText = await response.Content.ReadAsStringAsync();
//             var jsonResponse = JsonDocument.Parse(responseText);

//             return jsonResponse.RootElement
//                 .GetProperty("candidates")[0]
//                 .GetProperty("content")
//                 .GetProperty("parts")[0]
//                 .GetProperty("text")
//                 .GetString() ?? "";
//         }

//         private async Task<string> DownloadImageAsBase64(string imageUrl)
//         {
//             try
//             {
//                 var imageBytes = await _httpClient.GetByteArrayAsync(imageUrl);
//                 return Convert.ToBase64String(imageBytes);
//             }
//             catch
//             {
//                 // Return placeholder if image download fails
//                 return "";
//             }
//         }

//         private (int AiPriority, string Justification) ParsePriorityResponse(string response)
//         {
//             try
//             {
//                 var cleaned = response.Replace("```json", "").Replace("```", "").Trim();
//                 var json = JsonDocument.Parse(cleaned);
//                 var priority = json.RootElement.GetProperty("priority").GetInt32();
//                 var justification = json.RootElement.GetProperty("justification").GetString() ?? "";
//                 return (priority, justification);
//             }
//             catch
//             {
//                 return (3, "AI parsing failed, using default priority");
//             }
//         }

//         private ASRVerificationResult ParseASRResponse(string response)
//         {
//             try
//             {
//                 var cleaned = response.Replace("```json", "").Replace("```", "").Trim();
//                 var json = JsonDocument.Parse(cleaned);

//                 var isVerified = json.RootElement.GetProperty("isVerified").GetBoolean();
//                 var score = json.RootElement.GetProperty("score").GetDouble();
//                 var reasons = new List<string>();

//                 if (json.RootElement.TryGetProperty("reasons", out var reasonsArray))
//                 {
//                     foreach (var reason in reasonsArray.EnumerateArray())
//                     {
//                         reasons.Add(reason.GetString() ?? "");
//                     }
//                 }

//                 return new ASRVerificationResult
//                 {
//                     IsVerified = isVerified,
//                     Score = score,
//                     Reasons = reasons
//                 };
//             }
//             catch
//             {
//                 return new ASRVerificationResult
//                 {
//                     IsVerified = false,
//                     Score = 0,
//                     Reasons = new List<string> { "AI verification parsing failed" }
//                 };
//             }
//         }
//     }

//     public class ASRVerificationResult
//     {
//         public bool IsVerified { get; set; }
//         public double Score { get; set; }
//         public List<string> Reasons { get; set; } = new();
//     }
// }

// using System.Text;
// using System.Text.Json;

// namespace Backend.Services
// {
//     public class GeminiService
//     {
//         private readonly HttpClient _httpClient;
//         private readonly string _apiKey;

//         public GeminiService(HttpClient httpClient, IConfiguration configuration)
//         {
//             _httpClient = httpClient;
//             _apiKey = configuration["Gemini:ApiKey"] ?? "AIzaSyBDMoBiGEQCBexmMiRxa1oNYsbtcHL8DW8";
//         }

//         // 🆕 FEATURE 1: AI-BASED PRIORITY CALCULATION
//         public async Task<AiPriorityResult> CalculateDeliveryPriority(
//             DateTime rescheduleTime,
//             double deliveryDistance,
//             string? rescheduleReason,
//             int currentDriverLoad,
//             int orderAgeHours)
//         {
//             try
//             {
//                 bool isAfter4PM = rescheduleTime.Hour >= 16;
//                 string trafficCondition = isAfter4PM ? "high" : "low";
                
//                 bool isUrgent = !string.IsNullOrEmpty(rescheduleReason) && 
//                     (rescheduleReason.ToLower().Contains("urgent") || 
//                      rescheduleReason.ToLower().Contains("emergency") ||
//                      rescheduleReason.ToLower().Contains("asap"));

//                 string prompt = $@"You are an AI delivery prioritization system. Calculate a delivery priority score (1-5) based on these factors:

// INPUTS:
// - Reschedule Time: {rescheduleTime:yyyy-MM-dd HH:mm}
// - After 4 PM: {isAfter4PM}
// - Delivery Distance: {deliveryDistance:F2} km
// - Customer Urgency: {(isUrgent ? "HIGH - contains urgent keywords" : "NORMAL")}
// - Reschedule Reason: ""{rescheduleReason ?? "not specified"}""
// - Driver Current Load: {currentDriverLoad} orders
// - Order Age: {orderAgeHours} hours
// - Expected Traffic: {trafficCondition}

// RULES:
// 1. Priority 5 (CRITICAL): Urgent requests, very high traffic, long delays
// 2. Priority 4 (HIGH): After 4 PM rescheduling, high driver load, distant delivery
// 3. Priority 3 (MEDIUM): Normal conditions, moderate distance
// 4. Priority 2 (LOW): Early day, close delivery, low driver load
// 5. Priority 1 (MINIMAL): Can be delayed, no urgency

// Respond ONLY with valid JSON (no markdown, no backticks):
// {{
//   ""aiPriority"": <number 1-5>,
//   ""justification"": ""<brief explanation>""
// }}";

//                 var requestBody = new
//                 {
//                     contents = new[]
//                     {
//                         new { parts = new[] { new { text = prompt } } }
//                     }
//                 };

//                 var content = new StringContent(
//                     JsonSerializer.Serialize(requestBody), 
//                     Encoding.UTF8, 
//                     "application/json"
//                 );

//                 var response = await _httpClient.PostAsync(
//                     $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={_apiKey}", 
//                     content
//                 );

//                 if (response.IsSuccessStatusCode)
//                 {
//                     var json = await response.Content.ReadAsStringAsync();
//                     var parsed = JsonDocument.Parse(json);
                    
//                     var textContent = parsed.RootElement
//                         .GetProperty("candidates")[0]
//                         .GetProperty("content")
//                         .GetProperty("parts")[0]
//                         .GetProperty("text")
//                         .GetString() ?? "";

//                     // Clean up response (remove markdown if present)
//                     textContent = textContent.Trim()
//                         .Replace("```json", "")
//                         .Replace("```", "")
//                         .Trim();

//                     var result = JsonSerializer.Deserialize<AiPriorityResult>(textContent);
                    
//                     if (result != null && result.AiPriority >= 1 && result.AiPriority <= 5)
//                     {
//                         return result;
//                     }
//                 }

//                 // Fallback to rule-based priority
//                 return CalculateFallbackPriority(
//                     isAfter4PM, 
//                     deliveryDistance, 
//                     isUrgent, 
//                     currentDriverLoad, 
//                     orderAgeHours
//                 );
//             }
//             catch (Exception ex)
//             {
//                 Console.WriteLine($"Gemini API Error: {ex.Message}");
//                 return new AiPriorityResult
//                 {
//                     AiPriority = 3,
//                     Justification = $"Fallback priority (API error: {ex.Message})"
//                 };
//             }
//         }

//         private AiPriorityResult CalculateFallbackPriority(
//             bool isAfter4PM,
//             double distance,
//             bool isUrgent,
//             int driverLoad,
//             int orderAge)
//         {
//             int priority = 3; // default medium
//             var reasons = new List<string>();

//             if (isUrgent)
//             {
//                 priority = Math.Min(5, priority + 2);
//                 reasons.Add("urgent customer request");
//             }

//             if (isAfter4PM)
//             {
//                 priority = Math.Min(5, priority + 1);
//                 reasons.Add("high traffic period");
//             }

//             if (distance > 20)
//             {
//                 priority = Math.Min(5, priority + 1);
//                 reasons.Add("long distance delivery");
//             }

//             if (driverLoad > 8)
//             {
//                 priority = Math.Max(1, priority - 1);
//                 reasons.Add("driver overloaded");
//             }

//             if (orderAge > 48)
//             {
//                 priority = Math.Min(5, priority + 1);
//                 reasons.Add("order delayed significantly");
//             }

//             return new AiPriorityResult
//             {
//                 AiPriority = priority,
//                 Justification = $"Priority {priority} due to: {string.Join(", ", reasons)}"
//             };
//         }

//         public async Task<string> AnalyzeText(string prompt)
//         {
//             if (string.IsNullOrEmpty(_apiKey)) return "API Key missing";

//             var requestBody = new
//             {
//                 contents = new[]
//                 {
//                     new { parts = new[] { new { text = prompt } } }
//                 }
//             };

//             var content = new StringContent(
//                 JsonSerializer.Serialize(requestBody), 
//                 Encoding.UTF8, 
//                 "application/json"
//             );

//             var response = await _httpClient.PostAsync(
//                 $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={_apiKey}", 
//                 content
//             );

//             if (response.IsSuccessStatusCode)
//             {
//                 var json = await response.Content.ReadAsStringAsync();
//                 return json;
//             }

//             return "Error calling Gemini API";
//         }
//     }

//     public class AiPriorityResult
//     {
//         public int AiPriority { get; set; }
//         public string Justification { get; set; } = string.Empty;
//     }
// }

// using System.Text;
// using System.Text.Json;
// using Backend.Services;

// namespace Backend.Services
// {
//     public class GeminiService
//     {
//         private readonly HttpClient _httpClient;
//         private readonly string _apiKey;

//         public GeminiService(IConfiguration configuration)
//         {
//             _httpClient = new HttpClient();
//             _apiKey = configuration["Gemini:ApiKey"] 
//                 ?? throw new Exception("Gemini API Key not configured");
//         }

//         /// <summary>
//         /// Existing method for delivery priority calculation
//         /// </summary>
//         public async Task<(int AiPriority, string Justification)> CalculateDeliveryPriority(
//             DateTime scheduledDate,
//             double distance,
//             string? rescheduleReason,
//             int driverLoad,
//             int orderAgeHours)
//         {
//             var prompt = $@"
// You are an AI logistics priority calculator. Analyze this delivery and assign a priority from 1 (low) to 5 (critical).

// DELIVERY INFO:
// - Scheduled Date: {scheduledDate}
// - Distance: {distance:F2} km
// - Driver Current Load: {driverLoad} orders
// - Order Age: {orderAgeHours} hours
// - Reschedule Reason: {rescheduleReason ?? "N/A"}

// PRIORITY RULES:
// 5 = Critical (urgent medical, same-day, VIP)
// 4 = High (next-day, perishable)
// 3 = Normal (standard delivery)
// 2 = Low (flexible timeline)
// 1 = Rescheduled/Delayed

// Return ONLY valid JSON:
// {{
//   ""priority"": 3,
//   ""justification"": ""Standard delivery within normal timeframe""
// }}";

//             var response = await CallGeminiAsync(prompt);
//             return ParsePriorityResponse(response);
//         }

//         /// <summary>
//         /// 🆕 NEW: ASR Document Verification using Gemini Vision API
//         /// </summary>
//         public async Task<ASRVerificationResult> VerifyASRDocumentsAsync(
//             List<string> documentUrls,
//             string customerPhotoUrl,
//             string signatureUrl,
//             string expectedName,
//             string shippingLabelName)
//         {
//             var prompt = $@"
// You are an AI document verification system for Adult Signature Required (ASR) delivery verification.

// VERIFICATION TASK:
// Analyze the provided documents and verify:
// 1. Face on ID card matches customer photo
// 2. Name on ID matches shipping label name
// 3. Signature matches customer signature
// 4. Detect fraud: tampering, mismatched fonts, forged documents

// PROVIDED DOCUMENTS:
// - ID Documents (Aadhaar/PAN): {string.Join(", ", documentUrls)}
// - Customer Photo (taken by driver): {customerPhotoUrl}
// - Customer Signature: {signatureUrl}

// EXPECTED INFORMATION:
// - Name on Shipping Label: {shippingLabelName}
// - Expected Customer Name: {expectedName}

// VERIFICATION CRITERIA:
// ✓ Face Match: Does the face on ID match the customer photo?
// ✓ Name Match: Does the ID name match the shipping label?
// ✓ Signature Match: Does the signature look consistent?
// ✓ Document Authenticity: Any signs of tampering or forgery?

// Return ONLY valid JSON:
// {{
//   ""isVerified"": true,
//   ""score"": 0.95,
//   ""reasons"": [
//     ""Face match: 95% confidence"",
//     ""Name matches shipping label"",
//     ""Signature appears authentic"",
//     ""No tampering detected""
//   ]
// }}

// If verification fails, set isVerified to false and provide detailed reasons.";

//             var response = await CallGeminiVisionAsync(prompt, documentUrls, customerPhotoUrl, signatureUrl);
//             return ParseASRResponse(response);
//         }

//         // ========================================
//         // HELPER METHODS
//         // ========================================

//         private async Task<string> CallGeminiAsync(string prompt)
//         {
//             var requestBody = new
//             {
//                 contents = new[]
//                 {
//                     new
//                     {
//                         parts = new[] { new { text = prompt } }
//                     }
//                 }
//             };

//             var json = JsonSerializer.Serialize(requestBody);
//             var content = new StringContent(json, Encoding.UTF8, "application/json");

//             var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={_apiKey}";
//             var response = await _httpClient.PostAsync(url, content);
//             response.EnsureSuccessStatusCode();

//             var responseText = await response.Content.ReadAsStringAsync();
//             var jsonResponse = JsonDocument.Parse(responseText);

//             return jsonResponse.RootElement
//                 .GetProperty("candidates")[0]
//                 .GetProperty("content")
//                 .GetProperty("parts")[0]
//                 .GetProperty("text")
//                 .GetString() ?? "";
//         }

//         private async Task<string> CallGeminiVisionAsync(
//             string prompt, 
//             List<string> documentUrls,
//             string customerPhotoUrl,
//             string signatureUrl)
//         {
//             // Gemini 2.5 Flash supports multimodal input
//             var parts = new List<object>
//             {
//                 new { text = prompt }
//             };

//             // Add document images
//             foreach (var docUrl in documentUrls)
//             {
//                 parts.Add(new
//                 {
//                     inlineData = new
//                     {
//                         mimeType = "image/jpeg",
//                         data = await DownloadImageAsBase64(docUrl)
//                     }
//                 });
//             }

//             // Add customer photo
//             parts.Add(new
//             {
//                 inlineData = new
//                 {
//                     mimeType = "image/jpeg",
//                     data = await DownloadImageAsBase64(customerPhotoUrl)
//                 }
//             });

//             // Add signature
//             parts.Add(new
//             {
//                 inlineData = new
//                 {
//                     mimeType = "image/jpeg",
//                     data = await DownloadImageAsBase64(signatureUrl)
//                 }
//             });

//             var requestBody = new
//             {
//                 contents = new[]
//                 {
//                     new { parts = parts.ToArray() }
//                 }
//             };

//             var json = JsonSerializer.Serialize(requestBody);
//             var content = new StringContent(json, Encoding.UTF8, "application/json");

//             var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={_apiKey}";
//             var response = await _httpClient.PostAsync(url, content);
//             response.EnsureSuccessStatusCode();

//             var responseText = await response.Content.ReadAsStringAsync();
//             var jsonResponse = JsonDocument.Parse(responseText);

//             return jsonResponse.RootElement
//                 .GetProperty("candidates")[0]
//                 .GetProperty("content")
//                 .GetProperty("parts")[0]
//                 .GetProperty("text")
//                 .GetString() ?? "";
//         }

//         private async Task<string> DownloadImageAsBase64(string imageUrl)
//         {
//             try
//             {
//                 var imageBytes = await _httpClient.GetByteArrayAsync(imageUrl);
//                 return Convert.ToBase64String(imageBytes);
//             }
//             catch
//             {
//                 // Return placeholder if image download fails
//                 return "";
//             }
//         }

//         private (int AiPriority, string Justification) ParsePriorityResponse(string response)
//         {
//             try
//             {
//                 var cleaned = response.Replace("```json", "").Replace("```", "").Trim();
//                 var json = JsonDocument.Parse(cleaned);
//                 var priority = json.RootElement.GetProperty("priority").GetInt32();
//                 var justification = json.RootElement.GetProperty("justification").GetString() ?? "";
//                 return (priority, justification);
//             }
//             catch
//             {
//                 return (3, "AI parsing failed, using default priority");
//             }
//         }

//         private ASRVerificationResult ParseASRResponse(string response)
//         {
//             try
//             {
//                 var cleaned = response.Replace("```json", "").Replace("```", "").Trim();
//                 var json = JsonDocument.Parse(cleaned);

//                 var isVerified = json.RootElement.GetProperty("isVerified").GetBoolean();
//                 var score = json.RootElement.GetProperty("score").GetDouble();
//                 var reasons = new List<string>();

//                 if (json.RootElement.TryGetProperty("reasons", out var reasonsArray))
//                 {
//                     foreach (var reason in reasonsArray.EnumerateArray())
//                     {
//                         reasons.Add(reason.GetString() ?? "");
//                     }
//                 }

//                 return new ASRVerificationResult
//                 {
//                     IsVerified = isVerified,
//                     Score = score,
//                     Reasons = reasons
//                 };
//             }
//             catch
//             {
//                 return new ASRVerificationResult
//                 {
//                     IsVerified = false,
//                     Score = 0,
//                     Reasons = new List<string> { "AI verification parsing failed" }
//                 };
//             }
//         }
//     }
// }

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
            _apiKey = configuration["Gemini:ApiKey"] 
                ?? throw new Exception("Gemini API Key not configured");
        }

        /// <summary>
        /// Existing method for delivery priority calculation
        /// </summary>
        public async Task<(int AiPriority, string Justification)> CalculateDeliveryPriority(
            DateTime scheduledDate,
            double distance,
            string? rescheduleReason,
            int driverLoad,
            int orderAgeHours)
        {
            try
            {
                var prompt = $@"
You are an AI logistics priority calculator. Analyze this delivery and assign a priority from 1 (low) to 5 (critical).

DELIVERY INFO:
- Scheduled Date: {scheduledDate}
- Distance: {distance:F2} km
- Driver Current Load: {driverLoad} orders
- Order Age: {orderAgeHours} hours
- Reschedule Reason: {rescheduleReason ?? "N/A"}

PRIORITY RULES:
5 = Critical (urgent medical, same-day, VIP)
4 = High (next-day, perishable)
3 = Normal (standard delivery)
2 = Low (flexible timeline)
1 = Rescheduled/Delayed

Return ONLY valid JSON:
{{
  ""priority"": 3,
  ""justification"": ""Standard delivery within normal timeframe""
}}";

                var response = await CallGeminiAsync(prompt);
                return ParsePriorityResponse(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Gemini API Failed: {ex.Message}");
                // Fallback
                return (3, "AI unavailable, defaulted to users preference.");
            }
        }

        /// <summary>
        /// ASR Document Verification (optional - can be disabled if using Python service)
        /// </summary>
        public async Task<ASRVerificationResult> VerifyASRDocumentsAsync(
            List<string> documentUrls,
            string customerPhotoUrl,
            string signatureUrl,
            string expectedName,
            string shippingLabelName)
        {
            var prompt = $@"
You are an AI document verification system for Adult Signature Required (ASR) delivery verification.

VERIFICATION TASK:
Analyze the provided documents and verify:
1. Face on ID card matches customer photo
2. Name on ID matches shipping label name
3. Signature matches customer signature
4. Detect fraud: tampering, mismatched fonts, forged documents

PROVIDED DOCUMENTS:
- ID Documents (Aadhaar/PAN): {string.Join(", ", documentUrls)}
- Customer Photo (taken by driver): {customerPhotoUrl}
- Customer Signature: {signatureUrl}

EXPECTED INFORMATION:
- Name on Shipping Label: {shippingLabelName}
- Expected Customer Name: {expectedName}

VERIFICATION CRITERIA:
✓ Face Match: Does the face on ID match the customer photo?
✓ Name Match: Does the ID name match the shipping label?
✓ Signature Match: Does the signature look consistent?
✓ Document Authenticity: Any signs of tampering or forgery?

Return ONLY valid JSON:
{{
  ""isVerified"": true,
  ""score"": 0.95,
  ""reasons"": [
    ""Face match: 95% confidence"",
    ""Name matches shipping label"",
    ""Signature appears authentic"",
    ""No tampering detected""
  ]
}}

If verification fails, set isVerified to false and provide detailed reasons.";

            var response = await CallGeminiVisionAsync(prompt, documentUrls, customerPhotoUrl, signatureUrl);
            return ParseASRResponse(response);
        }

        // ========================================
        // HELPER METHODS
        // ========================================

        private async Task<string> CallGeminiAsync(string prompt)
        {
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[] { new { text = prompt } }
                    }
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={_apiKey}";
            var response = await _httpClient.PostAsync(url, content);
            response.EnsureSuccessStatusCode();

            var responseText = await response.Content.ReadAsStringAsync();
            var jsonResponse = JsonDocument.Parse(responseText);

            return jsonResponse.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString() ?? "";
        }

        private async Task<string> CallGeminiVisionAsync(
            string prompt, 
            List<string> documentUrls,
            string customerPhotoUrl,
            string signatureUrl)
        {
            // Gemini 2.5 Flash supports multimodal input
            var parts = new List<object>
            {
                new { text = prompt }
            };

            // Add document images
            foreach (var docUrl in documentUrls)
            {
                parts.Add(new
                {
                    inlineData = new
                    {
                        mimeType = "image/jpeg",
                        data = await DownloadImageAsBase64(docUrl)
                    }
                });
            }

            // Add customer photo
            parts.Add(new
            {
                inlineData = new
                {
                    mimeType = "image/jpeg",
                    data = await DownloadImageAsBase64(customerPhotoUrl)
                }
            });

            // Add signature
            parts.Add(new
            {
                inlineData = new
                {
                    mimeType = "image/jpeg",
                    data = await DownloadImageAsBase64(signatureUrl)
                }
            });

            var requestBody = new
            {
                contents = new[]
                {
                    new { parts = parts.ToArray() }
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={_apiKey}";
            var response = await _httpClient.PostAsync(url, content);
            response.EnsureSuccessStatusCode();

            var responseText = await response.Content.ReadAsStringAsync();
            var jsonResponse = JsonDocument.Parse(responseText);

            return jsonResponse.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString() ?? "";
        }

        private async Task<string> DownloadImageAsBase64(string imageUrl)
        {
            try
            {
                var imageBytes = await _httpClient.GetByteArrayAsync(imageUrl);
                return Convert.ToBase64String(imageBytes);
            }
            catch
            {
                // Return placeholder if image download fails
                return "";
            }
        }

        private (int AiPriority, string Justification) ParsePriorityResponse(string response)
        {
            try
            {
                var cleaned = response.Replace("```json", "").Replace("```", "").Trim();
                var json = JsonDocument.Parse(cleaned);
                var priority = json.RootElement.GetProperty("priority").GetInt32();
                var justification = json.RootElement.GetProperty("justification").GetString() ?? "";
                return (priority, justification);
            }
            catch
            {
                return (3, "AI parsing failed, using default priority");
            }
        }

        private ASRVerificationResult ParseASRResponse(string response)
        {
            try
            {
                var cleaned = response.Replace("```json", "").Replace("```", "").Trim();
                var json = JsonDocument.Parse(cleaned);

                var isVerified = json.RootElement.GetProperty("isVerified").GetBoolean();
                var score = json.RootElement.GetProperty("score").GetDouble();
                var reasons = new List<string>();

                if (json.RootElement.TryGetProperty("reasons", out var reasonsArray))
                {
                    foreach (var reason in reasonsArray.EnumerateArray())
                    {
                        reasons.Add(reason.GetString() ?? "");
                    }
                }

                return new ASRVerificationResult
                {
                    IsVerified = isVerified,
                    Score = score,
                    Reasons = reasons
                };
            }
            catch
            {
                return new ASRVerificationResult
                {
                    IsVerified = false,
                    Score = 0,
                    Reasons = new List<string> { "AI verification parsing failed" }
                };
            }
        }
    }

    public class ASRVerificationResult
    {
        public bool IsVerified { get; set; }
        public double Score { get; set; }
        public List<string> Reasons { get; set; } = new();
    }
}