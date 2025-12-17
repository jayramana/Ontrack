// // using System.Text.Json;

// // namespace Backend.Services
// // {
// //     public class VerificationService
// //     {
// //         private readonly HttpClient _httpClient;
// //         private readonly string _pythonServiceUrl;

// //         public VerificationService(IConfiguration configuration)
// //         {
// //             _httpClient = new HttpClient();
// //             _pythonServiceUrl = configuration["PythonVerificationService:Url"] 
// //                 ?? "http://localhost:5001";
// //         }

// //         /// <summary>
// //         /// Verify Aadhaar QR code using Python microservice
// //         /// </summary>
// //         public async Task<AadhaarVerificationResult> VerifyAadhaarAsync(string base64Image)
// //         {
// //             try
// //             {
// //                 // Convert base64 to byte array
// //                 var imageBytes = Convert.FromBase64String(
// //                     base64Image.Contains(",") ? base64Image.Split(',')[1] : base64Image
// //                 );

// //                 // Create multipart form data
// //                 using var content = new MultipartFormDataContent();
// //                 var imageContent = new ByteArrayContent(imageBytes);
// //                 imageContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");
// //                 content.Add(imageContent, "aadhaarImage", "aadhaar.jpg");

// //                 // Call Python service
// //                 var response = await _httpClient.PostAsync(
// //                     $"{_pythonServiceUrl}/verify/aadhaar-qr",
// //                     content
// //                 );

// //                 if (!response.IsSuccessStatusCode)
// //                 {
// //                     var errorText = await response.Content.ReadAsStringAsync();
// //                     Console.WriteLine($"Python service error: {errorText}");
                    
// //                     return new AadhaarVerificationResult
// //                     {
// //                         IsOriginal = false,
// //                         SignatureValid = false,
// //                         Reason = "Python verification service error",
// //                         VerificationType = "UIDAI_SECURE_QR_OFFLINE"
// //                     };
// //                 }

// //                 var jsonResponse = await response.Content.ReadAsStringAsync();
// //                 var result = JsonSerializer.Deserialize<AadhaarVerificationResult>(
// //                     jsonResponse,
// //                     new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
// //                 );

// //                 return result ?? new AadhaarVerificationResult
// //                 {
// //                     IsOriginal = false,
// //                     SignatureValid = false,
// //                     Reason = "Failed to parse verification result"
// //                 };
// //             }
// //             catch (Exception ex)
// //             {
// //                 Console.WriteLine($"Aadhaar verification error: {ex.Message}");
// //                 return new AadhaarVerificationResult
// //                 {
// //                     IsOriginal = false,
// //                     SignatureValid = false,
// //                     Reason = $"Verification failed: {ex.Message}",
// //                     VerificationType = "UIDAI_SECURE_QR_OFFLINE"
// //                 };
// //             }
// //         }

// //         /// <summary>
// //         /// Verify face match between ID and captured photo using Python DeepFace service
// //         /// </summary>
// //         public async Task<FaceMatchResult> VerifyFaceMatchAsync(
// //             string idPhotoBase64, 
// //             string capturedPhotoBase64)
// //         {
// //             try
// //             {
// //                 // Convert base64 to bytes
// //                 var idBytes = Convert.FromBase64String(
// //                     idPhotoBase64.Contains(",") ? idPhotoBase64.Split(',')[1] : idPhotoBase64
// //                 );
// //                 var capturedBytes = Convert.FromBase64String(
// //                     capturedPhotoBase64.Contains(",") ? capturedPhotoBase64.Split(',')[1] : capturedPhotoBase64
// //                 );

// //                 // Create form data
// //                 using var content = new MultipartFormDataContent();
                
// //                 var idContent = new ByteArrayContent(idBytes);
// //                 idContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");
// //                 content.Add(idContent, "idPhoto", "id.jpg");
                
// //                 var capturedContent = new ByteArrayContent(capturedBytes);
// //                 capturedContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");
// //                 content.Add(capturedContent, "capturedPhoto", "captured.jpg");

