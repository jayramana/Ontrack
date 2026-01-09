using System.Text;
using System.Text.Json;
using Backend.DTO;

namespace Backend.Services
{
    public class VerificationService
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _config;

        public VerificationService(IConfiguration config)
        {
            _config = config;
            _http = new HttpClient();
        }

        // =====================================================
        // GEMINI 2.5 FLASH – Aadhaar OCR (IMPROVED)
        // =====================================================
        public async Task<GeminiAadhaarOcr?> AadhaarOcrWithGeminiAsync(string base64Image)
        {
            try
            {
                var cleanBase64 = base64Image.Contains(",")
                    ? base64Image.Split(',')[1]
                    : base64Image;

                // Determine image format from base64 header
                var mimeType = "image/jpeg";
                if (base64Image.StartsWith("data:image/png"))
                    mimeType = "image/png";

                var request = new
                {
                    contents = new[]
                    {
                        new
                        {
                            role = "user",
                            parts = new object[]
                            {
                                new
                                {
                                    inlineData = new
                                    {
                                        mimeType = mimeType,
                                        data = cleanBase64
                                    }
                                },
                                new
                                {
                                    text = """
                                    Extract data from this Aadhaar card.
                                    Return a JSON object. MASK any sensitive data if required, but otherwise return full visible text.

                                    Response Format (JSON ONLY):
                                    {
                                      "name": "Name",
                                      "dob": "DD/MM/YYYY",
                                      "yearOfBirth": "YYYY",
                                      "gender": "Male/Female",
                                      "aadhaarNumber": "0000 0000 0000",
                                      "address": "Address string"
                                    }

                                    Rules:
                                    - If yearOfBirth is visible but full DOB is not, fill yearOfBirth.
                                    - If full DOB is visible, fill both dob and yearOfBirth.
                                    - If a field is missing, use empty string.
                                    """
                                }
                            }
                        }
                    },
                    generationConfig = new
                    {
                        temperature = 0.1,
                        topK = 1,
                        topP = 1,
                        maxOutputTokens = 1024,
                        responseMimeType = "application/json"
                    }
                };

                Console.WriteLine("🔍 Calling Gemini API for OCR...");
                
                var res = await _http.PostAsync(
                    $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_config["Gemini:ApiKey"]}",
                    new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json")
                );

                if (!res.IsSuccessStatusCode)
                {
                    var error = await res.Content.ReadAsStringAsync();
                    Console.WriteLine($"❌ Gemini API error: {res.StatusCode} - {error}");
                    return null;
                }

                var raw = await res.Content.ReadAsStringAsync();
                Console.WriteLine($"📄 Raw Gemini response: {raw.Substring(0, Math.Min(500, raw.Length))}...");

                var doc = JsonDocument.Parse(raw);
                
                // Check for API errors
                if (doc.RootElement.TryGetProperty("error", out var errorProp))
                {
                    Console.WriteLine($"❌ Gemini API error: {errorProp.GetProperty("message").GetString()}");
                    return null;
                }

                var text = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                Console.WriteLine($"📝 Gemini text response: {text}");

                var cleanedJson = ExtractJson(text);
                if (string.IsNullOrEmpty(cleanedJson))
                {
                    Console.WriteLine("❌ Failed to extract valid JSON from Gemini response");
                    return null;
                }

                Console.WriteLine($"✅ Cleaned JSON: {cleanedJson}");

                var result = JsonSerializer.Deserialize<GeminiAadhaarOcr>(
                    cleanedJson,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                );

                // Validate that at least name is extracted
                if (result != null && !string.IsNullOrWhiteSpace(result.Name))
                {
                    Console.WriteLine($"✅ OCR Success - Name: {result.Name}, Gender: {result.Gender}, Aadhaar: {result.AadhaarNumber}");
                    return result;
                }
                
                Console.WriteLine("❌ OCR failed - No name extracted");
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Gemini OCR exception: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return null;
            }
        }

        // =====================================================
        // GEMINI 2.5 FLASH – Signature Verification
        // =====================================================
        public async Task<bool> VerifySignatureWithGeminiAsync(
            string aadhaarBase64, 
            string signatureBase64)
        {
            try
            {
                var cleanAadhaar = aadhaarBase64.Contains(",")
                    ? aadhaarBase64.Split(',')[1]
                    : aadhaarBase64;

                var cleanSignature = signatureBase64.Contains(",")
                    ? signatureBase64.Split(',')[1]
                    : signatureBase64;

                var request = new
                {
                    contents = new[]
                    {
                        new
                        {
                            role = "user",
                            parts = new object[]
                            {
                                new
                                {
                                    inlineData = new
                                    {
                                        mimeType = "image/jpeg",
                                        data = cleanAadhaar
                                    }
                                },
                                new
                                {
                                    inlineData = new
                                    {
                                        mimeType = "image/jpeg",
                                        data = cleanSignature
                                    }
                                },
                                new
                                {
                                    text = """
                                    Compare the signature on the Aadhaar card (first image) with the captured signature (second image).
                                    
                                    Analyze:
                                    1. Overall shape and flow
                                    2. Letter formations
                                    3. Pen pressure patterns
                                    4. Signature size and proportion
                                    5. Distinctive features
                                    
                                    Return ONLY valid JSON (no markdown):
                                    {
                                      "match": true/false,
                                      "confidence": 0.0-1.0,
                                      "reason": "brief explanation"
                                    }
                                    
                                    Consider signatures as matching if they show reasonable similarity (confidence > 0.6).
                                    """
                                }
                            }
                        }
                    }
                };

                var res = await _http.PostAsync(
                    $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_config["Gemini:ApiKey"]}",
                    new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json")
                );

                if (!res.IsSuccessStatusCode)
                    return false;

                var raw = await res.Content.ReadAsStringAsync();
                var text = JsonDocument.Parse(raw)
                    .RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                var cleanedJson = ExtractJson(text);
                if (string.IsNullOrEmpty(cleanedJson))
                    return false;

                var result = JsonDocument.Parse(cleanedJson);
                var match = result.RootElement.GetProperty("match").GetBoolean();
                var confidence = result.RootElement.GetProperty("confidence").GetDouble();

                return match && confidence > 0.6;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Signature verification error: {ex.Message}");
                return false;
            }
        }

        // =====================================================
        // APYHUB – Aadhaar Number Format Validation
        // =====================================================
        public async Task<bool> ValidateAadhaarNumberAsync(string aadhaarNumber)
        {
            try
            {
                // Remove spaces and dashes
                aadhaarNumber = aadhaarNumber.Replace(" ", "").Replace("-", "");

                // Basic format check
                if (aadhaarNumber.Length != 12 || !long.TryParse(aadhaarNumber, out _))
                    return false;

                var req = new HttpRequestMessage(
                    HttpMethod.Post,
                    "https://api.apyhub.com/validate/aadhaar"
                );

                req.Headers.Add("apy-token", _config["APYHub:Token"]!);
                req.Content = new StringContent(
                    JsonSerializer.Serialize(new { aadhaar = aadhaarNumber }),
                    Encoding.UTF8,
                    "application/json"
                );

                var res = await _http.SendAsync(req);
                if (!res.IsSuccessStatusCode)
                    return false;

                return JsonDocument.Parse(await res.Content.ReadAsStringAsync())
                    .RootElement
                    .GetProperty("data")
                    .GetBoolean();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"APYHub validation error: {ex.Message}");
                return false;
            }
        }

        // =====================================================
        // PYTHON – Face Match
        // =====================================================
        public async Task<FaceMatchResult> FaceMatchAsync(
            string idBase64,
            string liveBase64)
        {
            try
            {
                var res = await _http.PostAsync(
                    $"{_config["Python:Url"]}/verify/face-match",
                    new StringContent(
                        JsonSerializer.Serialize(new
                        {
                            idPhoto = idBase64,
                            capturedPhoto = liveBase64
                        }),
                        Encoding.UTF8,
                        "application/json"
                    )
                );

                if (!res.IsSuccessStatusCode)
                {
                    return new FaceMatchResult
                    {
                        FaceMatch = false,
                        Similarity = 0,
                        Reason = "Face verification service unavailable"
                    };
                }

                return JsonSerializer.Deserialize<FaceMatchResult>(
                    await res.Content.ReadAsStringAsync(),
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                )!;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Face match error: {ex.Message}");
                return new FaceMatchResult
                {
                    FaceMatch = false,
                    Similarity = 0,
                    Reason = $"Face match error: {ex.Message}"
                };
            }
        }

        // JSON CLEANER
        private static string ExtractJson(string? input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return "";

            input = input.Replace("```json", "")
                         .Replace("```", "")
                         .Trim();

            int start = input.IndexOf('{');
            int end = input.LastIndexOf('}');

            if (start == -1 || end == -1 || end <= start)
                return "";

            return input.Substring(start, end - start + 1);
        }
    }
}