using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Endpoints
{
    public static class VerificationEndpoints
    {
        public static void MapVerificationEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/verification").WithTags("Verification");

            /// <summary>
            /// Health check for Python verification service
            /// </summary>
            group.MapGet("/health", async () =>
            {
                try
                {
                    var httpClient = new HttpClient();
                    httpClient.Timeout = TimeSpan.FromSeconds(5);
                    var response = await httpClient.GetAsync("http://localhost:5001/health");
                    
                    if (response.IsSuccessStatusCode)
                    {
                        var content = await response.Content.ReadAsStringAsync();
                        return Results.Ok(new
                        {
                            status = "OK",
                            message = "Python verification service is running",
                            pythonService = "http://localhost:5001",
                            details = content
                        });
                    }
                    else
                    {
                        return Results.Ok(new
                        {
                            status = "ERROR",
                            message = "Python verification service returned error",
                            statusCode = (int)response.StatusCode
                        });
                    }
                }
                catch (Exception ex)
                {
                    return Results.Ok(new
                    {
                        status = "ERROR",
                        message = "Cannot connect to Python verification service",
                        error = ex.Message
                    });
                }
            });

            /// <summary>
            /// Test face matching service directly
            /// </summary>
            group.MapPost("/test-face-match", async (
                [FromBody] TestFaceMatchRequest request,
                VerificationService verificationService
            ) =>
            {
                try
                {
                    var result = await verificationService.FaceMatchAsync(
                        request.IdPhotoBase64,
                        request.CapturedPhotoBase64
                    );
                    
                    return Results.Ok(new
                    {
                        success = true,
                        result = result
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
        }
    }

    public record TestFaceMatchRequest(string IdPhotoBase64, string CapturedPhotoBase64);
}