// //                 // Call Python service
// //                 var response = await _httpClient.PostAsync(
// //                     $"{_pythonServiceUrl}/verify/face-match",
// //                     content
// //                 );

// //                 if (!response.IsSuccessStatusCode)
// //                 {
// //                     var errorText = await response.Content.ReadAsStringAsync();
// //                     Console.WriteLine($"Face verification error: {errorText}");
                    
// //                     return new FaceMatchResult
// //                     {
// //                         FaceMatch = false,
// //                         Reason = "Face verification service error"
// //                     };
// //                 }

// //                 var jsonResponse = await response.Content.ReadAsStringAsync();
// //                 var result = JsonSerializer.Deserialize<FaceMatchResult>(
// //                     jsonResponse,
// //                     new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
// //                 );

// //                 return result ?? new FaceMatchResult
// //                 {
// //                     FaceMatch = false,
// //                     Reason = "Failed to parse face match result"
// //                 };
// //             }
// //             catch (Exception ex)
// //             {
// //                 Console.WriteLine($"Face verification error: {ex.Message}");
// //                 return new FaceMatchResult
// //                 {
// //                     FaceMatch = false,
// //                     Reason = $"Face verification failed: {ex.Message}"
// //                 };
// //             }
// //         }

// //         /// <summary>
// //         /// Complete ASR verification (Aadhaar + Face)
// //         /// Called by ASP.NET backend when driver uploads captures
// //         /// </summary>
// //         public async Task<CompleteASRResult> VerifyCompleteASRAsync(
// //             List<string> documentUrls,
// //             string customerPhotoUrl,
// //             string signatureUrl)
// //         {
// //             try
// //             {
// //                 var reasons = new List<string>();
// //                 var verified = true;
// //                 double score = 0;

// //                 // 1. Verify Aadhaar QR (cryptographic)
// //                 var aadhaarResult = await VerifyAadhaarAsync(documentUrls.FirstOrDefault() ?? "");
                
// //                 if (aadhaarResult.IsOriginal)
// //                 {
// //                     reasons.Add("✓ Aadhaar verified (UIDAI Secure QR signature valid)");
// //                     score += 0.5; // 50% weight
// //                 }
// //                 else
// //                 {
// //                     reasons.Add($"✗ Aadhaar verification failed: {aadhaarResult.Reason}");
// //                     verified = false;
// //                 }

// //                 // 2. Verify face match (DeepFace)
// //                 var faceResult = await VerifyFaceMatchAsync(
// //                     documentUrls.FirstOrDefault() ?? "", 
// //                     customerPhotoUrl
// //                 );
                
// //                 if (faceResult.FaceMatch)
// //                 {
// //                     reasons.Add($"✓ Face match confirmed ({faceResult.Similarity:F1}% similarity)");
// //                     score += 0.5; // 50% weight
// //                 }
// //                 else
// //                 {
// //                     reasons.Add($"✗ {faceResult.Reason}");
// //                     verified = false;
// //                 }

// //                 return new CompleteASRResult
// //                 {
// //                     Verified = verified && score >= 0.8,
// //                     Score = verified ? score : 0,
// //                     Reasons = reasons,
// //                     VerificationType = "UIDAI_SECURE_QR_OFFLINE + DEEPFACE_ARCFACE",
// //                     AadhaarData = aadhaarResult.AadhaarData
// //                 };
// //             }
// //             catch (Exception ex)
// //             {
// //                 Console.WriteLine($"Complete ASR verification error: {ex.Message}");
// //                 return new CompleteASRResult
// //                 {
// //                     Verified = false,
// //                     Score = 0,
// //                     Reasons = new List<string> { $"Verification error: {ex.Message}" },
// //                     VerificationType = "ERROR"
// //                 };
// //             }
// //         }
// //     }

