using Backend.Data;
using Backend.Domain.Entity;
using Backend.DTO;
using Backend.Hubs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

public static class ASREndpoints
{
    public static void MapASREndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/asr").WithTags("ASR Verification");

        // ======================================================
        // DRIVER ENDPOINTS
        // ======================================================

        /// <summary>
        /// Driver initiates ASR verification
        /// </summary>
        group.MapPost("/driver/initiate/{orderId}", async (
            int orderId,
            HttpContext http,
            ASRService asrService,
            AppDbContext context,
            IHubContext<LogisticsHub> hub
        ) =>
        {
            var driverId = int.Parse(
                http.User.FindFirst("id")?.Value ??
                http.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                "0"
            );

            var asr = await asrService.CreateASRRequestAsync(orderId, driverId);

            var order = await context.Orders.FindAsync(orderId);
            if (order?.CustomerId != null)
            {
                await hub.Clients
                    .Group($"Customer_{order.CustomerId}")
                    .SendAsync("ASRVerificationRequested", new
                    {
                        orderId = order.Id,
                        trackingId = order.TrackingId,
                        asrId = asr.Id,
                        message = "Driver requested ASR verification. Upload ID documents."
                    });
            }

            return Results.Ok(new
            {
                message = "ASR initiated",
                asrId = asr.Id,
                status = asr.AIVerifyStatus
            });
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "driver,Driver" });

        /// <summary>
        /// Driver uploads photo & signature (may auto-verify)
        /// </summary>
        group.MapPost("/driver/upload-captures/{asrId}", async (
            int asrId,
            ASRDriverCaptureDto dto,
            AppDbContext context,
            VerificationService verificationService,
            IHubContext<LogisticsHub> hub
        ) =>
        {
            var asr = await context.ASRVerifications
                .Include(a => a.Order)
                .FirstOrDefaultAsync(a => a.Id == asrId);

            if (asr == null)
                return Results.NotFound();

            asr.CustomerPhotoUrl = dto.CustomerPhotoUrl;
            asr.SignatureUrl = dto.SignatureUrl;
            asr.AIVerifyStatus = "InProgress";
            await context.SaveChangesAsync();

            var documents = JsonSerializer.Deserialize<List<string>>(asr.DocumentUrls ?? "[]");

            if (documents == null || !documents.Any())
            {
                return Results.Ok(new
                {
                    message = "Waiting for customer documents"
                });
            }

            var result = await verificationService.VerifyCompleteASRAsync(
                documents,
                dto.CustomerPhotoUrl,
                dto.SignatureUrl
            );

            asr.AIVerifyScore = result.Score;
            asr.AIVerifyReasons = JsonSerializer.Serialize(result.Reasons);
            asr.AIVerifyStatus = result.Verified ? "Success" : "Failed";
            asr.VerifiedAt = DateTime.UtcNow;

            if (result.AadhaarData != null)
            {
                asr.VerificationMetadata = JsonSerializer.Serialize(result);
            }

            if (asr.Order != null)
                asr.Order.ASRStatus = asr.AIVerifyStatus;

            await context.SaveChangesAsync();

            if (asr.DriverId.HasValue)
            {
                await hub.Clients
                    .Group($"Driver_{asr.DriverId}")
                    .SendAsync("ASRVerificationCompleted", new
                    {
                        asrId,
                        status = asr.AIVerifyStatus,
                        score = asr.AIVerifyScore,
                        reasons = result.Reasons
                    });
            }

            return Results.Ok(new
            {
                status = asr.AIVerifyStatus,
                score = asr.AIVerifyScore,
                reasons = result.Reasons
            });
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "driver,Driver" });

        /// <summary>
        /// Driver checks ASR status
        /// </summary>
        group.MapGet("/driver/status/{orderId}", async (
            int orderId,
            AppDbContext context
        ) =>
        {
            var asr = await context.ASRVerifications
                .FirstOrDefaultAsync(a => a.OrderId == orderId);

            if (asr == null)
                return Results.NotFound();

            return Results.Ok(new
            {
                asr.Id,
                asr.AIVerifyStatus,
                asr.AIVerifyScore,
                reasons = JsonSerializer.Deserialize<List<string>>(asr.AIVerifyReasons ?? "[]"),
                retryCount = asr.RetryCount,
                hasDocuments = !string.IsNullOrEmpty(asr.DocumentUrls) && asr.DocumentUrls != "[]",
                hasPhoto = !string.IsNullOrEmpty(asr.CustomerPhotoUrl)
            });
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "driver,Driver" });


