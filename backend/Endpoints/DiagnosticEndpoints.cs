using Backend.Services;
using Backend.DTO;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;


public static class DiagnosticEndpoints
{
    public static RouteGroupBuilder MapDiagnosticEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/diagnostic").WithTags("Diagnostic");

        /// <summary>
        /// Test Gemini OCR with an Aadhaar image
        /// </summary>
        group.MapPost("/test-ocr", async (
            [FromBody] TestOcrRequest request,
            VerificationService verificationService
        ) =>
        {
            try
            {
                Console.WriteLine("🔍 Starting OCR test...");
                Console.WriteLine($"Image data length: {request.ImageBase64.Length}");
                
                var result = await verificationService.AadhaarOcrWithGeminiAsync(request.ImageBase64);
                
                if (result == null)
                {
                    return Results.Ok(new
                    {
                        success = false,
                        message = "OCR returned null - Gemini could not process the image",
                        troubleshooting = new[]
                        {
                            "Check if Gemini API key is valid",
                            "Ensure image is clear and well-lit",
                            "Verify image is a valid Aadhaar card",
                            "Try uploading a different photo",
                            "Check backend console logs for detailed error"
                        }
                    });
                }

                return Results.Ok(new
                {
                    success = true,
                    message = "OCR successful",
                    data = result,
                    analysis = new
                    {
                        hasName = !string.IsNullOrWhiteSpace(result.Name),
                        hasDob = !string.IsNullOrWhiteSpace(result.Dob),
                        hasYearOfBirth = !string.IsNullOrWhiteSpace(result.YearOfBirth),
                        hasGender = !string.IsNullOrWhiteSpace(result.Gender),
                        hasAadhaarNumber = !string.IsNullOrWhiteSpace(result.AadhaarNumber),
                        hasAddress = !string.IsNullOrWhiteSpace(result.Address)
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ OCR test failed: {ex.Message}");
                return Results.Ok(new
                {
                    success = false,
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        });

        /// <summary>
        /// Test APYHub Aadhaar validation
        /// </summary>
        group.MapPost("/test-aadhaar-validation", async (
            [FromBody] TestAadhaarRequest request,
            VerificationService verificationService
        ) =>
        {
            try
            {
                Console.WriteLine($"🔍 Testing Aadhaar validation for: {request.AadhaarNumber}");
                
                var isValid = await verificationService.ValidateAadhaarNumberAsync(request.AadhaarNumber);
                
                return Results.Ok(new
                {
                    success = true,
                    aadhaarNumber = request.AadhaarNumber,
                    isValid = isValid,
                    message = isValid 
                        ? "✅ Aadhaar number format is valid" 
                        : "❌ Aadhaar number format is invalid"
                });
            }
            catch (Exception ex)
            {
                return Results.Ok(new
                {
                    success = false,
                    error = ex.Message
                });
            }
        });

        /// <summary>
        /// Test face matching
        /// </summary>
        group.MapPost("/test-face-match", async (
            [FromBody] TestFaceMatchRequest request,
            VerificationService verificationService
        ) =>
        {
            try
            {
                Console.WriteLine("🔍 Testing face match...");
                
                var result = await verificationService.FaceMatchAsync(
                    request.IdPhotoBase64,
                    request.CapturedPhotoBase64
                );
                
                return Results.Ok(new
                {
                    success = true,
                    result = result,
                    analysis = new
                    {
                        isMatch = result.FaceMatch,
                        similarity = result.Similarity,
                        threshold = result.Threshold,
                        passed = result.FaceMatch
                    }
                });
            }
            catch (Exception ex)
            {
                return Results.Ok(new
                {
                    success = false,
                    error = ex.Message
                });
            }
        });

        /// <summary>
        /// Test signature verification
        /// </summary>
        group.MapPost("/test-signature", async (
            [FromBody] TestSignatureRequest request,
            VerificationService verificationService
        ) =>
        {
            try
            {
                Console.WriteLine("🔍 Testing signature verification...");
                
                var result = await verificationService.VerifySignatureWithGeminiAsync(
                    request.AadhaarImageBase64,
                    request.SignatureBase64
                );
                
                return Results.Ok(new
                {
                    success = true,
                    signatureMatch = result,
                    message = result 
                        ? "✅ Signatures match" 
                        : "❌ Signatures do not match"
                });
            }
            catch (Exception ex)
            {
                return Results.Ok(new
                {
                    success = false,
                    error = ex.Message
                });
            }
        });

        /// <summary>
        /// Check all service statuses
        /// </summary>
        group.MapGet("/health-check", async (
            IConfiguration config,
            VerificationService verificationService
        ) =>
        {
            var checks = new Dictionary<string, object>();

            // Check Gemini API
            try
            {
                var hasKey = !string.IsNullOrEmpty(config["Gemini:ApiKey"]);
                checks["gemini"] = new
                {
                    status = hasKey ? "configured" : "missing",
                    hasApiKey = hasKey,
                    message = hasKey ? "✅ Gemini API key found" : "❌ Gemini API key missing"
                };
            }
            catch
            {
                checks["gemini"] = new { status = "error", message = "❌ Error checking Gemini config" };
            }

            // Check APYHub
            try
            {
                var hasToken = !string.IsNullOrEmpty(config["APYHub:Token"]);
                checks["apyhub"] = new
                {
                    status = hasToken ? "configured" : "missing",
                    hasToken = hasToken,
                    message = hasToken ? "✅ APYHub token found" : "❌ APYHub token missing"
                };
            }
            catch
            {
                checks["apyhub"] = new { status = "error", message = "❌ Error checking APYHub config" };
            }

            // Check Python service
            try
            {
                var pythonUrl = config["Python:Url"];
                var http = new HttpClient();
                http.Timeout = TimeSpan.FromSeconds(5);
                var response = await http.GetAsync($"{pythonUrl}/health");
                
                checks["python"] = new
                {
                    status = response.IsSuccessStatusCode ? "online" : "offline",
                    url = pythonUrl,
                    message = response.IsSuccessStatusCode 
                        ? "✅ Python service is running" 
                        : "❌ Python service is not responding"
                };
            }
            catch (Exception ex)
            {
                checks["python"] = new
                {
                    status = "offline",
                    message = $"❌ Cannot connect to Python service: {ex.Message}"
                };
            }

            var allOk = checks.Values.All(c =>
            {
                var status = (c as dynamic)?.status?.ToString() ?? "";
                return status == "configured" || status == "online";
            });

            return Results.Ok(new
            {
                overallStatus = allOk ? "healthy" : "degraded",
                services = checks,
                timestamp = DateTime.UtcNow
            });
        });
        return group;
    }
}

// Request DTOs
public record TestOcrRequest(string ImageBase64);
public record TestAadhaarRequest(string AadhaarNumber);
public record TestFaceMatchRequest(string IdPhotoBase64, string CapturedPhotoBase64);
public record TestSignatureRequest(string AadhaarImageBase64, string SignatureBase64);