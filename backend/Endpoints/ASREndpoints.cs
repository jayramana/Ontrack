// // // using Backend.Data;
// // // using Backend.Domain.Entity;
// // // using Backend.Hubs;
// // // using Backend.Services;
// // // using Microsoft.AspNetCore.Authorization;
// // // using Microsoft.AspNetCore.SignalR;
// // // using Microsoft.EntityFrameworkCore;
// // // using System.Security.Claims;
// // // using System.Text.Json;

// // // public static class ASREndpoints
// // // {
// // //     public static void MapASREndpoints(this IEndpointRouteBuilder app)
// // //     {
// // //         var group = app.MapGroup("/api/asr").WithTags("ASR Verification");

// // //         // ============================================
// // //         // DRIVER ENDPOINTS
// // //         // ============================================

// // //         /// <summary>
// // //         /// Driver initiates ASR verification for an order
// // //         /// </summary>
// // //         group.MapPost("/driver/initiate/{orderId}", async (
// // //             int orderId,
// // //             HttpContext http,
// // //             AppDbContext context,
// // //             ASRService asrService,
// // //             IHubContext<LogisticsHub> hubContext
// // //         ) =>
// // //         {
// // //             var driverIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
// // //             var driverId = int.Parse(driverIdClaim?.Value ?? "0");

// // //             var order = await context.Orders
// // //                 .Include(o => o.Customer)
// // //                 .FirstOrDefaultAsync(o => o.Id == orderId);

// // //             if (order == null)
// // //                 return Results.NotFound(new { message = "Order not found" });

// // //             if (!order.IsASR)
// // //                 return Results.BadRequest(new { message = "Order does not require ASR" });

// // //             var asr = await asrService.CreateASRRequestAsync(orderId, driverId);

// // //             // Notify customer via SignalR
// // //             if (order.CustomerId.HasValue)
// // //             {
// // //                 await hubContext.Clients
// // //                     .Group($"Customer_{order.CustomerId.Value}")
// // //                     .SendAsync("ASRVerificationRequested", new
// // //                     {
// // //                         orderId = order.Id,
// // //                         trackingId = order.TrackingId,
// // //                         asrId = asr.Id,
// // //                         message = "Driver has requested ASR verification. Please upload your ID documents."
// // //                     });
// // //             }

// // //             return Results.Ok(new
// // //             {
// // //                 message = "ASR verification initiated",
// // //                 asrId = asr.Id,
// // //                 status = asr.AIVerifyStatus
// // //             });
// // //         })
// // //         .RequireAuthorization(new AuthorizeAttribute { Roles = "driver,Driver" });

// // //         /// <summary>
// // //         /// Driver uploads customer photo and signature
// // //         /// </summary>
// // //         group.MapPost("/driver/upload-captures/{asrId}", async (
// // //             int asrId,
// // //             ASRDriverCaptureDto dto,
// // //             AppDbContext context,
// // //             ASRService asrService,
// // //             IHubContext<LogisticsHub> hubContext
// // //         ) =>
// // //         {
// // //             var asr = await asrService.UploadDriverCapturesAsync(
// // //                 asrId,
// // //                 dto.CustomerPhotoUrl,
// // //                 dto.SignatureUrl
// // //             );

// // //             // Check if customer has uploaded documents
// // //             var documentUrls = JsonSerializer.Deserialize<List<string>>(asr.DocumentUrls);
            
// // //             if (documentUrls != null && documentUrls.Any())
// // //             {
// // //                 // Trigger AI verification
// // //                 asr = await asrService.PerformAIVerificationAsync(asrId);

// // //                 // Notify driver of results
// // //                 await hubContext.Clients
// // //                     .Group($"Driver_{asr.DriverId}")
// // //                     .SendAsync("ASRVerificationCompleted", new
// // //                     {
// // //                         asrId = asr.Id,
// // //                         orderId = asr.OrderId,
// // //                         status = asr.AIVerifyStatus,
// // //                         score = asr.AIVerifyScore,
// // //                         reasons = JsonSerializer.Deserialize<List<string>>(asr.AIVerifyReasons ?? "[]")
// // //                     });
// // //             }

// // //             return Results.Ok(new
// // //             {
// // //                 message = "Driver captures uploaded successfully",
// // //                 asr
// // //             });
// // //         })
// // //         .RequireAuthorization(new AuthorizeAttribute { Roles = "driver,Driver" });

// // //         /// <summary>
// // //         /// Driver checks ASR status for an order
// // //         /// </summary>
// // //         group.MapGet("/driver/status/{orderId}", async (
// // //             int orderId,
// // //             ASRService asrService
// // //         ) =>
// // //         {
// // //             var asr = await asrService.GetASRVerificationAsync(orderId);

// // //             if (asr == null)
// // //                 return Results.NotFound(new { message = "No ASR verification found for this order" });

// // //             return Results.Ok(new
// // //             {
// // //                 asrId = asr.Id,
// // //                 status = asr.AIVerifyStatus,
// // //                 score = asr.AIVerifyScore,
// // //                 reasons = JsonSerializer.Deserialize<List<string>>(asr.AIVerifyReasons ?? "[]"),
// // //                 hasDocuments = !string.IsNullOrEmpty(asr.DocumentUrls) && asr.DocumentUrls != "[]",
// // //                 hasPhoto = !string.IsNullOrEmpty(asr.CustomerPhotoUrl),
// // //                 hasSignature = !string.IsNullOrEmpty(asr.SignatureUrl),
// // //                 retryCount = asr.RetryCount
// // //             });
// // //         })
// // //         .RequireAuthorization(new AuthorizeAttribute { Roles = "driver,Driver" });

// // //         // ============================================
// // //         // CUSTOMER ENDPOINTS
// // //         // ============================================

// // //         /// <summary>
// // //         /// Customer uploads ID documents
// // //         /// </summary>
// // //         group.MapPost("/customer/upload-documents/{asrId}", async (
// // //             int asrId,
// // //             ASRCustomerDocumentDto dto,
// // //             AppDbContext context,
// // //             ASRService asrService,
// // //             IHubContext<LogisticsHub> hubContext
// // //         ) =>
// // //         {
// // //             var asr = await asrService.UploadCustomerDocumentsAsync(asrId, dto.DocumentUrls);

// // //             // Notify driver
// // //             if (asr.DriverId.HasValue)
// // //             {
// // //                 await hubContext.Clients
// // //                     .Group($"Driver_{asr.DriverId.Value}")
// // //                     .SendAsync("CustomerDocumentsUploaded", new
// // //                     {
// // //                         asrId = asr.Id,
// // //                         orderId = asr.OrderId,
// // //                         message = "Customer has uploaded ID documents"
// // //                     });
// // //             }

// // //             return Results.Ok(new
// // //             {
// // //                 message = "Documents uploaded successfully",
// // //                 asr
// // //             });
// // //         })
// // //         .RequireAuthorization(new AuthorizeAttribute { Roles = "customer" });

// // //         /// <summary>
// // //         /// Customer gets their ASR verification status
// // //         /// </summary>
// // //         group.MapGet("/customer/status/{orderId}", async (
// // //             int orderId,
// // //             HttpContext http,
// // //             AppDbContext context,
// // //             ASRService asrService
// // //         ) =>
// // //         {
// // //             var customerIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
// // //             var customerId = int.Parse(customerIdClaim?.Value ?? "0");

// // //             var asr = await context.ASRVerifications
// // //                 .Include(a => a.Order)
// // //                 .FirstOrDefaultAsync(a => a.OrderId == orderId && a.CustomerId == customerId);

