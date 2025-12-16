using Backend.Services;
using Microsoft.AspNetCore.Mvc;

public static class VerificationEndpoints
{
    public static void MapVerificationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/verification").WithTags("Verification");

        /// <summary>
        /// Test endpoint - Verify Aadhaar QR code only
        /// </summary>
        group.MapPost("/aadhaar", async (
            [FromBody] AadhaarVerifyRequest request,
            VerificationService verificationService
        ) =>
        {
            try
            {
                var result = await verificationService.VerifyAadhaarAsync(request.AadhaarImage);
                return Results.Ok(result);
            }
            catch (Exception ex)
            {
                return Results.Problem($"Verification failed: {ex.Message}");
            }
        });

        /// <summary>
        /// Test endpoint - Verify face match
        /// </summary>
        group.MapPost("/face-match", async (
            [FromBody] FaceMatchRequest request,
            VerificationService verificationService
        ) =>
        {
            try
            {
                var result = await verificationService.VerifyFaceMatchAsync(
                    request.IdPhoto,
                    request.CapturedPhoto
                );
                return Results.Ok(result);
            }
            catch (Exception ex)
            {
                return Results.Problem($"Face verification failed: {ex.Message}");
            }
        });

        /// <summary>
        /// Health check for Python service
        /// </summary>
        group.MapGet("/health", async (VerificationService verificationService) =>
        {
            try
            {
                var httpClient = new HttpClient();
                var response = await httpClient.GetAsync("http://localhost:5001/health");
                
                if (response.IsSuccessStatusCode)
                {
                    return Results.Ok(new
                    {
                        status = "OK",
                        message = "Python verification service is running",
                        pythonService = "http://localhost:5001"
                    });
                }
                else
                {
                    return Results.Ok(new
                    {
                        status = "ERROR",
                        message = "Python verification service is not responding"
                    });
                }
            }
            catch
            {
                return Results.Ok(new
                {
                    status = "ERROR",
                    message = "Cannot connect to Python verification service"
                });
            }
        });
    }
}

// Request DTOs
public record AadhaarVerifyRequest(string AadhaarImage);
public record FaceMatchRequest(string IdPhoto, string CapturedPhoto);