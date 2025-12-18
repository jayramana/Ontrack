using Backend.Data;
using Backend.Domain.Entity;
using Backend.Hubs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using Backend.DTO;

public static class ASREndpoints
{
    public static void MapASREndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/asr").WithTags("ASR Verification");

        // ============================================
        // DRIVER ENDPOINTS
        // ============================================

        /// <summary>
        /// Driver initiates ASR verification request
        /// </summary>
        group.MapPost("/driver/initiate/{orderId}", async (
            int orderId,
            HttpContext http,
            AppDbContext context,
            ASRService asrService,
            IHubContext<LogisticsHub> hubContext
        ) =>
        {
            try
            {
                var driverIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
                if (driverIdClaim == null)
                    return Results.Unauthorized();

                var driverId = int.Parse(driverIdClaim.Value);
                var asr = await asrService.CreateASRRequestAsync(orderId, driverId);

                // Notify customer
                var order = await context.Orders.FindAsync(orderId);
                if (order?.CustomerId != null)
                {
                    try
                    {
                        await hubContext.Clients
                            .Group($"Customer_{order.CustomerId.Value}")
                            .SendAsync("ASRVerificationRequested", new
                            {
                                orderId = order.Id,
                                trackingId = order.TrackingId,
                                asrId = asr.Id,
                                message = "Driver has requested ASR verification. Please upload your documents."
                            });
                    }
                    catch { }
                }

                return Results.Ok(new
                {
                    message = "ASR verification initiated successfully",
                    asrId = asr.Id,
                    status = asr.AIVerifyStatus
                });
            }
            catch (Exception ex)
            {
                return Results.Problem($"Error: {ex.Message}");
            }
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "driver,Driver" });

