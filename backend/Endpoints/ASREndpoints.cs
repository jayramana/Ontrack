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
    public static RouteGroupBuilder MapASREndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/asr").WithTags("ASR Verification");


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
        /// Driver retries verification (resets status to Pending)
        /// </summary>
        group.MapPost("/driver/retry/{asrId}", async (
            int asrId,
            ASRService asrService,
            IHubContext<LogisticsHub> hubContext
        ) =>
        {
            try
            {
                var asr = await asrService.RetryVerificationAsync(asrId);

                // Notify Customer to re-check/edit
                 if (asr.CustomerId != 0)
                {
                    try
                    {
                        await hubContext.Clients
                            .Group($"Customer_{asr.CustomerId}")
                            .SendAsync("ASRRetryRequested", new
                            {
                                asrId = asr.Id,
                                orderId = asr.OrderId,
                                message = "Driver has requested to retry verification. Please check/edit your documents."
                            });
                    }
                    catch { }
                }

                return Results.Ok(new { message = "Retry initiated", asr });
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "driver,Driver" });

        /// <summary>
        /// Driver resets verification (Hard Reset - Clears all data)
        /// </summary>
        group.MapPost("/driver/reset/{asrId}", async (
            int asrId,
            ASRService asrService,
            IHubContext<LogisticsHub> hubContext
        ) =>
        {
            try
            {
                var asr = await asrService.ResetVerificationAsync(asrId);

                // Notify Customer to start over
                 if (asr.CustomerId != 0)
                {
                    try
                    {
                        await hubContext.Clients
                            .Group($"Customer_{asr.CustomerId}")
                            .SendAsync("ASRResetRequested", new
                            {
                                asrId = asr.Id,
                                orderId = asr.OrderId,
                                message = "Driver has reset the verification process. Please upload your documents again."
                            });
                    }
                    catch { }
                }

                return Results.Ok(new { message = "Verification reset successfully", asr });
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "driver,Driver" });

        /// <summary>
        /// Driver re-initiates ASR for a reassigned order (resets to Pending, allows customer to re-upload)
        /// </summary>
        group.MapPost("/driver/reinitiate/{orderId}", async (
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
                
                // Get existing ASR
                var asr = await context.ASRVerifications
                    .FirstOrDefaultAsync(a => a.OrderId == orderId);
                
                if (asr == null)
                    return Results.NotFound(new { message = "No ASR verification found for this order" });

                // Update ASR to allow re-upload
                asr.DriverId = driverId; // Update to new driver
                asr.AIVerifyStatus = "Pending";
                asr.AIVerifyReasons = "[]"; // Clear previous errors
                asr.RetryCount++;
                
                // Clear old verification data to force fresh upload
                asr.DocumentUrls = "[]";
                asr.AadhaarNumber = "";
                asr.CustomerPhotoUrl = null;
                asr.SignatureUrl = null;
                asr.CustomerUploadedAt = null;
                asr.VerifiedAt = null;
                asr.AIVerifyScore = null;
                asr.VerificationMetadata = null;
                
                await context.SaveChangesAsync();

                // Update order ASR status
                var order = await context.Orders.FindAsync(orderId);
                if (order != null)
                {
                    order.ASRStatus = "Pending";
                    await context.SaveChangesAsync();
                }

                // Notify customer to upload documents
                if (asr.CustomerId != 0)
                {
                    try
                    {
                        await hubContext.Clients
                            .Group($"Customer_{asr.CustomerId}")
                            .SendAsync("ASRVerificationRequested", new
                            {
                                orderId = order?.Id,
                                trackingId = order?.TrackingId,
                                asrId = asr.Id,
                                message = "Your order has been reassigned. Please upload your ASR documents again."
                            });
                    }
                    catch { }
                }

                return Results.Ok(new 
                { 
                    message = "ASR re-initiated successfully. Customer can now upload documents.",
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
        /// Driver opens Step 1 for customer to re-edit documents (Non-destructive)
        /// </summary>
        group.MapPost("/driver/open-step1/{asrId}", async (
            int asrId,
            ASRService asrService,
            IHubContext<LogisticsHub> hubContext
        ) =>
        {
            try
            {
                var asr = await asrService.OpenStep1ForCustomerAsync(asrId);

                // Notify Customer that they can re-edit
                if (asr.CustomerId != 0)
                {
                    try
                    {
                        await hubContext.Clients
                            .Group($"Customer_{asr.CustomerId}")
                            .SendAsync("ASRReopenedForEditing", new
                            {
                                asrId = asr.Id,
                                orderId = asr.OrderId,
                                message = "Driver has opened Step 1. You can now re-edit and reupload your documents."
                            });
                    }
                    catch { }
                }

                return Results.Ok(new { message = "Step 1 opened for customer", asr });
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
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

                var documents = JsonSerializer.Deserialize<List<string>>(asr.DocumentUrls ?? "[]")
                    ?? new List<string>();
                
                // Convert keys to URLs
                var documentUrls = documents.Select(k => asrService.GetPresignedUrl(k)).ToList();
                var customerPhotoUrl = asrService.GetPresignedUrl(asr.CustomerPhotoUrl);
                var signatureUrl = asrService.GetPresignedUrl(asr.SignatureUrl);

                return Results.Ok(new
                {
                    asrId = asr.Id,
                    status = asr.AIVerifyStatus,
                    score = asr.AIVerifyScore,
                    reasons = reasons,
                    hasDocuments = documents.Any(),
                    documentUrls = documentUrls,
                    customerPhotoUrl = customerPhotoUrl,
                    signatureUrl = signatureUrl,
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

                // Convert keys to URLs for customer view
                var documents = JsonSerializer.Deserialize<List<string>>(asr.DocumentUrls ?? "[]") ?? new List<string>();
                var documentUrls = documents.Select(k => asrService.GetPresignedUrl(k)).ToList();

                return Results.Ok(new
                {
                    asrId = asr.Id,
                    status = asr.AIVerifyStatus,
                    requestedAt = asr.RequestedAt,
                    uploadedAt = asr.CustomerUploadedAt,
                    verifiedAt = asr.VerifiedAt,
                    retryCount = asr.RetryCount,
                    aadhaarNumber = asr.AadhaarNumber,
                    documentUrls = documentUrls // Return the actual URLs so customer can see what they uploaded
                });
            }
            catch (Exception ex)
            {
                return Results.Problem($"Error: {ex.Message}");
            }
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "customer" });

        /// <summary>
        /// Customer requests manual reverification
        /// </summary>
        group.MapPost("/customer/request-reverify/{asrId}", async (
            int asrId,
            HttpContext http,
            ASRService asrService
        ) =>
        {
            try
            {
                var customerIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
                if (customerIdClaim == null) return Results.Unauthorized();
                var customerId = int.Parse(customerIdClaim.Value);

                var asr = await asrService.RequestReverificationAsync(asrId, customerId);

                return Results.Ok(new { message = "Reverification requested successfully", asr });
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
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
                        a.CustomerReverifyRequested, // 🆕 Added
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

                var keys = JsonSerializer.Deserialize<List<string>>(asr.DocumentUrls ?? "[]") 
                    ?? new List<string>();
                
                var documentUrls = keys.Select(k => asrService.GetPresignedUrl(k)).ToList();
                var customerPhotoUrl = asrService.GetPresignedUrl(asr.CustomerPhotoUrl);
                var signatureUrl = asrService.GetPresignedUrl(asr.SignatureUrl);

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
                    customerPhotoUrl = customerPhotoUrl,
                    signatureUrl = signatureUrl,
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
        return group;
    }
}