// // //             if (asr == null)
// // //                 return Results.NotFound(new { message = "No ASR verification found" });

// // //             return Results.Ok(new
// // //             {
// // //                 asrId = asr.Id,
// // //                 status = asr.AIVerifyStatus,
// // //                 requestedAt = asr.RequestedAt,
// // //                 uploadedAt = asr.CustomerUploadedAt,
// // //                 verifiedAt = asr.VerifiedAt,
// // //                 retryCount = asr.RetryCount
// // //             });
// // //         })
// // //         .RequireAuthorization(new AuthorizeAttribute { Roles = "customer" });

// // //         // ============================================
// // //         // ADMIN ENDPOINTS
// // //         // ============================================

// // //         /// <summary>
// // //         /// Admin gets all ASR verifications (pending review)
// // //         /// </summary>
// // //         group.MapGet("/admin/list", async (AppDbContext context) =>
// // //         {
// // //             var asrList = await context.ASRVerifications
// // //                 .Include(a => a.Order)
// // //                 .Include(a => a.Customer)
// // //                 .Include(a => a.Driver)
// // //                 .OrderByDescending(a => a.RequestedAt)
// // //                 .Select(a => new
// // //                 {
// // //                     a.Id,
// // //                     a.OrderId,
// // //                     trackingId = a.Order != null ? a.Order.TrackingId : "",
// // //                     customerName = a.Customer != null ? a.Customer.UserFName + " " + a.Customer.UserLName : "",
// // //                     driverName = a.Driver != null ? a.Driver.UserFName + " " + a.Driver.UserLName : "",
// // //                     a.AIVerifyStatus,
// // //                     a.AIVerifyScore,
// // //                     a.RequestedAt,
// // //                     a.VerifiedAt,
// // //                     a.IsAdminOverride,
// // //                     a.RetryCount
// // //                 })
// // //                 .ToListAsync();

// // //             return Results.Ok(asrList);
// // //         })
// // //         .RequireAuthorization(new AuthorizeAttribute { Roles = "admin" });

// // //         /// <summary>
// // //         /// Admin gets detailed ASR verification
// // //         /// </summary>
// // //         group.MapGet("/admin/details/{asrId}", async (
// // //             int asrId,
// // //             AppDbContext context
// // //         ) =>
// // //         {
// // //             var asr = await context.ASRVerifications
// // //                 .Include(a => a.Order)
// // //                 .Include(a => a.Customer)
// // //                 .Include(a => a.Driver)
// // //                 .FirstOrDefaultAsync(a => a.Id == asrId);

// // //             if (asr == null)
// // //                 return Results.NotFound(new { message = "ASR verification not found" });

// // //             return Results.Ok(new
// // //             {
// // //                 asr.Id,
// // //                 asr.OrderId,
// // //                 order = asr.Order != null ? new
// // //                 {
// // //                     asr.Order.Id,
// // //                     asr.Order.TrackingId,
// // //                     asr.Order.ReceiverName,
// // //                     asr.Order.ReceiverAddress,
// // //                     asr.Order.Status
// // //                 } : null,
// // //                 customer = asr.Customer != null ? new
// // //                 {
// // //                     asr.Customer.UserId,
// // //                     name = asr.Customer.UserFName + " " + asr.Customer.UserLName,
// // //                     asr.Customer.UserEmail
// // //                 } : null,
// // //                 driver = asr.Driver != null ? new
// // //                 {
// // //                     asr.Driver.UserId,
// // //                     name = asr.Driver.UserFName + " " + asr.Driver.UserLName,
// // //                     asr.Driver.UserEmail
// // //                 } : null,
// // //                 documentUrls = JsonSerializer.Deserialize<List<string>>(asr.DocumentUrls),
// // //                 asr.CustomerPhotoUrl,
// // //                 asr.SignatureUrl,
// // //                 asr.AIVerifyStatus,
// // //                 asr.AIVerifyScore,
// // //                 reasons = JsonSerializer.Deserialize<List<string>>(asr.AIVerifyReasons ?? "[]"),
// // //                 asr.RequestedAt,
// // //                 asr.CustomerUploadedAt,
// // //                 asr.VerifiedAt,
// // //                 asr.IsAdminOverride,
// // //                 asr.OverrideReason,
// // //                 asr.RetryCount
// // //             });
// // //         })
// // //         .RequireAuthorization(new AuthorizeAttribute { Roles = "admin" });

// // //         /// <summary>
// // //         /// Admin overrides ASR failure
// // //         /// </summary>
// // //         group.MapPost("/admin/override/{asrId}", async (
// // //             int asrId,
// // //             ASRAdminOverrideDto dto,
// // //             HttpContext http,
// // //             AppDbContext context,
// // //             ASRService asrService,
// // //             IHubContext<LogisticsHub> hubContext
// // //         ) =>
// // //         {
// // //             var adminIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
// // //             var adminId = int.Parse(adminIdClaim?.Value ?? "0");

// // //             var asr = await asrService.AdminOverrideAsync(asrId, adminId, dto.Reason);

// // //             // Notify driver
// // //             if (asr.DriverId.HasValue)
// // //             {
// // //                 await hubContext.Clients
// // //                     .Group($"Driver_{asr.DriverId.Value}")
// // //                     .SendAsync("ASRAdminOverride", new
// // //                     {
// // //                         asrId = asr.Id,
// // //                         orderId = asr.OrderId,
// // //                         message = "Admin has approved ASR verification",
// // //                         reason = dto.Reason
// // //                     });
// // //             }

// // //             return Results.Ok(new
// // //             {
// // //                 message = "ASR verification overridden by admin",
// // //                 asr
// // //             });
// // //         })
// // //         .RequireAuthorization(new AuthorizeAttribute { Roles = "admin" });

// // //         /// <summary>
// // //         /// Trigger AI re-verification
// // //         /// </summary>
// // //         group.MapPost("/admin/reverify/{asrId}", async (
// // //             int asrId,
// // //             ASRService asrService
// // //         ) =>
// // //         {
// // //             var asr = await asrService.PerformAIVerificationAsync(asrId);

// // //             return Results.Ok(new
// // //             {
// // //                 message = "AI verification completed",
// // //                 status = asr.AIVerifyStatus,
// // //                 score = asr.AIVerifyScore,
// // //                 reasons = JsonSerializer.Deserialize<List<string>>(asr.AIVerifyReasons ?? "[]")
// // //             });
// // //         })
// // //         .RequireAuthorization(new AuthorizeAttribute { Roles = "admin" });
// // //     }
// // // }

// // // // DTOs
// // // public record ASRDriverCaptureDto(string CustomerPhotoUrl, string SignatureUrl);
// // // public record ASRCustomerDocumentDto(List<string> DocumentUrls);
// // // public record ASRAdminOverrideDto(string Reason);

// // using Backend.Data;
// // using Backend.Domain.Entity;
// // using Backend.Hubs;
// // using Backend.Services;
// // using Microsoft.AspNetCore.Authorization;
// // using Microsoft.AspNetCore.SignalR;
// // using Microsoft.EntityFrameworkCore;
// // using System.Security.Claims;
// // using System.Text.Json;

// // public static class ASREndpoints
// // {
// //     public static void MapASREndpoints(this IEndpointRouteBuilder app)
// //     {
// //         var group = app.MapGroup("/api/asr").WithTags("ASR Verification");

// //         // ============================================
// //         // DRIVER ENDPOINTS
// //         // ============================================