        /// <summary>
        /// Driver uploads customer photo and signature
        /// Triggers AI verification if customer documents already uploaded
        /// </summary>
        group.MapPost("/driver/upload-captures/{asrId}", async (
            int asrId,
            ASRDriverCaptureDto dto,
            AppDbContext context,
            ASRService asrService,
            IHubContext<LogisticsHub> hubContext
        ) =>
        {
            try
            {
                var asr = await asrService.UploadDriverCapturesAsync(
                    asrId, 
                    dto.CustomerPhotoUrl, 
                    dto.SignatureUrl
                );

                // Check if we can proceed with verification
                var documentUrls = JsonSerializer.Deserialize<List<string>>(asr.DocumentUrls ?? "[]");
                
                if (documentUrls == null || !documentUrls.Any() || string.IsNullOrEmpty(asr.AadhaarNumber))
                {
                    return Results.Ok(new
                    {
                        message = "Driver captures uploaded. Waiting for customer documents.",
                        asr
                    });
                }

                // All data available - run verification
                Console.WriteLine($"🔄 Starting AI verification for ASR ID: {asrId}");
                asr = await asrService.PerformAIVerificationAsync(asrId);

                // Notify driver of results
                if (asr.DriverId.HasValue)
                {
                    try
                    {
                        var reasons = JsonSerializer.Deserialize<List<string>>(asr.AIVerifyReasons ?? "[]") 
                            ?? new List<string>();

                        await hubContext.Clients
                            .Group($"Driver_{asr.DriverId.Value}")
                            .SendAsync("ASRVerificationCompleted", new
                            {
                                asrId = asr.Id,
                                orderId = asr.OrderId,
                                status = asr.AIVerifyStatus,
                                score = asr.AIVerifyScore,
                                reasons = reasons
                            });
                    }
                    catch { }
                }

                var resultReasons = JsonSerializer.Deserialize<List<string>>(asr.AIVerifyReasons ?? "[]") 
                    ?? new List<string>();

                return Results.Ok(new
                {
                    message = asr.AIVerifyStatus == "Success" 
                        ? "✅ ASR verification successful" 
                        : "❌ ASR verification failed",
                    status = asr.AIVerifyStatus,
                    score = asr.AIVerifyScore,
                    reasons = resultReasons
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}\n{ex.StackTrace}");
                return Results.Problem($"Verification failed: {ex.Message}");
            }
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "driver,Driver" });

        /// <summary>
        /// Driver checks ASR status
        /// </summary>
        group.MapGet("/driver/status/{orderId}", async (
            int orderId,
            ASRService asrService
        ) =>
        {
            try
            {
                var asr = await asrService.GetASRVerificationAsync(orderId);
                if (asr == null)
                    return Results.NotFound(new { message = "No ASR verification found" });

                var reasons = JsonSerializer.Deserialize<List<string>>(asr.AIVerifyReasons ?? "[]") 
                    ?? new List<string>();

                var metadata = string.IsNullOrEmpty(asr.VerificationMetadata) 
                    ? null 
                    : JsonSerializer.Deserialize<object>(asr.VerificationMetadata);

                return Results.Ok(new
                {
                    asrId = asr.Id,
                    status = asr.AIVerifyStatus,
                    score = asr.AIVerifyScore,
                    reasons = reasons,
                    hasDocuments = !string.IsNullOrEmpty(asr.DocumentUrls) && asr.DocumentUrls != "[]",
                    hasAadhaarNumber = !string.IsNullOrEmpty(asr.AadhaarNumber),
                    hasPhoto = !string.IsNullOrEmpty(asr.CustomerPhotoUrl),
                    hasSignature = !string.IsNullOrEmpty(asr.SignatureUrl),
                    retryCount = asr.RetryCount,
                    metadata = metadata
                });
            }
            catch (Exception ex)
            {
                return Results.Problem($"Error: {ex.Message}");
            }
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "driver,Driver" });

        // ============================================
        // CUSTOMER ENDPOINTS
        // ============================================

        /// <summary>
        /// Customer uploads documents and Aadhaar number
        /// Triggers AI verification if driver captures already uploaded
        /// </summary>
        group.MapPost("/customer/upload-documents/{asrId}", async (
            int asrId,
            ASRCustomerDocumentDto dto,
            AppDbContext context,
            ASRService asrService,
            IHubContext<LogisticsHub> hubContext
        ) =>
        {
            try
            {
                var asr = await asrService.UploadCustomerDocumentsAsync(
                    asrId, 
                    dto.DocumentUrls,
                    dto.AadhaarNumber
                );

                // Notify driver
                if (asr.DriverId.HasValue)
                {
                    try
                    {
                        await hubContext.Clients
                            .Group($"Driver_{asr.DriverId.Value}")
                            .SendAsync("CustomerDocumentsUploaded", new
                            {
                                asrId = asr.Id,
                                orderId = asr.OrderId,
                                message = "Customer has uploaded ID documents"
                            });
                    }
                    catch { }
                }

                // Auto-verify if driver already captured photo/signature
                if (!string.IsNullOrEmpty(asr.CustomerPhotoUrl) && !string.IsNullOrEmpty(asr.SignatureUrl))
                {
                    Console.WriteLine($"🔄 Auto-triggering verification for ASR ID: {asrId}");
                    
                    asr = await asrService.PerformAIVerificationAsync(asrId);

                    // Notify driver
                    if (asr.DriverId.HasValue)
                    {
                        try
                        {
                            var reasons = JsonSerializer.Deserialize<List<string>>(asr.AIVerifyReasons ?? "[]") 
                                ?? new List<string>();

                            await hubContext.Clients
                                .Group($"Driver_{asr.DriverId.Value}")
                                .SendAsync("ASRVerificationCompleted", new
                                {
                                    asrId = asr.Id,
                                    orderId = asr.OrderId,
                                    status = asr.AIVerifyStatus,
                                    score = asr.AIVerifyScore,
                                    reasons = reasons
                                });
                        }
                        catch { }
                    }
                }

                return Results.Ok(new
                {
                    message = "Documents uploaded successfully",
                    asr
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}\n{ex.StackTrace}");
                return Results.Problem($"Error: {ex.Message}");
            }
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "customer" });

        /// <summary>
        /// Customer checks their ASR status
        /// </summary>
        group.MapGet("/customer/status/{orderId}", async (
            int orderId,
            HttpContext http,
            ASRService asrService
        ) =>
        {
            try
            {
                var customerIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
                if (customerIdClaim == null)
                    return Results.Unauthorized();

                var customerId = int.Parse(customerIdClaim.Value);
                var asr = await asrService.GetASRVerificationAsync(orderId);

                if (asr == null || asr.CustomerId != customerId)
                    return Results.NotFound(new { message = "No ASR verification found" });

                return Results.Ok(new
                {
                    asrId = asr.Id,
                    status = asr.AIVerifyStatus,
                    requestedAt = asr.RequestedAt,
                    uploadedAt = asr.CustomerUploadedAt,
                    verifiedAt = asr.VerifiedAt,
                    retryCount = asr.RetryCount
                });
            }
            catch (Exception ex)
            {
                return Results.Problem($"Error: {ex.Message}");
            }
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "customer" });

        // ============================================
        // ADMIN ENDPOINTS
        // ============================================

        /// <summary>
        /// Admin gets all ASR verifications
        /// </summary>
        group.MapGet("/admin/list", async (AppDbContext context) =>
        {
            try
            {
                var asrList = await context.ASRVerifications
                    .Include(a => a.Order)
                    .Include(a => a.Customer)
                    .Include(a => a.Driver)
                    .OrderByDescending(a => a.RequestedAt)
                    .Select(a => new
                    {
                        a.Id,
                        a.OrderId,
                        trackingId = a.Order != null ? a.Order.TrackingId : "",
                        customerName = a.Customer != null ? a.Customer.UserFName + " " + a.Customer.UserLName : "",
                        driverName = a.Driver != null ? a.Driver.UserFName + " " + a.Driver.UserLName : "",
                        a.AIVerifyStatus,
                        a.AIVerifyScore,
                        a.RequestedAt,
                        a.VerifiedAt,
                        a.IsAdminOverride,
                        a.RetryCount
                    })
                    .ToListAsync();

                return Results.Ok(asrList);
            }
            catch
            {
                return Results.Ok(new List<object>());
            }
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "admin" });

        /// <summary>
        /// Admin gets detailed ASR verification
        /// </summary>
        group.MapGet("/admin/details/{asrId}", async (
            int asrId,
            ASRService asrService
        ) =>
        {
            try
            {
                var asr = await asrService.GetASRVerificationAsync(asrId);
                if (asr == null)
                    return Results.NotFound(new { message = "ASR verification not found" });

                var documentUrls = JsonSerializer.Deserialize<List<string>>(asr.DocumentUrls ?? "[]") 
                    ?? new List<string>();
                var reasons = JsonSerializer.Deserialize<List<string>>(asr.AIVerifyReasons ?? "[]") 
                    ?? new List<string>();
                var metadata = string.IsNullOrEmpty(asr.VerificationMetadata) 
                    ? null 
                    : JsonSerializer.Deserialize<object>(asr.VerificationMetadata);

                return Results.Ok(new
                {
                    asr.Id,
                    asr.OrderId,
                    documentUrls = documentUrls,
                    asr.AadhaarNumber,
                    asr.CustomerPhotoUrl,
                    asr.SignatureUrl,
                    asr.AIVerifyStatus,
                    asr.AIVerifyScore,
                    reasons = reasons,
                    metadata = metadata,
                    asr.RequestedAt,
                    asr.CustomerUploadedAt,
                    asr.VerifiedAt,
                    asr.IsAdminOverride,
                    asr.OverrideReason,
                    asr.RetryCount
                });
            }
            catch (Exception ex)
            {
                return Results.Problem($"Error: {ex.Message}");
            }
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "admin" });

        /// <summary>
        /// Admin override ASR failure
        /// </summary>
        group.MapPost("/admin/override/{asrId}", async (
            int asrId,
            ASRAdminOverrideDto dto,
            HttpContext http,
            ASRService asrService,
            IHubContext<LogisticsHub> hubContext
        ) =>
        {
            try
            {
                var adminIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
                if (adminIdClaim == null)
                    return Results.Unauthorized();

                var adminId = int.Parse(adminIdClaim.Value);
                var asr = await asrService.AdminOverrideAsync(asrId, adminId, dto.Reason);

                // Notify driver
                if (asr.DriverId.HasValue)
                {
                    try
                    {
                        await hubContext.Clients
                            .Group($"Driver_{asr.DriverId.Value}")
                            .SendAsync("ASRAdminOverride", new
                            {
                                asrId = asr.Id,
                                orderId = asr.OrderId,
                                message = "Admin has approved ASR verification",
                                reason = dto.Reason
                            });
                    }
                    catch { }
                }

                return Results.Ok(new
                {
                    message = "ASR verification overridden by admin",
                    asr
                });
            }
            catch (Exception ex)
            {
                return Results.Problem($"Error: {ex.Message}");
            }
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "admin" });

        /// <summary>
        /// Admin triggers re-verification
        /// </summary>
        group.MapPost("/admin/reverify/{asrId}", async (
            int asrId,
            ASRService asrService
        ) =>
        {
            try
            {
                var asr = await asrService.PerformAIVerificationAsync(asrId);

                var reasons = JsonSerializer.Deserialize<List<string>>(asr.AIVerifyReasons ?? "[]") 
                    ?? new List<string>();

                return Results.Ok(new
                {
                    message = "Re-verification completed",
                    status = asr.AIVerifyStatus,
                    score = asr.AIVerifyScore,
                    reasons = reasons,
                    retryCount = asr.RetryCount
                });
            }
            catch (Exception ex)
            {
                return Results.Problem($"Error: {ex.Message}");
            }
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "admin" });
    }
}