// //     // DTO Classes
// //     public class AadhaarVerificationResult
// //     {
// //         public bool IsOriginal { get; set; }
// //         public bool SignatureValid { get; set; }
// //         public string Reason { get; set; } = "";
// //         public string VerificationType { get; set; } = "";
// //         public AadhaarData? AadhaarData { get; set; }
// //     }

// //     public class AadhaarData
// //     {
// //         public string Name { get; set; } = "";
// //         public string Dob { get; set; } = "";
// //         public string Yob { get; set; } = "";
// //         public string Gender { get; set; } = "";
// //         public string MaskedAadhaar { get; set; } = "";
// //         public string Address { get; set; } = "";
// //     }

// //     public class FaceMatchResult
// //     {
// //         public bool FaceMatch { get; set; }
// //         public double Similarity { get; set; }
// //         public double Distance { get; set; }
// //         public double Threshold { get; set; }
// //         public string Model { get; set; } = "";
// //         public string Reason { get; set; } = "";
// //     }

// //     public class CompleteASRResult
// //     {
// //         public bool Verified { get; set; }
// //         public double Score { get; set; }
// //         public List<string> Reasons { get; set; } = new();
// //         public string VerificationType { get; set; } = "";
// //         public AadhaarData? AadhaarData { get; set; }
// //     }
// // }

// using System.Text;
// using System.Text.Json;
// using Backend.DTO;

// namespace Backend.Services
// {
//     public class VerificationService
//     {
//         private readonly HttpClient _http;
//         private readonly IConfiguration _config;

//         public VerificationService(IConfiguration config)
//         {
//             _config = config;
//             _http = new HttpClient();
//         }

//         // =====================================================
//         // GEMINI 2.5 FLASH – Aadhaar OCR (SAFE JSON PARSING)
//         // =====================================================
//         public async Task<GeminiAadhaarOcr?> AadhaarOcrWithGeminiAsync(string base64Image)
//         {
//             try
//             {
//                 var cleanBase64 = base64Image.Contains(",")
//                     ? base64Image.Split(',')[1]
//                     : base64Image;

//                 var request = new
//                 {
//                     contents = new[]
//                     {
//                         new
//                         {
//                             role = "user",
//                             parts = new object[]
//                             {
//                                 new
//                                 {
//                                     inlineData = new
//                                     {
//                                         mimeType = "image/jpeg",
//                                         data = cleanBase64
//                                     }
//                                 },
//                                 new
//                                 {
//                                     text = """
//                                     Extract Aadhaar details.
//                                     Return ONLY valid JSON (no markdown, no explanation).

//                                     {
//                                       "name": "",
//                                       "dob": "",
//                                       "yearOfBirth": "",
//                                       "gender": "",
//                                       "aadhaarLast4": ""
//                                     }
//                                     """
//                                 }
//                             }
//                         }
//                     }
//                 };

//                 var res = await _http.PostAsync(
//                     $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_config["Gemini:ApiKey"]}",
//                     new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json")
//                 );

//                 if (!res.IsSuccessStatusCode)
//                     return null;

//                 var raw = await res.Content.ReadAsStringAsync();

//                 var text = JsonDocument.Parse(raw)
//                     .RootElement
//                     .GetProperty("candidates")[0]
//                     .GetProperty("content")
//                     .GetProperty("parts")[0]
//                     .GetProperty("text")
//                     .GetString();

//                 var cleanedJson = ExtractJson(text);

//                 if (string.IsNullOrEmpty(cleanedJson))
//                     return null;

//                 return JsonSerializer.Deserialize<GeminiAadhaarOcr>(
//                     cleanedJson,
//                     new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
//                 );
//             }
//             catch
//             {
//                 return null;
//             }
//         }

//         // =====================================================
//         // APYHUB – Aadhaar FORMAT validation only
//         // =====================================================
//         public async Task<bool> ValidateAadhaarAsync(string aadhaar)
//         {
//             try
//             {
//                 var req = new HttpRequestMessage(
//                     HttpMethod.Post,
//                     "https://api.apyhub.com/validate/aadhaar"
//                 );