// //         /// <summary>
// //         /// Driver initiates ASR verification for an order
// //         /// </summary>
// //         group.MapPost("/driver/initiate/{orderId}", async (
// //             int orderId,
// //             HttpContext http,
// //             AppDbContext context,
// //             IHubContext<LogisticsHub> hubContext
// //         ) =>
// //         {
// //             try
// //             {
// //                 var driverIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
// //                 if (driverIdClaim == null)
// //                     return Results.Unauthorized();

// //                 var driverId = int.Parse(driverIdClaim.Value);

// //                 var order = await context.Orders
// //                     .Include(o => o.Customer)
// //                     .FirstOrDefaultAsync(o => o.Id == orderId);

// //                 if (order == null)
// //                     return Results.NotFound(new { message = "Order not found" });

// //                 if (!order.IsASR)
// //                     return Results.BadRequest(new { message = "Order does not require ASR" });

// //                 // Check if ASR already exists
// //                 var existingAsr = await context.ASRVerifications
// //                     .FirstOrDefaultAsync(a => a.OrderId == orderId);

// //                 if (existingAsr != null)
// //                 {
// //                     return Results.Ok(new
// //                     {
// //                         message = "ASR verification already exists",
// //                         asrId = existingAsr.Id,
// //                         status = existingAsr.AIVerifyStatus
// //                     });
// //                 }

// //                 // Create new ASR verification
// //                 var asr = new ASRVerification
// //                 {
// //                     OrderId = orderId,
// //                     CustomerId = order.CustomerId ?? 0,
// //                     DriverId = driverId,
// //                     AIVerifyStatus = "Pending",
// //                     RequestedAt = DateTime.UtcNow,
// //                     DocumentUrls = "[]"
// //                 };

// //                 context.ASRVerifications.Add(asr);
// //                 await context.SaveChangesAsync();

// //                 // Update order
// //                 order.ASRVerificationId = asr.Id;
// //                 order.ASRStatus = "Pending";
// //                 await context.SaveChangesAsync();

// //                 // Notify customer via SignalR
// //                 if (order.CustomerId.HasValue)
// //                 {
// //                     try
// //                     {
// //                         await hubContext.Clients
// //                             .Group($"Customer_{order.CustomerId.Value}")
// //                             .SendAsync("ASRVerificationRequested", new
// //                             {
// //                                 orderId = order.Id,
// //                                 trackingId = order.TrackingId,
// //                                 asrId = asr.Id,
// //                                 message = "Driver has requested ASR verification. Please upload your ID documents."
// //                             });
// //                     }
// //                     catch (Exception ex)
// //                     {
// //                         Console.WriteLine($"SignalR notification failed: {ex.Message}");
// //                     }
// //                 }

// //                 return Results.Ok(new
// //                 {
// //                     message = "ASR verification initiated",
// //                     asrId = asr.Id,
// //                     status = asr.AIVerifyStatus
// //                 });
// //             }
// //             catch (Exception ex)
// //             {
// //                 Console.WriteLine($"Error in ASR initiate: {ex.Message}\n{ex.StackTrace}");
// //                 return Results.Problem($"Internal server error: {ex.Message}");
// //             }
// //         })
// //         .RequireAuthorization(new AuthorizeAttribute { Roles = "driver,Driver" });

// //         /// <summary>
// //         /// Driver uploads customer photo and signature
// //         /// </summary>
// //         group.MapPost("/driver/upload-captures/{asrId}", async (
// //             int asrId,
// //             ASRDriverCaptureDto dto,
// //             AppDbContext context,
// //             IHubContext<LogisticsHub> hubContext
// //         ) =>
// //         {
// //             try
// //             {
// //                 var asr = await context.ASRVerifications
// //                     .Include(a => a.Order)
// //                     .FirstOrDefaultAsync(a => a.Id == asrId);

// //                 if (asr == null)
// //                     return Results.NotFound(new { message = "ASR verification not found" });

// //                 asr.CustomerPhotoUrl = dto.CustomerPhotoUrl;
// //                 asr.SignatureUrl = dto.SignatureUrl;
// //                 asr.AIVerifyStatus = "InProgress";

// //                 await context.SaveChangesAsync();

// //                 // Check if customer has uploaded documents
// //                 var documentUrls = JsonSerializer.Deserialize<List<string>>(asr.DocumentUrls ?? "[]");
                
// //                 if (documentUrls != null && documentUrls.Any())
// //                 {
// //                     // Trigger mock AI verification (since GeminiService might not be available)
// //                     asr.AIVerifyScore = 0.85;
// //                     asr.AIVerifyReasons = JsonSerializer.Serialize(new List<string> 
// //                     { 
// //                         "Document verified",
// //                         "Face match confirmed",
// //                         "Signature captured"
// //                     });
// //                     asr.AIVerifyStatus = "Success";
// //                     asr.VerifiedAt = DateTime.UtcNow;

// //                     if (asr.Order != null)
// //                     {
// //                         asr.Order.ASRStatus = "Success";
// //                     }

// //                     await context.SaveChangesAsync();

// //                     // Notify driver of results
// //                     if (asr.DriverId.HasValue)
// //                     {
// //                         try
// //                         {
// //                             await hubContext.Clients
// //                                 .Group($"Driver_{asr.DriverId.Value}")
// //                                 .SendAsync("ASRVerificationCompleted", new
// //                                 {
// //                                     asrId = asr.Id,
// //                                     orderId = asr.OrderId,
// //                                     status = asr.AIVerifyStatus,
// //                                     score = asr.AIVerifyScore,
// //                                     reasons = JsonSerializer.Deserialize<List<string>>(asr.AIVerifyReasons ?? "[]")
// //                                 });
// //                         }
// //                         catch { }
// //                     }
// //                 }

// //                 return Results.Ok(new
// //                 {
// //                     message = "Driver captures uploaded successfully",
// //                     asr
// //                 });
// //             }
// //             catch (Exception ex)
// //             {
// //                 Console.WriteLine($"Error uploading captures: {ex.Message}\n{ex.StackTrace}");
// //                 return Results.Problem($"Internal server error: {ex.Message}");
// //             }
// //         })
// //         .RequireAuthorization(new AuthorizeAttribute { Roles = "driver,Driver" });

// //         /// <summary>
// //         /// Driver checks ASR status for an order
// //         /// </summary>
// //         group.MapGet("/driver/status/{orderId}", async (
// //             int orderId,
// //             AppDbContext context
// //         ) =>
// //         {
// //             try
// //             {
// //                 var asr = await context.ASRVerifications
// //                     .FirstOrDefaultAsync(a => a.OrderId == orderId);

// //                 if (asr == null)
// //                     return Results.NotFound(new { message = "No ASR verification found for this order" });

// //                 var reasons = new List<string>();
// //                 try
// //                 {
// //                     reasons = JsonSerializer.Deserialize<List<string>>(asr.AIVerifyReasons ?? "[]") ?? new List<string>();
// //                 }
// //                 catch { }

// //                 return Results.Ok(new
// //                 {
// //                     asrId = asr.Id,
// //                     status = asr.AIVerifyStatus,
// //                     score = asr.AIVerifyScore,
// //                     reasons = reasons,
// //                     hasDocuments = !string.IsNullOrEmpty(asr.DocumentUrls) && asr.DocumentUrls != "[]",
// //                     hasPhoto = !string.IsNullOrEmpty(asr.CustomerPhotoUrl),
// //                     hasSignature = !string.IsNullOrEmpty(asr.SignatureUrl),
// //                     retryCount = asr.RetryCount
// //                 });
// //             }
// //             catch (Exception ex)
// //             {
// //                 Console.WriteLine($"Error checking ASR status: {ex.Message}\n{ex.StackTrace}");
// //                 return Results.Problem($"Internal server error: {ex.Message}");
// //             }
// //         })
// //         .RequireAuthorization(new AuthorizeAttribute { Roles = "driver,Driver" });