        /// <summary>
        /// Customer checks ASR status
        /// </summary>
        group.MapGet("/customer/status/{orderId}", async (
            int orderId,
            AppDbContext context
        ) =>
        {
            var asr = await context.ASRVerifications
                .FirstOrDefaultAsync(a => a.OrderId == orderId);

            if (asr == null)
                return Results.NotFound();

            return Results.Ok(new
            {
                asrId = asr.Id,
                status = asr.AIVerifyStatus,
                hasDocuments = !string.IsNullOrEmpty(asr.DocumentUrls),
                hasPhoto = !string.IsNullOrEmpty(asr.CustomerPhotoUrl),
                isVerified = asr.AIVerifyStatus == "Success"
            });
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "customer" });

        /// <summary>
        /// Customer uploads documents
        /// </summary>
        group.MapPost("/customer/upload-documents/{asrId}", async (
            int asrId,
            ASRCustomerDocumentDto dto,
            AppDbContext context,
            VerificationService verificationService,
            IHubContext<LogisticsHub> hub
        ) =>
        {
            var asr = await context.ASRVerifications
                .Include(a => a.Order)
                .FirstOrDefaultAsync(a => a.Id == asrId);

            if (asr == null)
                return Results.NotFound();

            asr.DocumentUrls = JsonSerializer.Serialize(dto.DocumentUrls);
            asr.CustomerUploadedAt = DateTime.UtcNow;
            await context.SaveChangesAsync();

            // Notify Driver
            if (asr.DriverId.HasValue)
            {
                await hub.Clients
                    .Group($"Driver_{asr.DriverId}")
                    .SendAsync("CustomerDocumentsUploaded", new
                    {
                        orderId = asr.OrderId,
                        asrId = asr.Id,
                        message = "Customer has uploaded ID documents"
                    });
            }

            if (!string.IsNullOrEmpty(asr.CustomerPhotoUrl) &&
                !string.IsNullOrEmpty(asr.SignatureUrl))
            {
                var result = await verificationService.VerifyCompleteASRAsync(
                    dto.DocumentUrls,
                    asr.CustomerPhotoUrl,
                    asr.SignatureUrl
                );

                asr.AIVerifyScore = result.Score;
                asr.AIVerifyReasons = JsonSerializer.Serialize(result.Reasons);
                asr.AIVerifyStatus = result.Verified ? "Success" : "Failed";
                asr.VerifiedAt = DateTime.UtcNow;

                if (asr.Order != null)
                    asr.Order.ASRStatus = asr.AIVerifyStatus;

                await context.SaveChangesAsync();

                if (asr.DriverId.HasValue)
                {
                    await hub.Clients
                        .Group($"Driver_{asr.DriverId}")
                        .SendAsync("ASRVerificationCompleted", new
                        {
                            asr.Id,
                            status = asr.AIVerifyStatus
                        });
                }
            }

            return Results.Ok(new { message = "Documents uploaded" });
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "customer" });

        // ======================================================
        // ADMIN ENDPOINTS
        // ======================================================

        group.MapGet("/admin/list", async (AppDbContext context) =>
        {
            var list = await context.ASRVerifications
                .Include(a => a.Order)
                .Include(a => a.Customer)
                .Include(a => a.Driver)
                .OrderByDescending(a => a.RequestedAt)
                .Select(a => new
                {
                    a.Id,
                    a.OrderId,
                    a.AIVerifyStatus,
                    a.AIVerifyScore,
                    a.RetryCount
                })
                .ToListAsync();

            return Results.Ok(list);
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "admin" });

        group.MapPost("/admin/override/{asrId}", async (
            int asrId,
            ASRAdminOverrideDto dto,
            HttpContext http,
            ASRService asrService,
            IHubContext<LogisticsHub> hub
        ) =>
        {
            var adminId = int.Parse(
                http.User.FindFirst("id")?.Value ??
                http.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                "0"
            );

            var asr = await asrService.AdminOverrideAsync(asrId, adminId, dto.Reason);

            if (asr.DriverId.HasValue)
            {
                await hub.Clients
                    .Group($"Driver_{asr.DriverId}")
                    .SendAsync("ASRAdminOverride", new
                    {
                        asrId,
                        reason = dto.Reason
                    });
            }

            return Results.Ok(asr);
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "admin" });
    }
}