//                 req.Headers.Add("apy-token", _config["APYHub:Token"]!);
//                 req.Content = new StringContent(
//                     JsonSerializer.Serialize(new { aadhaar }),
//                     Encoding.UTF8,
//                     "application/json"
//                 );

//                 var res = await _http.SendAsync(req);
//                 if (!res.IsSuccessStatusCode) return false;

//                 return JsonDocument.Parse(await res.Content.ReadAsStringAsync())
//                     .RootElement
//                     .GetProperty("data")
//                     .GetBoolean();
//             }
//             catch
//             {
//                 return false;
//             }
//         }

//         // =====================================================
//         // PYTHON – OPTIONAL QR (NEVER FAILS FLOW)
//         // =====================================================
//         public async Task<QrResult?> TryQrVerificationAsync(string aadhaarBase64)
//         {
//             try
//             {
//                 var res = await _http.PostAsync(
//                     $"{_config["Python:Url"]}/verify/aadhaar-qr",
//                     new StringContent(
//                         JsonSerializer.Serialize(new { aadhaarImage = aadhaarBase64 }),
//                         Encoding.UTF8,
//                         "application/json"
//                     )
//                 );

//                 if (!res.IsSuccessStatusCode) return null;

//                 return JsonSerializer.Deserialize<QrResult>(
//                     await res.Content.ReadAsStringAsync(),
//                     new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
//             }
//             catch
//             {
//                 return null;
//             }
//         }

//         // =====================================================
//         // PYTHON – FACE MATCH
//         // =====================================================
//         public async Task<FaceMatchResult> FaceMatchAsync(
//             string idBase64,
//             string liveBase64)
//         {
//             var res = await _http.PostAsync(
//                 $"{_config["Python:Url"]}/verify/face-match",
//                 new StringContent(
//                     JsonSerializer.Serialize(new
//                     {
//                         idPhoto = idBase64,
//                         capturedPhoto = liveBase64
//                     }),
//                     Encoding.UTF8,
//                     "application/json"
//                 )
//             );

//             return JsonSerializer.Deserialize<FaceMatchResult>(
//                 await res.Content.ReadAsStringAsync(),
//                 new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
//             )!;
//         }

//         // =====================================================
//         // REQUIRED BY ASREndpoints (NO LOGIC HERE)
//         // =====================================================
//         public async Task<ASRVerificationResultDto> VerifyCompleteASRAsync(
//             List<string> documentUrls,
//             string customerPhotoUrl,
//             string signatureUrl)
//         {
//             // 🔥 REAL LOGIC IS IN ASRService.PerformAIVerificationAsync
//             return new ASRVerificationResultDto
//             {
//                 Verified = false,
//                 Score = 0,
//                 Reasons = new List<string>
//                 {
//                     "Verification handled by ASRService.PerformAIVerificationAsync"
//                 },
//                 AadhaarData = null,
//                 VerificationType = "ASRService"
//             };
//         }

//         // =====================================================
//         // COMPATIBILITY METHODS
//         // =====================================================
//         public async Task<QrResult?> VerifyAadhaarAsync(string aadhaarBase64)
//             => await TryQrVerificationAsync(aadhaarBase64);

//         public async Task<FaceMatchResult> VerifyFaceMatchAsync(
//             string idBase64,
//             string liveBase64)
//             => await FaceMatchAsync(idBase64, liveBase64);

//         // =====================================================
//         // 🔧 JSON CLEANER (CRITICAL FIX)
//         // =====================================================
//         private static string ExtractJson(string? input)
//         {
//             if (string.IsNullOrWhiteSpace(input))
//                 return "";

//             input = input.Replace("```json", "")
//                          .Replace("```", "")
//                          .Trim();

//             int start = input.IndexOf('{');
//             int end = input.LastIndexOf('}');

//             if (start == -1 || end == -1 || end <= start)
//                 return "";

//             return input.Substring(start, end - start + 1);
//         }
//     }
// }

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

        // =====================================================
        // JSON CLEANER
        // =====================================================
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