// //         // ============================================
// //         // CUSTOMER ENDPOINTS
// //         // ============================================

// //         /// <summary>
// //         /// Customer uploads ID documents
// //         /// </summary>
// //         group.MapPost("/customer/upload-documents/{asrId}", async (
// //             int asrId,
// //             ASRCustomerDocumentDto dto,
// //             AppDbContext context,
// //             IHubContext<LogisticsHub> hubContext
// //         ) =>
// //         {
// //             try
// //             {
// //                 var asr = await context.ASRVerifications
// //                     .FirstOrDefaultAsync(a => a.Id == asrId);

// //                 if (asr == null)
// //                     return Results.NotFound(new { message = "ASR verification not found" });

// //                 asr.DocumentUrls = JsonSerializer.Serialize(dto.DocumentUrls);
// //                 asr.CustomerUploadedAt = DateTime.UtcNow;
// //                 asr.AIVerifyStatus = "InProgress";

// //                 await context.SaveChangesAsync();

// //                 // Notify driver
// //                 if (asr.DriverId.HasValue)
// //                 {
// //                     try
// //                     {
// //                         await hubContext.Clients
// //                             .Group($"Driver_{asr.DriverId.Value}")
// //                             .SendAsync("CustomerDocumentsUploaded", new
// //                             {
// //                                 asrId = asr.Id,
// //                                 orderId = asr.OrderId,
// //                                 message = "Customer has uploaded ID documents"
// //                             });
// //                     }
// //                     catch { }
// //                 }

// //                 return Results.Ok(new
// //                 {
// //                     message = "Documents uploaded successfully",
// //                     asr
// //                 });
// //             }
// //             catch (Exception ex)
// //             {
// //                 Console.WriteLine($"Error uploading documents: {ex.Message}\n{ex.StackTrace}");
// //                 return Results.Problem($"Internal server error: {ex.Message}");
// //             }
// //         })
// //         .RequireAuthorization(new AuthorizeAttribute { Roles = "customer" });

// //         /// <summary>
// //         /// Customer gets their ASR verification status
// //         /// </summary>
// //         group.MapGet("/customer/status/{orderId}", async (
// //             int orderId,
// //             HttpContext http,
// //             AppDbContext context
// //         ) =>
// //         {
// //             try
// //             {
// //                 var customerIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
// //                 if (customerIdClaim == null)
// //                     return Results.Unauthorized();

// //                 var customerId = int.Parse(customerIdClaim.Value);

// //                 var asr = await context.ASRVerifications
// //                     .Include(a => a.Order)
// //                     .FirstOrDefaultAsync(a => a.OrderId == orderId && a.CustomerId == customerId);

// //                 if (asr == null)
// //                     return Results.NotFound(new { message = "No ASR verification found" });

// //                 return Results.Ok(new
// //                 {
// //                     asrId = asr.Id,
// //                     status = asr.AIVerifyStatus,
// //                     requestedAt = asr.RequestedAt,
// //                     uploadedAt = asr.CustomerUploadedAt,
// //                     verifiedAt = asr.VerifiedAt,
// //                     retryCount = asr.RetryCount
// //                 });
// //             }
// //             catch (Exception ex)
// //             {
// //                 Console.WriteLine($"Error checking customer ASR status: {ex.Message}\n{ex.StackTrace}");
// //                 return Results.Problem($"Internal server error: {ex.Message}");
// //             }
// //         })
// //         .RequireAuthorization(new AuthorizeAttribute { Roles = "customer" });

// //         // ============================================
// //         // ADMIN ENDPOINTS
// //         // ============================================

// //         /// <summary>
// //         /// Admin gets all ASR verifications (pending review)
// //         /// </summary>
// //         group.MapGet("/admin/list", async (AppDbContext context) =>
// //         {
// //             try
// //             {
// //                 var asrList = await context.ASRVerifications
// //                     .Include(a => a.Order)
// //                     .Include(a => a.Customer)
// //                     .Include(a => a.Driver)
// //                     .OrderByDescending(a => a.RequestedAt)
// //                     .Select(a => new
// //                     {
// //                         a.Id,
// //                         a.OrderId,
// //                         trackingId = a.Order != null ? a.Order.TrackingId : "",
// //                         customerName = a.Customer != null ? a.Customer.UserFName + " " + a.Customer.UserLName : "",
// //                         driverName = a.Driver != null ? a.Driver.UserFName + " " + a.Driver.UserLName : "",
// //                         a.AIVerifyStatus,
// //                         a.AIVerifyScore,
// //                         a.RequestedAt,
// //                         a.VerifiedAt,
// //                         a.IsAdminOverride,
// //                         a.RetryCount
// //                     })
// //                     .ToListAsync();

// //                 return Results.Ok(asrList);
// //             }
// //             catch (Exception ex)
// //             {
// //                 Console.WriteLine($"Error fetching ASR list: {ex.Message}\n{ex.StackTrace}");
// //                 return Results.Ok(new List<object>()); // Return empty list on error
// //             }
// //         });

// //         /// <summary>
// //         /// Admin gets detailed ASR verification
// //         /// </summary>
// //         group.MapGet("/admin/details/{asrId}", async (
// //             int asrId,
// //             AppDbContext context
// //         ) =>
// //         {
// //             try
// //             {
// //                 var asr = await context.ASRVerifications
// //                     .Include(a => a.Order)
// //                     .Include(a => a.Customer)
// //                     .Include(a => a.Driver)
// //                     .FirstOrDefaultAsync(a => a.Id == asrId);

// //                 if (asr == null)
// //                     return Results.NotFound(new { message = "ASR verification not found" });

// //                 var documentUrls = new List<string>();
// //                 var reasons = new List<string>();

// //                 try
// //                 {
// //                     documentUrls = JsonSerializer.Deserialize<List<string>>(asr.DocumentUrls ?? "[]") ?? new List<string>();
// //                     reasons = JsonSerializer.Deserialize<List<string>>(asr.AIVerifyReasons ?? "[]") ?? new List<string>();
// //                 }
// //                 catch { }

// //                 return Results.Ok(new
// //                 {
// //                     asr.Id,
// //                     asr.OrderId,
// //                     order = asr.Order != null ? new
// //                     {
// //                         asr.Order.Id,
// //                         asr.Order.TrackingId,
// //                         asr.Order.ReceiverName,
// //                         asr.Order.ReceiverAddress,
// //                         asr.Order.Status
// //                     } : null,
// //                     customer = asr.Customer != null ? new
// //                     {
// //                         asr.Customer.UserId,
// //                         name = asr.Customer.UserFName + " " + asr.Customer.UserLName,
// //                         asr.Customer.UserEmail
// //                     } : null,
// //                     driver = asr.Driver != null ? new
// //                     {
// //                         asr.Driver.UserId,
// //                         name = asr.Driver.UserFName + " " + asr.Driver.UserLName,
// //                         asr.Driver.UserEmail
// //                     } : null,
// //                     documentUrls = documentUrls,
// //                     asr.CustomerPhotoUrl,
// //                     asr.SignatureUrl,
// //                     asr.AIVerifyStatus,
// //                     asr.AIVerifyScore,
// //                     reasons = reasons,
// //                     asr.RequestedAt,
// //                     asr.CustomerUploadedAt,
// //                     asr.VerifiedAt,
// //                     asr.IsAdminOverride,
// //                     asr.OverrideReason,
// //                     asr.RetryCount
// //                 });
// //             }
// //             catch (Exception ex)
// //             {
// //                 Console.WriteLine($"Error fetching ASR details: {ex.Message}\n{ex.StackTrace}");
// //                 return Results.Problem($"Internal server error: {ex.Message}");
// //             }
// //         })
// //         .RequireAuthorization(new AuthorizeAttribute { Roles = "admin" });

// //         /// <summary>
// //         /// Admin overrides ASR failure
// //         /// </summary>
// //         group.MapPost("/admin/override/{asrId}", async (
// //             int asrId,
// //             ASRAdminOverrideDto dto,
// //             HttpContext http,
// //             AppDbContext context,
// //             IHubContext<LogisticsHub> hubContext
// //         ) =>
// //         {
// //             try
// //             {
// //                 var adminIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
// //                 if (adminIdClaim == null)
// //                     return Results.Unauthorized();

// //                 var adminId = int.Parse(adminIdClaim.Value);

// //                 var asr = await context.ASRVerifications
// //                     .Include(a => a.Order)
// //                     .FirstOrDefaultAsync(a => a.Id == asrId);

// //                 if (asr == null)
// //                     return Results.NotFound(new { message = "ASR verification not found" });

// //                 asr.IsAdminOverride = true;
// //                 asr.OverriddenByAdminId = adminId;
// //                 asr.OverrideReason = dto.Reason;
// //                 asr.AIVerifyStatus = "AdminOverride";
// //                 asr.VerifiedAt = DateTime.UtcNow;

// //                 if (asr.Order != null)
// //                 {
// //                     asr.Order.ASRStatus = "AdminOverride";
// //                 }

// //                 await context.SaveChangesAsync();

// //                 // Notify driver
// //                 if (asr.DriverId.HasValue)
// //                 {
// //                     try
// //                     {
// //                         await hubContext.Clients
// //                             .Group($"Driver_{asr.DriverId.Value}")
// //                             .SendAsync("ASRAdminOverride", new
// //                             {
// //                                 asrId = asr.Id,
// //                                 orderId = asr.OrderId,
// //                                 message = "Admin has approved ASR verification",
// //                                 reason = dto.Reason
// //                             });
// //                     }
// //                     catch { }
// //                 }

// //                 return Results.Ok(new
// //                 {
// //                     message = "ASR verification overridden by admin",
// //                     asr
// //                 });
// //             }
// //             catch (Exception ex)
// //             {
// //                 Console.WriteLine($"Error in admin override: {ex.Message}\n{ex.StackTrace}");
// //                 return Results.Problem($"Internal server error: {ex.Message}");
// //             }
// //         })
// //         .RequireAuthorization(new AuthorizeAttribute { Roles = "admin" });

// //         /// <summary>
// //         /// Trigger AI re-verification
// //         /// </summary>
// //         group.MapPost("/admin/reverify/{asrId}", async (
// //             int asrId,
// //             AppDbContext context
// //         ) =>
// //         {
// //             try
// //             {
// //                 var asr = await context.ASRVerifications
// //                     .Include(a => a.Order)
// //                     .FirstOrDefaultAsync(a => a.Id == asrId);

// //                 if (asr == null)
// //                     return Results.NotFound(new { message = "ASR verification not found" });

// //                 // Mock re-verification
// //                 asr.AIVerifyScore = 0.85;
// //                 asr.AIVerifyReasons = JsonSerializer.Serialize(new List<string> 
// //                 { 
// //                     "Re-verification successful",
// //                     "All documents valid",
// //                     "Identity confirmed"
// //                 });
// //                 asr.AIVerifyStatus = "Success";
// //                 asr.VerifiedAt = DateTime.UtcNow;

// //                 if (asr.Order != null)
// //                 {
// //                     asr.Order.ASRStatus = "Success";
// //                 }

// //                 await context.SaveChangesAsync();

// //                 var reasons = JsonSerializer.Deserialize<List<string>>(asr.AIVerifyReasons ?? "[]") ?? new List<string>();

// //                 return Results.Ok(new
// //                 {
// //                     message = "AI verification completed",
// //                     status = asr.AIVerifyStatus,
// //                     score = asr.AIVerifyScore,
// //                     reasons = reasons
// //                 });
// //             }
// //             catch (Exception ex)
// //             {
// //                 Console.WriteLine($"Error in reverify: {ex.Message}\n{ex.StackTrace}");
// //                 return Results.Problem($"Internal server error: {ex.Message}");
// //             }
// //         })
// //         .RequireAuthorization(new AuthorizeAttribute { Roles = "admin" });
// //     }
// // }

// // // DTOs
// // public record ASRDriverCaptureDto(string CustomerPhotoUrl, string SignatureUrl);
// // public record ASRCustomerDocumentDto(List<string> DocumentUrls);
// // public record ASRAdminOverrideDto(string Reason);

// using Backend.Data;
// using Backend.Domain.Entity;
// using Backend.Hubs;
// using Backend.Services;
// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.SignalR;
// using Microsoft.EntityFrameworkCore;
// using System.Security.Claims;
// using System.Text.Json;
// using Backend.DTO;

// public static class ASREndpoints
// {
//     public static void MapASREndpoints(this IEndpointRouteBuilder app)
//     {
//         var group = app.MapGroup("/api/asr").WithTags("ASR Verification");

//         // ============================================
//         // DRIVER ENDPOINTS
//         // ============================================

//         /// <summary>
//         /// Driver initiates ASR verification for an order
//         /// </summary>
//         group.MapPost("/driver/initiate/{orderId}", async (
//             int orderId,
//             HttpContext http,
//             AppDbContext context,
//             IHubContext<LogisticsHub> hubContext
//         ) =>
//         {
//             try
//             {
//                 var driverIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
//                 if (driverIdClaim == null)
//                     return Results.Unauthorized();

//                 var driverId = int.Parse(driverIdClaim.Value);

//                 var order = await context.Orders
//                     .Include(o => o.Customer)
//                     .FirstOrDefaultAsync(o => o.Id == orderId);

//                 if (order == null)
//                     return Results.NotFound(new { message = "Order not found" });

//                 if (!order.IsASR)
//                     return Results.BadRequest(new { message = "Order does not require ASR" });

//                 // Check if ASR already exists
//                 var existingAsr = await context.ASRVerifications
//                     .FirstOrDefaultAsync(a => a.OrderId == orderId);

//                 if (existingAsr != null)
//                 {
//                     return Results.Ok(new
//                     {
//                         message = "ASR verification already exists",
//                         asrId = existingAsr.Id,
//                         status = existingAsr.AIVerifyStatus
//                     });
//                 }

//                 // Create new ASR verification
//                 var asr = new ASRVerification
//                 {
//                     OrderId = orderId,
//                     CustomerId = order.CustomerId ?? 0,
//                     DriverId = driverId,
//                     AIVerifyStatus = "Pending",
//                     RequestedAt = DateTime.UtcNow,
//                     DocumentUrls = "[]"
//                 };

//                 context.ASRVerifications.Add(asr);
//                 await context.SaveChangesAsync();

//                 // Update order
//                 order.ASRVerificationId = asr.Id;
//                 order.ASRStatus = "Pending";
//                 await context.SaveChangesAsync();

//                 // Notify customer via SignalR
//                 if (order.CustomerId.HasValue)
//                 {
//                     try
//                     {
//                         await hubContext.Clients
//                             .Group($"Customer_{order.CustomerId.Value}")
//                             .SendAsync("ASRVerificationRequested", new
//                             {
//                                 orderId = order.Id,
//                                 trackingId = order.TrackingId,
//                                 asrId = asr.Id,
//                                 message = "Driver has requested ASR verification. Please upload your ID documents."
//                             });
//                     }
//                     catch (Exception ex)
//                     {
//                         Console.WriteLine($"SignalR notification failed: {ex.Message}");
//                     }
//                 }

//                 return Results.Ok(new
//                 {
//                     message = "ASR verification initiated",
//                     asrId = asr.Id,
//                     status = asr.AIVerifyStatus
//                 });
//             }
//             catch (Exception ex)
//             {
//                 Console.WriteLine($"Error in ASR initiate: {ex.Message}\n{ex.StackTrace}");
//                 return Results.Problem($"Internal server error: {ex.Message}");
//             }
//         })
//         .RequireAuthorization(new AuthorizeAttribute { Roles = "driver,Driver" });

//         /// <summary>
//         /// Driver uploads customer photo and signature
//         /// 🔥 NOW USES PYTHON VERIFICATION SERVICE
//         /// </summary>
//         group.MapPost("/driver/upload-captures/{asrId}", async (
//             int asrId,
//             ASRDriverCaptureDto dto,
//             AppDbContext context,
//             IHubContext<LogisticsHub> hubContext,
//             VerificationService verificationService // ✅ Inject Python service
//         ) =>
//         {
//             try
//             {
//                 var asr = await context.ASRVerifications
//                     .Include(a => a.Order)
//                     .FirstOrDefaultAsync(a => a.Id == asrId);

//                 if (asr == null)
//                     return Results.NotFound(new { message = "ASR verification not found" });

//                 // Save captures
//                 asr.CustomerPhotoUrl = dto.CustomerPhotoUrl;
//                 asr.SignatureUrl = dto.SignatureUrl;
//                 asr.AIVerifyStatus = "InProgress";

//                 await context.SaveChangesAsync();

//                 // Check if customer has uploaded documents
//                 var documentUrls = JsonSerializer.Deserialize<List<string>>(asr.DocumentUrls ?? "[]");
                
//                 if (documentUrls == null || !documentUrls.Any())
//                 {
//                     return Results.Ok(new
//                     {
//                         message = "Driver captures uploaded. Waiting for customer documents.",
//                         asr
//                     });
//                 }

//                 // ✅ REAL VERIFICATION USING PYTHON SERVICE
//                 Console.WriteLine($"Starting ASR verification for ASR ID: {asrId}");
                
//                 var verificationResult = await verificationService.VerifyCompleteASRAsync(
//                     documentUrls,
//                     dto.CustomerPhotoUrl,
//                     dto.SignatureUrl
//                 );

//                 // Update ASR with verification results
//                 asr.AIVerifyScore = verificationResult.Score;
//                 asr.AIVerifyReasons = JsonSerializer.Serialize(verificationResult.Reasons);
//                 asr.AIVerifyStatus = verificationResult.Verified ? "Success" : "Failed";
//                 asr.VerifiedAt = DateTime.UtcNow;

//                 // Store Aadhaar data in metadata
//                 if (verificationResult.AadhaarData != null)
//                 {
//                     asr.VerificationMetadata = JsonSerializer.Serialize(new
//                     {
//                         verificationType = verificationResult.VerificationType,
//                         aadhaarData = verificationResult.AadhaarData,
//                         verifiedAt = DateTime.UtcNow
//                     });
//                 }

//                 // Update order status
//                 if (asr.Order != null)
//                 {
//                     asr.Order.ASRStatus = asr.AIVerifyStatus;
//                 }

//                 await context.SaveChangesAsync();

//                 Console.WriteLine($"ASR verification completed. Status: {asr.AIVerifyStatus}, Score: {asr.AIVerifyScore}");

//                 // Notify driver of results
//                 if (asr.DriverId.HasValue)
//                 {
//                     try
//                     {
//                         await hubContext.Clients
//                             .Group($"Driver_{asr.DriverId.Value}")
//                             .SendAsync("ASRVerificationCompleted", new
//                             {
//                                 asrId = asr.Id,
//                                 orderId = asr.OrderId,
//                                 status = asr.AIVerifyStatus,
//                                 score = asr.AIVerifyScore,
//                                 reasons = verificationResult.Reasons
//                             });
//                     }
//                     catch (Exception ex)
//                     {
//                         Console.WriteLine($"SignalR notification failed: {ex.Message}");
//                     }
//                 }

//                 return Results.Ok(new
//                 {
//                     message = verificationResult.Verified 
//                         ? "✅ ASR verification successful" 
//                         : "❌ ASR verification failed",
//                     status = asr.AIVerifyStatus,
//                     score = asr.AIVerifyScore,
//                     reasons = verificationResult.Reasons,
//                     aadhaarData = verificationResult.AadhaarData
//                 });
//             }
//             catch (Exception ex)
//             {
//                 Console.WriteLine($"Error uploading captures: {ex.Message}\n{ex.StackTrace}");
                
//                 // Update ASR status to failed
//                 try
//                 {
//                     var asr = await context.ASRVerifications.FindAsync(asrId);
//                     if (asr != null)
//                     {
//                         asr.AIVerifyStatus = "Failed";
//                         asr.AIVerifyReasons = JsonSerializer.Serialize(new List<string> 
//                         { 
//                             $"Verification error: {ex.Message}" 
//                         });
//                         await context.SaveChangesAsync();
//                     }
//                 }
//                 catch { }

//                 return Results.Problem($"Verification failed: {ex.Message}");
//             }
//         })
//         .RequireAuthorization(new AuthorizeAttribute { Roles = "driver,Driver" });

//         /// <summary>
//         /// Driver checks ASR status for an order
//         /// </summary>
//         group.MapGet("/driver/status/{orderId}", async (
//             int orderId,
//             AppDbContext context
//         ) =>
//         {
//             try
//             {
//                 var asr = await context.ASRVerifications
//                     .FirstOrDefaultAsync(a => a.OrderId == orderId);

//                 if (asr == null)
//                     return Results.NotFound(new { message = "No ASR verification found for this order" });

//                 var reasons = new List<string>();
//                 try
//                 {
//                     reasons = JsonSerializer.Deserialize<List<string>>(asr.AIVerifyReasons ?? "[]") ?? new List<string>();
//                 }
//                 catch { }

//                 return Results.Ok(new
//                 {
//                     asrId = asr.Id,
//                     status = asr.AIVerifyStatus,
//                     score = asr.AIVerifyScore,
//                     reasons = reasons,
//                     hasDocuments = !string.IsNullOrEmpty(asr.DocumentUrls) && asr.DocumentUrls != "[]",
//                     hasPhoto = !string.IsNullOrEmpty(asr.CustomerPhotoUrl),
//                     hasSignature = !string.IsNullOrEmpty(asr.SignatureUrl),
//                     retryCount = asr.RetryCount
//                 });
//             }
//             catch (Exception ex)
//             {
//                 Console.WriteLine($"Error checking ASR status: {ex.Message}\n{ex.StackTrace}");
//                 return Results.Problem($"Internal server error: {ex.Message}");
//             }
//         })
//         .RequireAuthorization(new AuthorizeAttribute { Roles = "driver,Driver" });

//         // ============================================
//         // CUSTOMER ENDPOINTS
//         // ============================================

//         /// <summary>
//         /// Customer uploads ID documents
//         /// 🔥 CAN TRIGGER VERIFICATION IF DRIVER CAPTURES ALREADY UPLOADED
//         /// </summary>
//         group.MapPost("/customer/upload-documents/{asrId}", async (
//             int asrId,
//             ASRCustomerDocumentDto dto,
//             AppDbContext context,
//             IHubContext<LogisticsHub> hubContext,
//             VerificationService verificationService // ✅ Inject Python service
//         ) =>
//         {
//             try
//             {
//                 var asr = await context.ASRVerifications
//                     .Include(a => a.Order)
//                     .FirstOrDefaultAsync(a => a.Id == asrId);

//                 if (asr == null)
//                     return Results.NotFound(new { message = "ASR verification not found" });

//                 asr.DocumentUrls = JsonSerializer.Serialize(dto.DocumentUrls);
//                 asr.CustomerUploadedAt = DateTime.UtcNow;
//                 asr.AIVerifyStatus = "DocumentsReceived";

//                 await context.SaveChangesAsync();

//                 // Notify driver
//                 if (asr.DriverId.HasValue)
//                 {
//                     try
//                     {
//                         await hubContext.Clients
//                             .Group($"Driver_{asr.DriverId.Value}")
//                             .SendAsync("CustomerDocumentsUploaded", new
//                             {
//                                 asrId = asr.Id,
//                                 orderId = asr.OrderId,
//                                 message = "Customer has uploaded ID documents"
//                             });
//                     }
//                     catch { }
//                 }

//                 // ✅ AUTO-VERIFY IF DRIVER ALREADY CAPTURED PHOTO/SIGNATURE
//                 if (!string.IsNullOrEmpty(asr.CustomerPhotoUrl) && !string.IsNullOrEmpty(asr.SignatureUrl))
//                 {
//                     Console.WriteLine($"Auto-triggering verification for ASR ID: {asrId}");
                    
//                     asr.AIVerifyStatus = "InProgress";
//                     await context.SaveChangesAsync();

//                     var verificationResult = await verificationService.VerifyCompleteASRAsync(
//                         dto.DocumentUrls,
//                         asr.CustomerPhotoUrl,
//                         asr.SignatureUrl
//                     );

//                     asr.AIVerifyScore = verificationResult.Score;
//                     asr.AIVerifyReasons = JsonSerializer.Serialize(verificationResult.Reasons);
//                     asr.AIVerifyStatus = verificationResult.Verified ? "Success" : "Failed";
//                     asr.VerifiedAt = DateTime.UtcNow;

//                     if (verificationResult.AadhaarData != null)
//                     {
//                         asr.VerificationMetadata = JsonSerializer.Serialize(new
//                         {
//                             verificationType = verificationResult.VerificationType,
//                             aadhaarData = verificationResult.AadhaarData,
//                             verifiedAt = DateTime.UtcNow
//                         });
//                     }

//                     if (asr.Order != null)
//                     {
//                         asr.Order.ASRStatus = asr.AIVerifyStatus;
//                     }

//                     await context.SaveChangesAsync();

//                     // Notify driver
//                     if (asr.DriverId.HasValue)
//                     {
//                         try
//                         {
//                             await hubContext.Clients
//                                 .Group($"Driver_{asr.DriverId.Value}")
//                                 .SendAsync("ASRVerificationCompleted", new
//                                 {
//                                     asrId = asr.Id,
//                                     orderId = asr.OrderId,
//                                     status = asr.AIVerifyStatus,
//                                     score = asr.AIVerifyScore,
//                                     reasons = verificationResult.Reasons
//                                 });
//                         }
//                         catch { }
//                     }
//                 }

//                 return Results.Ok(new
//                 {
//                     message = "Documents uploaded successfully",
//                     asr
//                 });
//             }
//             catch (Exception ex)
//             {
//                 Console.WriteLine($"Error uploading documents: {ex.Message}\n{ex.StackTrace}");
//                 return Results.Problem($"Internal server error: {ex.Message}");
//             }
//         })
//         .RequireAuthorization(new AuthorizeAttribute { Roles = "customer" });

//         /// <summary>
//         /// Customer gets their ASR verification status
//         /// </summary>
//         group.MapGet("/customer/status/{orderId}", async (
//             int orderId,
//             HttpContext http,
//             AppDbContext context
//         ) =>
//         {
//             try
//             {
//                 var customerIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
//                 if (customerIdClaim == null)
//                     return Results.Unauthorized();

//                 var customerId = int.Parse(customerIdClaim.Value);

//                 var asr = await context.ASRVerifications
//                     .Include(a => a.Order)
//                     .FirstOrDefaultAsync(a => a.OrderId == orderId && a.CustomerId == customerId);

//                 if (asr == null)
//                     return Results.NotFound(new { message = "No ASR verification found" });

//                 return Results.Ok(new
//                 {
//                     asrId = asr.Id,
//                     status = asr.AIVerifyStatus,
//                     requestedAt = asr.RequestedAt,
//                     uploadedAt = asr.CustomerUploadedAt,
//                     verifiedAt = asr.VerifiedAt,
//                     retryCount = asr.RetryCount
//                 });
//             }
//             catch (Exception ex)
//             {
//                 Console.WriteLine($"Error checking customer ASR status: {ex.Message}\n{ex.StackTrace}");
//                 return Results.Problem($"Internal server error: {ex.Message}");
//             }
//         })
//         .RequireAuthorization(new AuthorizeAttribute { Roles = "customer" });

//         // ============================================
//         // ADMIN ENDPOINTS
//         // ============================================

//         /// <summary>
//         /// Admin gets all ASR verifications (pending review)
//         /// </summary>
//         group.MapGet("/admin/list", async (AppDbContext context) =>
//         {
//             try
//             {
//                 var asrList = await context.ASRVerifications
//                     .Include(a => a.Order)
//                     .Include(a => a.Customer)
//                     .Include(a => a.Driver)
//                     .OrderByDescending(a => a.RequestedAt)
//                     .Select(a => new
//                     {
//                         a.Id,
//                         a.OrderId,
//                         trackingId = a.Order != null ? a.Order.TrackingId : "",
//                         customerName = a.Customer != null ? a.Customer.UserFName + " " + a.Customer.UserLName : "",
//                         driverName = a.Driver != null ? a.Driver.UserFName + " " + a.Driver.UserLName : "",
//                         a.AIVerifyStatus,
//                         a.AIVerifyScore,
//                         a.RequestedAt,
//                         a.VerifiedAt,
//                         a.IsAdminOverride,
//                         a.RetryCount
//                     })
//                     .ToListAsync();

//                 return Results.Ok(asrList);
//             }
//             catch (Exception ex)
//             {
//                 Console.WriteLine($"Error fetching ASR list: {ex.Message}\n{ex.StackTrace}");
//                 return Results.Ok(new List<object>());
//             }
//         });

//         /// <summary>
//         /// Admin gets detailed ASR verification
//         /// </summary>
//         group.MapGet("/admin/details/{asrId}", async (
//             int asrId,
//             AppDbContext context
//         ) =>
//         {
//             try
//             {
//                 var asr = await context.ASRVerifications
//                     .Include(a => a.Order)
//                     .Include(a => a.Customer)
//                     .Include(a => a.Driver)
//                     .FirstOrDefaultAsync(a => a.Id == asrId);

//                 if (asr == null)
//                     return Results.NotFound(new { message = "ASR verification not found" });

//                 var documentUrls = new List<string>();
//                 var reasons = new List<string>();
//                 object? metadata = null;

//                 try
//                 {
//                     documentUrls = JsonSerializer.Deserialize<List<string>>(asr.DocumentUrls ?? "[]") ?? new List<string>();
//                     reasons = JsonSerializer.Deserialize<List<string>>(asr.AIVerifyReasons ?? "[]") ?? new List<string>();
                    
//                     if (!string.IsNullOrEmpty(asr.VerificationMetadata))
//                     {
//                         metadata = JsonSerializer.Deserialize<object>(asr.VerificationMetadata);
//                     }
//                 }
//                 catch { }

//                 return Results.Ok(new
//                 {
//                     asr.Id,
//                     asr.OrderId,
//                     order = asr.Order != null ? new
//                     {
//                         asr.Order.Id,
//                         asr.Order.TrackingId,
//                         asr.Order.ReceiverName,
//                         asr.Order.ReceiverAddress,
//                         asr.Order.Status
//                     } : null,
//                     customer = asr.Customer != null ? new
//                     {
//                         asr.Customer.UserId,
//                         name = asr.Customer.UserFName + " " + asr.Customer.UserLName,
//                         asr.Customer.UserEmail
//                     } : null,
//                     driver = asr.Driver != null ? new
//                     {
//                         asr.Driver.UserId,
//                         name = asr.Driver.UserFName + " " + asr.Driver.UserLName,
//                         asr.Driver.UserEmail
//                     } : null,
//                     documentUrls = documentUrls,
//                     asr.CustomerPhotoUrl,
//                     asr.SignatureUrl,
//                     asr.AIVerifyStatus,
//                     asr.AIVerifyScore,
//                     reasons = reasons,
//                     metadata = metadata,
//                     asr.RequestedAt,
//                     asr.CustomerUploadedAt,
//                     asr.VerifiedAt,
//                     asr.IsAdminOverride,
//                     asr.OverrideReason,
//                     asr.RetryCount
//                 });
//             }
//             catch (Exception ex)
//             {
//                 Console.WriteLine($"Error fetching ASR details: {ex.Message}\n{ex.StackTrace}");
//                 return Results.Problem($"Internal server error: {ex.Message}");
//             }
//         })
//         .RequireAuthorization(new AuthorizeAttribute { Roles = "admin" });

//         /// <summary>
//         /// Admin overrides ASR failure
//         /// </summary>
//         group.MapPost("/admin/override/{asrId}", async (
//             int asrId,
//             ASRAdminOverrideDto dto,
//             HttpContext http,
//             AppDbContext context,
//             IHubContext<LogisticsHub> hubContext
//         ) =>
//         {
//             try
//             {
//                 var adminIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
//                 if (adminIdClaim == null)
//                     return Results.Unauthorized();

//                 var adminId = int.Parse(adminIdClaim.Value);

//                 var asr = await context.ASRVerifications
//                     .Include(a => a.Order)
//                     .FirstOrDefaultAsync(a => a.Id == asrId);

//                 if (asr == null)
//                     return Results.NotFound(new { message = "ASR verification not found" });

//                 asr.IsAdminOverride = true;
//                 asr.OverriddenByAdminId = adminId;
//                 asr.OverrideReason = dto.Reason;
//                 asr.AIVerifyStatus = "AdminOverride";
//                 asr.VerifiedAt = DateTime.UtcNow;

//                 if (asr.Order != null)
//                 {
//                     asr.Order.ASRStatus = "AdminOverride";
//                 }

//                 await context.SaveChangesAsync();

//                 // Notify driver
//                 if (asr.DriverId.HasValue)
//                 {
//                     try
//                     {
//                         await hubContext.Clients
//                             .Group($"Driver_{asr.DriverId.Value}")
//                             .SendAsync("ASRAdminOverride", new
//                             {
//                                 asrId = asr.Id,
//                                 orderId = asr.OrderId,
//                                 message = "Admin has approved ASR verification",
//                                 reason = dto.Reason
//                             });
//                     }
//                     catch { }
//                 }

//                 return Results.Ok(new
//                 {
//                     message = "ASR verification overridden by admin",
//                     asr
//                 });
//             }
//             catch (Exception ex)
//             {
//                 Console.WriteLine($"Error in admin override: {ex.Message}\n{ex.StackTrace}");
//                 return Results.Problem($"Internal server error: {ex.Message}");
//             }
//         })
//         .RequireAuthorization(new AuthorizeAttribute { Roles = "admin" });

//         /// <summary>
//         /// Trigger AI re-verification using Python service
//         /// </summary>
//         group.MapPost("/admin/reverify/{asrId}", async (
//             int asrId,
//             AppDbContext context,
//             VerificationService verificationService // ✅ Use Python service
//         ) =>
//         {
//             try
//             {
//                 var asr = await context.ASRVerifications
//                     .Include(a => a.Order)
//                     .FirstOrDefaultAsync(a => a.Id == asrId);

//                 if (asr == null)
//                     return Results.NotFound(new { message = "ASR verification not found" });

//                 // Check if all required data exists
//                 var documentUrls = JsonSerializer.Deserialize<List<string>>(asr.DocumentUrls ?? "[]");
                
//                 if (documentUrls == null || !documentUrls.Any() || 
//                     string.IsNullOrEmpty(asr.CustomerPhotoUrl) || 
//                     string.IsNullOrEmpty(asr.SignatureUrl))
//                 {
//                     return Results.BadRequest(new { message = "Missing required verification data" });
//                 }

//                 // ✅ REAL RE-VERIFICATION
//                 asr.AIVerifyStatus = "InProgress";
//                 asr.RetryCount++;
//                 await context.SaveChangesAsync();

//                 var verificationResult = await verificationService.VerifyCompleteASRAsync(
//                     documentUrls,
//                     asr.CustomerPhotoUrl,
//                     asr.SignatureUrl
//                 );

//                 asr.AIVerifyScore = verificationResult.Score;
//                 asr.AIVerifyReasons = JsonSerializer.Serialize(verificationResult.Reasons);
//                 asr.AIVerifyStatus = verificationResult.Verified ? "Success" : "Failed";
//                 asr.VerifiedAt = DateTime.UtcNow;

//                 if (verificationResult.AadhaarData != null)
//                 {
//                     asr.VerificationMetadata = JsonSerializer.Serialize(new
//                     {
//                         verificationType = verificationResult.VerificationType,
//                         aadhaarData = verificationResult.AadhaarData,
//                         verifiedAt = DateTime.UtcNow,
//                         retryCount = asr.RetryCount
//                     });
//                 }

//                 if (asr.Order != null)
//                 {
//                     asr.Order.ASRStatus = asr.AIVerifyStatus;
//                 }

//                 await context.SaveChangesAsync();

//                 return Results.Ok(new
//                 {
//                     message = "Re-verification completed",
//                     status = asr.AIVerifyStatus,
//                     score = asr.AIVerifyScore,
//                     reasons = verificationResult.Reasons,
//                     retryCount = asr.RetryCount
//                 });
//             }
//             catch (Exception ex)
//             {
//                 Console.WriteLine($"Error in reverify: {ex.Message}\n{ex.StackTrace}");
//                 return Results.Problem($"Internal server error: {ex.Message}");
//             }
//         })
//         .RequireAuthorization(new AuthorizeAttribute { Roles = "admin" });
//     }
// }


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