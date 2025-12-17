// // // using Backend.Data;
// // // using Backend.Domain.Entity;
// // // using Microsoft.EntityFrameworkCore;
// // // using System.Text.Json;

// // // namespace Backend.Services
// // // {
// // //     public class ASRService
// // //     {
// // //         private readonly AppDbContext _context;
// // //         private readonly GeminiService _geminiService;

// // //         public ASRService(AppDbContext context, GeminiService geminiService)
// // //         {
// // //             _context = context;
// // //             _geminiService = geminiService;
// // //         }

// // //         /// <summary>
// // //         /// Creates a new ASR verification request for an order
// // //         /// </summary>
// // //         public async Task<ASRVerification> CreateASRRequestAsync(int orderId, int driverId)
// // //         {
// // //             var order = await _context.Orders
// // //                 .Include(o => o.Customer)
// // //                 .FirstOrDefaultAsync(o => o.Id == orderId);

// // //             if (order == null)
// // //                 throw new Exception("Order not found");

// // //             if (!order.IsASR)
// // //                 throw new Exception("Order does not require ASR");

// // //             var existingASR = await _context.ASRVerifications
// // //                 .FirstOrDefaultAsync(a => a.OrderId == orderId);

// // //             if (existingASR != null)
// // //                 return existingASR; // Already exists

// // //             var asrVerification = new ASRVerification
// // //             {
// // //                 OrderId = orderId,
// // //                 CustomerId = order.CustomerId ?? 0,
// // //                 DriverId = driverId,
// // //                 AIVerifyStatus = "Pending",
// // //                 RequestedAt = DateTime.UtcNow
// // //             };

// // //             _context.ASRVerifications.Add(asrVerification);
// // //             await _context.SaveChangesAsync();

// // //             // Update order
// // //             order.ASRVerificationId = asrVerification.Id;
// // //             order.ASRStatus = "Pending";
// // //             await _context.SaveChangesAsync();

// // //             return asrVerification;
// // //         }

// // //         /// <summary>
// // //         /// Customer uploads documents (Aadhaar, PAN, etc.)
// // //         /// </summary>
// // //         public async Task<ASRVerification> UploadCustomerDocumentsAsync(
// // //             int asrId, 
// // //             List<string> documentUrls)
// // //         {
// // //             var asr = await _context.ASRVerifications.FindAsync(asrId);
// // //             if (asr == null)
// // //                 throw new Exception("ASR verification not found");

// // //             asr.DocumentUrls = JsonSerializer.Serialize(documentUrls);
// // //             asr.CustomerUploadedAt = DateTime.UtcNow;
// // //             asr.AIVerifyStatus = "InProgress";

// // //             await _context.SaveChangesAsync();

// // //             return asr;
// // //         }

// // //         /// <summary>
// // //         /// Driver uploads customer photo and signature
// // //         /// </summary>
// // //         public async Task<ASRVerification> UploadDriverCapturesAsync(
// // //             int asrId,
// // //             string customerPhotoUrl,
// // //             string signatureUrl)
// // //         {
// // //             var asr = await _context.ASRVerifications.FindAsync(asrId);
// // //             if (asr == null)
// // //                 throw new Exception("ASR verification not found");

// // //             asr.CustomerPhotoUrl = customerPhotoUrl;
// // //             asr.SignatureUrl = signatureUrl;
// // //             asr.AIVerifyStatus = "InProgress";

// // //             await _context.SaveChangesAsync();

// // //             return asr;
// // //         }

// // //         /// <summary>
// // //         /// Perform AI verification using Gemini 2.5 Flash
// // //         /// </summary>
// // //         public async Task<ASRVerification> PerformAIVerificationAsync(int asrId)
// // //         {
// // //             var asr = await _context.ASRVerifications
// // //                 .Include(a => a.Order)
// // //                 .Include(a => a.Customer)
// // //                 .FirstOrDefaultAsync(a => a.Id == asrId);

// // //             if (asr == null)
// // //                 throw new Exception("ASR verification not found");

// // //             if (string.IsNullOrEmpty(asr.DocumentUrls) || 
// // //                 string.IsNullOrEmpty(asr.CustomerPhotoUrl) ||
// // //                 string.IsNullOrEmpty(asr.SignatureUrl))
// // //             {
// // //                 asr.AIVerifyStatus = "Failed";
// // //                 asr.AIVerifyReasons = "Missing required documents";
// // //                 await _context.SaveChangesAsync();
// // //                 return asr;
// // //             }

// // //             try
// // //             {
// // //                 // Parse document URLs
// // //                 var documentUrls = JsonSerializer.Deserialize<List<string>>(asr.DocumentUrls) 
// // //                     ?? new List<string>();

// // //                 // Call Gemini Service for verification
// // //                 var verificationResult = await _geminiService.VerifyASRDocumentsAsync(
// // //                     documentUrls,
// // //                     asr.CustomerPhotoUrl!,
// // //                     asr.SignatureUrl!,
// // //                     asr.Order?.ReceiverName ?? "",
// // //                     asr.Customer?.UserFName + " " + asr.Customer?.UserLName ?? ""
// // //                 );

// // //                 asr.AIVerifyScore = verificationResult.Score;
// // //                 asr.AIVerifyReasons = JsonSerializer.Serialize(verificationResult.Reasons);
// // //                 asr.AIVerifyStatus = verificationResult.IsVerified ? "Success" : "Failed";
// // //                 asr.VerifiedAt = DateTime.UtcNow;

// // //                 // Update order status
// // //                 if (asr.Order != null)
// // //                 {
// // //                     asr.Order.ASRStatus = verificationResult.IsVerified ? "Success" : "Failed";
// // //                 }

// // //                 await _context.SaveChangesAsync();

// // //                 return asr;
// // //             }
// // //             catch (Exception ex)
// // //             {
// // //                 asr.AIVerifyStatus = "Failed";
// // //                 asr.AIVerifyReasons = $"AI verification error: {ex.Message}";
// // //                 await _context.SaveChangesAsync();
// // //                 return asr;
// // //             }
// // //         }

// // //         /// <summary>
// // //         /// Admin can override ASR failure
// // //         /// </summary>
// // //         public async Task<ASRVerification> AdminOverrideAsync(
// // //             int asrId, 
// // //             int adminId, 
// // //             string reason)
// // //         {
// // //             var asr = await _context.ASRVerifications
// // //                 .Include(a => a.Order)
// // //                 .FirstOrDefaultAsync(a => a.Id == asrId);

// // //             if (asr == null)
// // //                 throw new Exception("ASR verification not found");

// // //             asr.IsAdminOverride = true;
// // //             asr.OverriddenByAdminId = adminId;
// // //             asr.OverrideReason = reason;
// // //             asr.AIVerifyStatus = "AdminOverride";
// // //             asr.VerifiedAt = DateTime.UtcNow;

// // //             if (asr.Order != null)
// // //             {
// // //                 asr.Order.ASRStatus = "AdminOverride";
// // //             }

// // //             await _context.SaveChangesAsync();

// // //             return asr;
// // //         }

// // //         /// <summary>
// // //         /// Get ASR verification details
// // //         /// </summary>
// // //         public async Task<ASRVerification?> GetASRVerificationAsync(int orderId)
// // //         {
// // //             return await _context.ASRVerifications
// // //                 .Include(a => a.Order)
// // //                 .Include(a => a.Customer)
// // //                 .Include(a => a.Driver)
// // //                 .FirstOrDefaultAsync(a => a.OrderId == orderId);
// // //         }

// // //         /// <summary>
// // //         /// Retry ASR verification
// // //         /// </summary>
// // //         public async Task<ASRVerification> RetryVerificationAsync(int asrId)
// // //         {
// // //             var asr = await _context.ASRVerifications.FindAsync(asrId);
// // //             if (asr == null)
// // //                 throw new Exception("ASR verification not found");

// // //             asr.RetryCount++;
// // //             asr.AIVerifyStatus = "Pending";
// // //             asr.DocumentUrls = "[]";
// // //             asr.CustomerPhotoUrl = null;
// // //             asr.SignatureUrl = null;
// // //             asr.CustomerUploadedAt = null;

// // //             await _context.SaveChangesAsync();

// // //             return asr;
// // //         }
// // //     }

// // //     // DTOs for Gemini response
// // //     public class ASRVerificationResult
// // //     {
// // //         public bool IsVerified { get; set; }
// // //         public double Score { get; set; }
// // //         public List<string> Reasons { get; set; } = new();
// // //     }
// // // }

// // using Backend.Data;
// // using Backend.Domain.Entity;
// // using Microsoft.EntityFrameworkCore;
// // using System.Text.Json;

// // namespace Backend.Services
// // {
// //     public class ASRService
// //     {
// //         private readonly AppDbContext _context;
// //         private readonly GeminiService? _geminiService;

// //         // Constructor with optional GeminiService
// //         public ASRService(AppDbContext context, GeminiService? geminiService = null)
// //         {
// //             _context = context;
// //             _geminiService = geminiService;
// //         }

// //         /// <summary>
// //         /// Creates a new ASR verification request for an order
// //         /// </summary>
// //         public async Task<ASRVerification> CreateASRRequestAsync(int orderId, int driverId)
// //         {
// //             var order = await _context.Orders
// //                 .Include(o => o.Customer)
// //                 .FirstOrDefaultAsync(o => o.Id == orderId);

// //             if (order == null)
// //                 throw new Exception("Order not found");

// //             if (!order.IsASR)
// //                 throw new Exception("Order does not require ASR");

// //             // Check if ASR already exists
// //             var existingASR = await _context.ASRVerifications
// //                 .FirstOrDefaultAsync(a => a.OrderId == orderId);

// //             if (existingASR != null)
// //                 return existingASR; // Return existing one

// //             var asrVerification = new ASRVerification
// //             {
// //                 OrderId = orderId,
// //                 CustomerId = order.CustomerId ?? 0,
// //                 DriverId = driverId,
// //                 AIVerifyStatus = "Pending",
// //                 RequestedAt = DateTime.UtcNow,
// //                 DocumentUrls = "[]"
// //             };

// //             _context.ASRVerifications.Add(asrVerification);
// //             await _context.SaveChangesAsync();

// //             // Update order
// //             order.ASRVerificationId = asrVerification.Id;
// //             order.ASRStatus = "Pending";
// //             await _context.SaveChangesAsync();

// //             return asrVerification;
// //         }

// //         /// <summary>
// //         /// Customer uploads documents (Aadhaar, PAN, etc.)
// //         /// </summary>
// //         public async Task<ASRVerification> UploadCustomerDocumentsAsync(
// //             int asrId, 
// //             List<string> documentUrls)
// //         {
// //             var asr = await _context.ASRVerifications.FindAsync(asrId);
// //             if (asr == null)
// //                 throw new Exception("ASR verification not found");

// //             asr.DocumentUrls = JsonSerializer.Serialize(documentUrls);
// //             asr.CustomerUploadedAt = DateTime.UtcNow;
// //             asr.AIVerifyStatus = "InProgress";

// //             await _context.SaveChangesAsync();

// //             return asr;
// //         }

// //         /// <summary>
// //         /// Driver uploads customer photo and signature
// //         /// </summary>
// //         public async Task<ASRVerification> UploadDriverCapturesAsync(
// //             int asrId,
// //             string customerPhotoUrl,
// //             string signatureUrl)
// //         {
// //             var asr = await _context.ASRVerifications.FindAsync(asrId);
// //             if (asr == null)
// //                 throw new Exception("ASR verification not found");

// //             asr.CustomerPhotoUrl = customerPhotoUrl;
// //             asr.SignatureUrl = signatureUrl;
// //             asr.AIVerifyStatus = "InProgress";

// //             await _context.SaveChangesAsync();

// //             return asr;
// //         }

// //         /// <summary>
// //         /// Perform AI verification using Gemini 2.5 Flash
// //         /// </summary>
// //         public async Task<ASRVerification> PerformAIVerificationAsync(int asrId)
// //         {
// //             var asr = await _context.ASRVerifications
// //                 .Include(a => a.Order)
// //                 .Include(a => a.Customer)
// //                 .FirstOrDefaultAsync(a => a.Id == asrId);

// //             if (asr == null)
// //                 throw new Exception("ASR verification not found");

// //             if (string.IsNullOrEmpty(asr.DocumentUrls) || asr.DocumentUrls == "[]" ||
// //                 string.IsNullOrEmpty(asr.CustomerPhotoUrl) ||
// //                 string.IsNullOrEmpty(asr.SignatureUrl))
// //             {
// //                 asr.AIVerifyStatus = "Failed";
// //                 asr.AIVerifyReasons = JsonSerializer.Serialize(new List<string> { "Missing required documents" });
// //                 await _context.SaveChangesAsync();
// //                 return asr;
// //             }

// //             // If GeminiService is not available, use mock verification
// //             if (_geminiService == null)
// //             {
// //                 // Mock verification for testing
// //                 asr.AIVerifyScore = 0.85;
// //                 asr.AIVerifyReasons = JsonSerializer.Serialize(new List<string> 
// //                 { 
// //                     "Document verified",
// //                     "Face match confirmed",
// //                     "Signature captured"
// //                 });
// //                 asr.AIVerifyStatus = "Success";
// //                 asr.VerifiedAt = DateTime.UtcNow;

// //                 if (asr.Order != null)
// //                 {
// //                     asr.Order.ASRStatus = "Success";
// //                 }

// //                 await _context.SaveChangesAsync();
// //                 return asr;
// //             }

// //             try
// //             {
// //                 // Parse document URLs
// //                 var documentUrls = JsonSerializer.Deserialize<List<string>>(asr.DocumentUrls) 
// //                     ?? new List<string>();

// //                 // Call Gemini Service for verification
// //                 var verificationResult = await _geminiService.VerifyASRDocumentsAsync(
// //                     documentUrls,
// //                     asr.CustomerPhotoUrl!,
// //                     asr.SignatureUrl!,
// //                     asr.Order?.ReceiverName ?? "",
// //                     asr.Customer?.UserFName + " " + asr.Customer?.UserLName ?? ""
// //                 );

// //                 asr.AIVerifyScore = verificationResult.Score;
// //                 asr.AIVerifyReasons = JsonSerializer.Serialize(verificationResult.Reasons);
// //                 asr.AIVerifyStatus = verificationResult.IsVerified ? "Success" : "Failed";
// //                 asr.VerifiedAt = DateTime.UtcNow;

// //                 // Update order status
// //                 if (asr.Order != null)
// //                 {
// //                     asr.Order.ASRStatus = verificationResult.IsVerified ? "Success" : "Failed";
// //                 }

// //                 await _context.SaveChangesAsync();

// //                 return asr;
// //             }
// //             catch (Exception ex)
// //             {
// //                 asr.AIVerifyStatus = "Failed";
// //                 asr.AIVerifyReasons = JsonSerializer.Serialize(new List<string> 
// //                 { 
// //                     $"AI verification error: {ex.Message}" 
// //                 });
// //                 await _context.SaveChangesAsync();
// //                 return asr;
// //             }
// //         }

// //         /// <summary>
// //         /// Admin can override ASR failure
// //         /// </summary>
// //         public async Task<ASRVerification> AdminOverrideAsync(
// //             int asrId, 
// //             int adminId, 
// //             string reason)
// //         {
// //             var asr = await _context.ASRVerifications
// //                 .Include(a => a.Order)
// //                 .FirstOrDefaultAsync(a => a.Id == asrId);

// //             if (asr == null)
// //                 throw new Exception("ASR verification not found");

// //             asr.IsAdminOverride = true;
// //             asr.OverriddenByAdminId = adminId;
// //             asr.OverrideReason = reason;
// //             asr.AIVerifyStatus = "AdminOverride";
// //             asr.VerifiedAt = DateTime.UtcNow;

// //             if (asr.Order != null)
// //             {
// //                 asr.Order.ASRStatus = "AdminOverride";
// //             }

// //             await _context.SaveChangesAsync();

// //             return asr;
// //         }

// //         /// <summary>
// //         /// Get ASR verification details
// //         /// </summary>
// //         public async Task<ASRVerification?> GetASRVerificationAsync(int orderId)
// //         {
// //             return await _context.ASRVerifications
// //                 .Include(a => a.Order)
// //                 .Include(a => a.Customer)
// //                 .Include(a => a.Driver)
// //                 .FirstOrDefaultAsync(a => a.OrderId == orderId);
// //         }

// //         /// <summary>
// //         /// Retry ASR verification
// //         /// </summary>
// //         public async Task<ASRVerification> RetryVerificationAsync(int asrId)
// //         {
// //             var asr = await _context.ASRVerifications.FindAsync(asrId);
// //             if (asr == null)
// //                 throw new Exception("ASR verification not found");

// //             asr.RetryCount++;
// //             asr.AIVerifyStatus = "Pending";
// //             asr.DocumentUrls = "[]";
// //             asr.CustomerPhotoUrl = null;
// //             asr.SignatureUrl = null;
// //             asr.CustomerUploadedAt = null;

// //             await _context.SaveChangesAsync();

// //             return asr;
// //         }
// //     }

// //     // DTOs for Gemini response
// //     public class ASRVerificationResult
// //     {
// //         public bool IsVerified { get; set; }
// //         public double Score { get; set; }
// //         public List<string> Reasons { get; set; } = new();
// //     }
// // }

// using Backend.Data;
// using Backend.Domain.Entity;
// using Microsoft.EntityFrameworkCore;
// using System.Text.Json;

// namespace Backend.Services
// {
//     public class ASRService
//     {
//         private readonly AppDbContext _context;
//         private readonly VerificationService _verificationService;

//         public ASRService(AppDbContext context, VerificationService verificationService)
//         {
//             _context = context;
//             _verificationService = verificationService;
//         }

//         public async Task<ASRVerification> CreateASRRequestAsync(int orderId, int driverId)
//         {
//             var order = await _context.Orders
//                 .Include(o => o.Customer)
//                 .FirstOrDefaultAsync(o => o.Id == orderId);

//             if (order == null)
//                 throw new Exception("Order not found");

//             if (!order.IsASR)
//                 throw new Exception("Order does not require ASR");

//             var existingASR = await _context.ASRVerifications
//                 .FirstOrDefaultAsync(a => a.OrderId == orderId);

//             if (existingASR != null)
//                 return existingASR;

//             var asrVerification = new ASRVerification
//             {
//                 OrderId = orderId,
//                 CustomerId = order.CustomerId ?? 0,
//                 DriverId = driverId,
//                 AIVerifyStatus = "Pending",
//                 RequestedAt = DateTime.UtcNow,
//                 DocumentUrls = "[]"
//             };

//             _context.ASRVerifications.Add(asrVerification);
//             await _context.SaveChangesAsync();

//             order.ASRVerificationId = asrVerification.Id;
//             order.ASRStatus = "Pending";
//             await _context.SaveChangesAsync();

//             return asrVerification;
//         }

//         public async Task<ASRVerification> UploadCustomerDocumentsAsync(
//             int asrId, 
//             List<string> documentUrls)
//         {
//             var asr = await _context.ASRVerifications.FindAsync(asrId);
//             if (asr == null)
//                 throw new Exception("ASR verification not found");

//             asr.DocumentUrls = JsonSerializer.Serialize(documentUrls);
//             asr.CustomerUploadedAt = DateTime.UtcNow;
//             asr.AIVerifyStatus = "DocumentsReceived";

//             await _context.SaveChangesAsync();

//             return asr;
//         }

//         public async Task<ASRVerification> UploadDriverCapturesAsync(
//             int asrId,
//             string customerPhotoUrl,
//             string signatureUrl)
//         {
//             var asr = await _context.ASRVerifications.FindAsync(asrId);
//             if (asr == null)
//                 throw new Exception("ASR verification not found");

//             asr.CustomerPhotoUrl = customerPhotoUrl;
//             asr.SignatureUrl = signatureUrl;
//             asr.AIVerifyStatus = "InProgress";

//             await _context.SaveChangesAsync();

//             return asr;
//         }

//         /// <summary>
//         /// Perform REAL AI verification using Python microservice
//         /// </summary>
//         // public async Task<ASRVerification> PerformAIVerificationAsync(int asrId)
//         // {
//         //     var asr = await _context.ASRVerifications
//         //         .Include(a => a.Order)
//         //         .Include(a => a.Customer)
//         //         .FirstOrDefaultAsync(a => a.Id == asrId);

//         //     if (asr == null)
//         //         throw new Exception("ASR verification not found");

//         //     if (string.IsNullOrEmpty(asr.DocumentUrls) || asr.DocumentUrls == "[]" ||
//         //         string.IsNullOrEmpty(asr.CustomerPhotoUrl) ||
//         //         string.IsNullOrEmpty(asr.SignatureUrl))
//         //     {
//         //         asr.AIVerifyStatus = "Failed";
//         //         asr.AIVerifyReasons = JsonSerializer.Serialize(new List<string> { "Missing required documents" });
//         //         await _context.SaveChangesAsync();
//         //         return asr;
//         //     }

//         //     try
//         //     {
//         //         var documentUrls = JsonSerializer.Deserialize<List<string>>(asr.DocumentUrls) 
//         //             ?? new List<string>();

//         //         // Call real verification service
//         //         var verificationResult = await _verificationService.VerifyCompleteASRAsync(
//         //             documentUrls,
//         //             asr.CustomerPhotoUrl!,
//         //             asr.SignatureUrl!
//         //         );

//         //         asr.AIVerifyScore = verificationResult.Score;
//         //         asr.AIVerifyReasons = JsonSerializer.Serialize(verificationResult.Reasons);
//         //         asr.AIVerifyStatus = verificationResult.Verified ? "Success" : "Failed";
//         //         asr.VerifiedAt = DateTime.UtcNow;

//         //         // Store Aadhaar data if available (masked)
//         //         if (verificationResult.AadhaarData != null)
//         //         {
//         //             asr.VerificationMetadata = JsonSerializer.Serialize(new
//         //             {
//         //                 AadhaarName = verificationResult.AadhaarData.Name,
//         //                 MaskedAadhaar = verificationResult.AadhaarData.MaskedAadhaar,
//         //                 Gender = verificationResult.AadhaarData.Gender,
//         //                 VerificationType = verificationResult.VerificationType
//         //             });
//         //         }

//         //         if (asr.Order != null)
//         //         {
//         //             asr.Order.ASRStatus = verificationResult.Verified ? "Success" : "Failed";
//         //         }

//         //         await _context.SaveChangesAsync();

//         //         return asr;
//         //     }
//         //     catch (Exception ex)
//         //     {
//         //         asr.AIVerifyStatus = "Failed";
//         //         asr.AIVerifyReasons = JsonSerializer.Serialize(new List<string> 
//         //         { 
//         //             $"AI verification error: {ex.Message}" 
//         //         });
//         //         await _context.SaveChangesAsync();
//         //         return asr;
//         //     }
//         // }

//        public async Task<ASRVerification> PerformAIVerificationAsync(int asrId)
// {
//     var asr = await _context.ASRVerifications
//         .Include(a => a.Order)
//         .Include(a => a.Customer)
//         .FirstOrDefaultAsync(a => a.Id == asrId);

//     if (asr == null)
//         throw new Exception("ASR verification not found");

//     // Mandatory presence check
//     if (string.IsNullOrEmpty(asr.DocumentUrls) || asr.DocumentUrls == "[]" ||
//         string.IsNullOrEmpty(asr.CustomerPhotoUrl) ||
//         string.IsNullOrEmpty(asr.SignatureUrl))
//     {
//         asr.AIVerifyStatus = "Failed";
//         asr.AIVerifyReasons = JsonSerializer.Serialize(
//             new[] { "Missing required documents or captures" });
//         await _context.SaveChangesAsync();
//         return asr;
//     }

//     var reasons = new List<string>();
//     double score = 0;

//     try
//     {
//         // -------------------------------------------------
//         // 1️⃣ Parse Aadhaar images
//         // -------------------------------------------------
//         var documentUrls = JsonSerializer.Deserialize<List<string>>(asr.DocumentUrls)
//             ?? new List<string>();

//         var aadhaarFrontBase64 = documentUrls.FirstOrDefault();
//         if (string.IsNullOrEmpty(aadhaarFrontBase64))
//             throw new Exception("Aadhaar front image missing");

//         // -------------------------------------------------
//         // 2️⃣ Aadhaar OCR – Gemini (MANDATORY)
//         // -------------------------------------------------
//         var ocr = await _verificationService
//             .AadhaarOcrWithGeminiAsync(aadhaarFrontBase64);

//         if (ocr == null || string.IsNullOrWhiteSpace(ocr.Name))
//             throw new Exception("Aadhaar OCR failed");

//         score += 0.20;
//         reasons.Add("✓ Aadhaar OCR validated (Gemini)");

//         // -------------------------------------------------
//         // 3️⃣ Aadhaar number validation (format-level)
//         // -------------------------------------------------
//         if (string.IsNullOrEmpty(ocr.AadhaarLast4))
//             throw new Exception("Aadhaar number not detected");

//         score += 0.10;
//         reasons.Add("✓ Aadhaar number extracted");

//         // -------------------------------------------------
//         // 4️⃣ Age verification (MANDATORY)
//         // -------------------------------------------------
//         int age = CalculateAgeFromDob(
//             DateTime.TryParse(ocr.Dob, out var dob) ? dob : null,
//             int.TryParse(ocr.YearOfBirth, out var yob) ? yob : null
//         );

//         if (age < 18)
//             throw new Exception("Age below 18");

//         score += 0.10;
//         reasons.Add($"✓ Age verified ({age} years)");

//         // -------------------------------------------------
//         // 5️⃣ OPTIONAL Aadhaar QR verification (NON-BLOCKING)
//         // -------------------------------------------------
//         try
//         {
//             var qrResult = await _verificationService
//                 .TryQrVerificationAsync(aadhaarFrontBase64);

//             if (qrResult?.IsOriginal == true)
//             {
//                 score += 0.10;
//                 reasons.Add("✓ Aadhaar Secure QR verified (bonus)");
//             }
//             else
//             {
//                 reasons.Add("ℹ️ Aadhaar QR not detected (optional)");
//             }
//         }
//         catch
//         {
//             reasons.Add("ℹ️ Aadhaar QR skipped due to error (optional)");
//         }

//         // -------------------------------------------------
//         // 6️⃣ Face match (MANDATORY)
//         // -------------------------------------------------
//         var faceResult = await _verificationService.FaceMatchAsync(
//             aadhaarFrontBase64,
//             asr.CustomerPhotoUrl!
//         );

//         if (!faceResult.FaceMatch)
//             throw new Exception("Face mismatch");

//         score += 0.30;
//         reasons.Add($"✓ Face matched ({faceResult.Similarity:F1}%)");

//         // -------------------------------------------------
//         // 7️⃣ Signature presence (MANDATORY)
//         // -------------------------------------------------
//         score += 0.20;
//         reasons.Add("✓ Signature captured");

//         // -------------------------------------------------
//         // 8️⃣ Final decision
//         // -------------------------------------------------
//         bool verified = score >= 0.80;

//         asr.AIVerifyScore = score;
//         asr.AIVerifyStatus = verified ? "Success" : "Failed";
//         asr.AIVerifyReasons = JsonSerializer.Serialize(reasons);
//         asr.VerifiedAt = DateTime.UtcNow;

//         asr.VerificationMetadata = JsonSerializer.Serialize(new
//         {
//             AadhaarName = ocr.Name,
//             MaskedAadhaar = $"XXXX-XXXX-{ocr.AadhaarLast4}",
//             Gender = ocr.Gender,
//             VerificationType = "Gemini OCR + Face Match (QR Optional)"
//         });

//         if (asr.Order != null)
//             asr.Order.ASRStatus = verified ? "Success" : "Failed";

//         await _context.SaveChangesAsync();
//         return asr;
//     }
//     catch (Exception ex)
//     {
//         asr.AIVerifyStatus = "Failed";
//         asr.AIVerifyReasons = JsonSerializer.Serialize(
//             new[] { $"AI verification error: {ex.Message}" });
//         await _context.SaveChangesAsync();
//         return asr;
//     }
// }


//         public async Task<ASRVerification> AdminOverrideAsync(
//             int asrId, 
//             int adminId, 
//             string reason)
//         {
//             var asr = await _context.ASRVerifications
//                 .Include(a => a.Order)
//                 .FirstOrDefaultAsync(a => a.Id == asrId);

//             if (asr == null)
//                 throw new Exception("ASR verification not found");

//             asr.IsAdminOverride = true;
//             asr.OverriddenByAdminId = adminId;
//             asr.OverrideReason = reason;
//             asr.AIVerifyStatus = "AdminOverride";
//             asr.VerifiedAt = DateTime.UtcNow;

//             if (asr.Order != null)
//             {
//                 asr.Order.ASRStatus = "AdminOverride";
//             }

//             await _context.SaveChangesAsync();

//             return asr;
//         }

//         private int CalculateAgeFromDob(DateTime? dob, int? yob)
// {
//     if (dob.HasValue)
//     {
//         var today = DateTime.UtcNow.Date;
//         int age = today.Year - dob.Value.Year;
//         if (dob.Value.Date > today.AddYears(-age)) age--;
//         return age;
//     }

//     if (yob.HasValue)
//     {
//         return DateTime.UtcNow.Year - yob.Value;
//     }

//     return 0;
// }


//         public async Task<ASRVerification?> GetASRVerificationAsync(int orderId)
//         {
//             return await _context.ASRVerifications
//                 .Include(a => a.Order)
//                 .Include(a => a.Customer)
//                 .Include(a => a.Driver)
//                 .FirstOrDefaultAsync(a => a.OrderId == orderId);
//         }

//         public async Task<ASRVerification> RetryVerificationAsync(int asrId)
//         {
//             var asr = await _context.ASRVerifications.FindAsync(asrId);
//             if (asr == null)
//                 throw new Exception("ASR verification not found");

//             asr.RetryCount++;
//             asr.AIVerifyStatus = "Pending";
//             asr.DocumentUrls = "[]";
//             asr.CustomerPhotoUrl = null;
//             asr.SignatureUrl = null;
//             asr.CustomerUploadedAt = null;

//             await _context.SaveChangesAsync();

//             return asr;
//         }
//     }
// }

// using Backend.Data;
// using Backend.Domain.Entity;
// using Microsoft.EntityFrameworkCore;
// using System.Text.Json;

// namespace Backend.Services
// {
//     public class ASRService
//     {
//         private readonly AppDbContext _context;
//         private readonly VerificationService _verificationService;

//         public ASRService(AppDbContext context, VerificationService verificationService)
//         {
//             _context = context;
//             _verificationService = verificationService;
//         }

//         public async Task<ASRVerification> CreateASRRequestAsync(int orderId, int driverId)
//         {
//             var order = await _context.Orders
//                 .Include(o => o.Customer)
//                 .FirstOrDefaultAsync(o => o.Id == orderId);

//             if (order == null)
//                 throw new Exception("Order not found");

//             if (!order.IsASR)
//                 throw new Exception("Order does not require ASR");

//             var existingASR = await _context.ASRVerifications
//                 .FirstOrDefaultAsync(a => a.OrderId == orderId);

//             if (existingASR != null)
//                 return existingASR;

//             var asrVerification = new ASRVerification
//             {
//                 OrderId = orderId,
//                 CustomerId = order.CustomerId ?? 0,
//                 DriverId = driverId,
//                 AIVerifyStatus = "Pending",
//                 RequestedAt = DateTime.UtcNow,
//                 DocumentUrls = "[]",
//                 AadhaarNumber = ""
//             };

//             _context.ASRVerifications.Add(asrVerification);
//             await _context.SaveChangesAsync();

//             order.ASRVerificationId = asrVerification.Id;
//             order.ASRStatus = "Pending";
//             await _context.SaveChangesAsync();

//             return asrVerification;
//         }

//         public async Task<ASRVerification> UploadCustomerDocumentsAsync(
//             int asrId, 
//             List<string> documentUrls,
//             string aadhaarNumber)
//         {
//             var asr = await _context.ASRVerifications.FindAsync(asrId);
//             if (asr == null)
//                 throw new Exception("ASR verification not found");

//             asr.DocumentUrls = JsonSerializer.Serialize(documentUrls);
//             asr.AadhaarNumber = aadhaarNumber;
//             asr.CustomerUploadedAt = DateTime.UtcNow;
//             asr.AIVerifyStatus = "DocumentsReceived";

//             await _context.SaveChangesAsync();

//             return asr;
//         }

//         public async Task<ASRVerification> UploadDriverCapturesAsync(
//             int asrId,
//             string customerPhotoUrl,
//             string signatureUrl)
//         {
//             var asr = await _context.ASRVerifications.FindAsync(asrId);
//             if (asr == null)
//                 throw new Exception("ASR verification not found");

//             asr.CustomerPhotoUrl = customerPhotoUrl;
//             asr.SignatureUrl = signatureUrl;
//             asr.AIVerifyStatus = "InProgress";

//             await _context.SaveChangesAsync();

//             return asr;
//         }

//         /// <summary>
//         /// Perform comprehensive AI verification
//         /// Uses Gemini 2.5 Flash for OCR and signature verification
//         /// Uses APYHub for Aadhaar number validation
//         /// Uses DeepFace for face matching
//         /// </summary>
//         public async Task<ASRVerification> PerformAIVerificationAsync(int asrId)
//         {
//             var asr = await _context.ASRVerifications
//                 .Include(a => a.Order)
//                 .Include(a => a.Customer)
//                 .FirstOrDefaultAsync(a => a.Id == asrId);

//             if (asr == null)
//                 throw new Exception("ASR verification not found");

//             // Check required data
//             if (string.IsNullOrEmpty(asr.DocumentUrls) || asr.DocumentUrls == "[]" ||
//                 string.IsNullOrEmpty(asr.CustomerPhotoUrl) ||
//                 string.IsNullOrEmpty(asr.SignatureUrl) ||
//                 string.IsNullOrEmpty(asr.AadhaarNumber))
//             {
//                 asr.AIVerifyStatus = "Failed";
//                 asr.AIVerifyReasons = JsonSerializer.Serialize(
//                     new[] { "Missing required documents, captures, or Aadhaar number" });
//                 await _context.SaveChangesAsync();
//                 return asr;
//             }

//             var reasons = new List<string>();
//             double score = 0;

//             try
//             {
//                 var documentUrls = JsonSerializer.Deserialize<List<string>>(asr.DocumentUrls)
//                     ?? new List<string>();

//                 var aadhaarFrontBase64 = documentUrls.FirstOrDefault();
//                 if (string.IsNullOrEmpty(aadhaarFrontBase64))
//                     throw new Exception("Aadhaar front image missing");

//                 // -------------------------------------------------
//                 // 1️⃣ Aadhaar OCR – Gemini 2.5 Flash
//                 // -------------------------------------------------
//                 Console.WriteLine("Step 1: Running Gemini OCR on Aadhaar card...");
//                 var ocr = await _verificationService
//                     .AadhaarOcrWithGeminiAsync(aadhaarFrontBase64);

//                 if (ocr == null || string.IsNullOrWhiteSpace(ocr.Name))
//                     throw new Exception("Aadhaar OCR failed - could not extract details");

//                 score += 0.15;
//                 reasons.Add($"✓ Aadhaar OCR successful - Name: {ocr.Name}");

//                 // -------------------------------------------------
//                 // 2️⃣ Aadhaar Number Validation – APYHub
//                 // -------------------------------------------------
//                 Console.WriteLine("Step 2: Validating Aadhaar number with APYHub...");
//                 var isValidFormat = await _verificationService
//                     .ValidateAadhaarNumberAsync(asr.AadhaarNumber);

//                 if (!isValidFormat)
//                     throw new Exception("Invalid Aadhaar number format");

//                 score += 0.10;
//                 reasons.Add("✓ Aadhaar number format validated (APYHub)");

//                 // -------------------------------------------------
//                 // 3️⃣ Match Entered Aadhaar with OCR Aadhaar
//                 // -------------------------------------------------
//                 Console.WriteLine("Step 3: Comparing entered Aadhaar with extracted Aadhaar...");
//                 var enteredAadhaar = asr.AadhaarNumber.Replace(" ", "").Replace("-", "");
//                 var extractedAadhaar = ocr.AadhaarNumber?.Replace(" ", "").Replace("-", "") ?? "";

//                 if (!string.IsNullOrEmpty(extractedAadhaar))
//                 {
//                     // Check if entered number matches extracted number
//                     if (enteredAadhaar == extractedAadhaar)
//                     {
//                         score += 0.15;
//                         reasons.Add("✓ Entered Aadhaar matches card number");
//                     }
//                     else
//                     {
//                         // Check last 4 digits match
//                         var enteredLast4 = enteredAadhaar.Length >= 4 
//                             ? enteredAadhaar.Substring(enteredAadhaar.Length - 4) 
//                             : "";
//                         var extractedLast4 = extractedAadhaar.Length >= 4 
//                             ? extractedAadhaar.Substring(extractedAadhaar.Length - 4) 
//                             : "";

//                         if (enteredLast4 == extractedLast4 && !string.IsNullOrEmpty(enteredLast4))
//                         {
//                             score += 0.10;
//                             reasons.Add("⚠️ Aadhaar last 4 digits match (partial verification)");
//                         }
//                         else
//                         {
//                             throw new Exception("Entered Aadhaar number does not match the card");
//                         }
//                     }
//                 }
//                 else
//                 {
//                     // OCR couldn't extract full number, but format is valid
//                     score += 0.05;
//                     reasons.Add("⚠️ Aadhaar number extracted partially (format validated)");
//                 }

//                 // -------------------------------------------------
//                 // 4️⃣ Age Verification
//                 // -------------------------------------------------
//                 Console.WriteLine("Step 4: Verifying age...");
//                 int age = CalculateAgeFromDob(
//                     DateTime.TryParse(ocr.Dob, out var dob) ? dob : null,
//                     int.TryParse(ocr.YearOfBirth, out var yob) ? yob : null
//                 );

//                 if (age < 18)
//                     throw new Exception("Customer is under 18 years old");

//                 score += 0.10;
//                 reasons.Add($"✓ Age verified: {age} years");

//                 // -------------------------------------------------
//                 // 5️⃣ Face Match – DeepFace via Python
//                 // -------------------------------------------------
//                 Console.WriteLine("Step 5: Performing face match...");
//                 var faceResult = await _verificationService.FaceMatchAsync(
//                     aadhaarFrontBase64,
//                     asr.CustomerPhotoUrl!
//                 );

//                 if (!faceResult.FaceMatch)
//                     throw new Exception($"Face mismatch: {faceResult.Reason}");

//                 score += 0.30;
//                 reasons.Add($"✓ Face matched: {faceResult.Similarity:F1}% similarity");

//                 // -------------------------------------------------
//                 // 6️⃣ Signature Verification – Gemini 2.5 Flash
//                 // -------------------------------------------------
//                 Console.WriteLine("Step 6: Verifying signature with Gemini AI...");
//                 var signatureMatch = await _verificationService
//                     .VerifySignatureWithGeminiAsync(aadhaarFrontBase64, asr.SignatureUrl!);

//                 if (signatureMatch)
//                 {
//                     score += 0.20;
//                     reasons.Add("✓ Signature verified as matching");
//                 }
//                 else
//                 {
//                     score += 0.05;
//                     reasons.Add("⚠️ Signature shows some differences (manual review recommended)");
//                 }

//                 // -------------------------------------------------
//                 // 7️⃣ Final Decision
//                 // -------------------------------------------------
//                 bool verified = score >= 0.75;

//                 asr.AIVerifyScore = score;
//                 asr.AIVerifyStatus = verified ? "Success" : "Failed";
//                 asr.AIVerifyReasons = JsonSerializer.Serialize(reasons);
//                 asr.VerifiedAt = DateTime.UtcNow;

//                 // Store extracted data
//                 asr.VerificationMetadata = JsonSerializer.Serialize(new
//                 {
//                     aadhaarName = ocr.Name,
//                     maskedAadhaar = $"XXXX-XXXX-{enteredAadhaar.Substring(Math.Max(0, enteredAadhaar.Length - 4))}",
//                     gender = ocr.Gender,
//                     age = age,
//                     dob = ocr.Dob,
//                     address = ocr.Address,
//                     verificationType = "Gemini 2.5 Flash OCR + APYHub + DeepFace",
//                     verifiedAt = DateTime.UtcNow
//                 });

//                 if (asr.Order != null)
//                     asr.Order.ASRStatus = verified ? "Success" : "Failed";

//                 await _context.SaveChangesAsync();

//                 Console.WriteLine($"✅ Verification complete: {asr.AIVerifyStatus}, Score: {score:F2}");
//                 return asr;
//             }
//             catch (Exception ex)
//             {
//                 Console.WriteLine($"❌ Verification failed: {ex.Message}");
//                 asr.AIVerifyStatus = "Failed";
//                 asr.AIVerifyReasons = JsonSerializer.Serialize(
//                     new[] { $"Verification error: {ex.Message}" });
//                 await _context.SaveChangesAsync();
//                 return asr;
//             }
//         }

//         public async Task<ASRVerification> AdminOverrideAsync(
//             int asrId, 
//             int adminId, 
//             string reason)
//         {
//             var asr = await _context.ASRVerifications
//                 .Include(a => a.Order)
//                 .FirstOrDefaultAsync(a => a.Id == asrId);

//             if (asr == null)
//                 throw new Exception("ASR verification not found");

//             asr.IsAdminOverride = true;
//             asr.OverriddenByAdminId = adminId;
//             asr.OverrideReason = reason;
//             asr.AIVerifyStatus = "AdminOverride";
//             asr.VerifiedAt = DateTime.UtcNow;

//             if (asr.Order != null)
//             {
//                 asr.Order.ASRStatus = "AdminOverride";
//             }

//             await _context.SaveChangesAsync();

//             return asr;
//         }

//         private int CalculateAgeFromDob(DateTime? dob, int? yob)
//         {
//             if (dob.HasValue)
//             {
//                 var today = DateTime.UtcNow.Date;
//                 int age = today.Year - dob.Value.Year;
//                 if (dob.Value.Date > today.AddYears(-age)) age--;
//                 return age;
//             }

//             if (yob.HasValue)
//             {
//                 return DateTime.UtcNow.Year - yob.Value;
//             }

//             return 0;
//         }

//         public async Task<ASRVerification?> GetASRVerificationAsync(int orderId)
//         {
//             return await _context.ASRVerifications
//                 .Include(a => a.Order)
//                 .Include(a => a.Customer)
//                 .Include(a => a.Driver)
//                 .FirstOrDefaultAsync(a => a.OrderId == orderId);
//         }

//         public async Task<ASRVerification> RetryVerificationAsync(int asrId)
//         {
//             var asr = await _context.ASRVerifications.FindAsync(asrId);
//             if (asr == null)
//                 throw new Exception("ASR verification not found");

//             asr.RetryCount++;
//             asr.AIVerifyStatus = "Pending";
//             asr.DocumentUrls = "[]";
//             asr.AadhaarNumber = "";
//             asr.CustomerPhotoUrl = null;
//             asr.SignatureUrl = null;
//             asr.CustomerUploadedAt = null;

//             await _context.SaveChangesAsync();

//             return asr;
//         }
//     }
// }

using Backend.Data;
using Backend.Domain.Entity;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Backend.Services
{
    public class ASRService
    {
        private readonly AppDbContext _context;
        private readonly VerificationService _verificationService;

        public ASRService(AppDbContext context, VerificationService verificationService)
        {
            _context = context;
            _verificationService = verificationService;
        }

        public async Task<ASRVerification> CreateASRRequestAsync(int orderId, int driverId)
        {
            var order = await _context.Orders
                .Include(o => o.Customer)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                throw new Exception("Order not found");

            if (!order.IsASR)
                throw new Exception("Order does not require ASR");

            var existingASR = await _context.ASRVerifications
                .FirstOrDefaultAsync(a => a.OrderId == orderId);

            if (existingASR != null)
                return existingASR;

            var asrVerification = new ASRVerification
            {
                OrderId = orderId,
                CustomerId = order.CustomerId ?? 0,
                DriverId = driverId,
                AIVerifyStatus = "Pending",
                RequestedAt = DateTime.UtcNow,
                DocumentUrls = "[]",
                AadhaarNumber = ""
            };

            _context.ASRVerifications.Add(asrVerification);
            await _context.SaveChangesAsync();

            order.ASRVerificationId = asrVerification.Id;
            order.ASRStatus = "Pending";
            await _context.SaveChangesAsync();

            return asrVerification;
        }

        public async Task<ASRVerification> UploadCustomerDocumentsAsync(
            int asrId, 
            List<string> documentUrls,
            string aadhaarNumber)
        {
            var asr = await _context.ASRVerifications.FindAsync(asrId);
            if (asr == null)
                throw new Exception("ASR verification not found");

            asr.DocumentUrls = JsonSerializer.Serialize(documentUrls);
            asr.AadhaarNumber = aadhaarNumber;
            asr.CustomerUploadedAt = DateTime.UtcNow;
            asr.AIVerifyStatus = "DocumentsReceived";

            await _context.SaveChangesAsync();

            return asr;
        }

        public async Task<ASRVerification> UploadDriverCapturesAsync(
            int asrId,
            string customerPhotoUrl,
            string signatureUrl)
        {
            var asr = await _context.ASRVerifications.FindAsync(asrId);
            if (asr == null)
                throw new Exception("ASR verification not found");

            asr.CustomerPhotoUrl = customerPhotoUrl;
            asr.SignatureUrl = signatureUrl;
            asr.AIVerifyStatus = "InProgress";

            await _context.SaveChangesAsync();

            return asr;
        }

        /// <summary>
        /// Perform comprehensive AI verification
        /// Uses Gemini 2.5 Flash for OCR and signature verification
        /// Uses APYHub for Aadhaar number validation
        /// Uses DeepFace for face matching
        /// </summary>
        public async Task<ASRVerification> PerformAIVerificationAsync(int asrId)
        {
            var asr = await _context.ASRVerifications
                .Include(a => a.Order)
                .Include(a => a.Customer)
                .FirstOrDefaultAsync(a => a.Id == asrId);

            if (asr == null)
                throw new Exception("ASR verification not found");

            // Check required data
            if (string.IsNullOrEmpty(asr.DocumentUrls) || asr.DocumentUrls == "[]" ||
                string.IsNullOrEmpty(asr.CustomerPhotoUrl) ||
                string.IsNullOrEmpty(asr.SignatureUrl) ||
                string.IsNullOrEmpty(asr.AadhaarNumber))
            {
                asr.AIVerifyStatus = "Failed";
                asr.AIVerifyReasons = JsonSerializer.Serialize(
                    new[] { "Missing required documents, captures, or Aadhaar number" });
                await _context.SaveChangesAsync();
                return asr;
            }

            var reasons = new List<string>();
            double score = 0;

            try
            {
                var documentUrls = JsonSerializer.Deserialize<List<string>>(asr.DocumentUrls)
                    ?? new List<string>();

                var aadhaarFrontBase64 = documentUrls.FirstOrDefault();
                if (string.IsNullOrEmpty(aadhaarFrontBase64))
                    throw new Exception("Aadhaar front image missing");

                // -------------------------------------------------
                // 1️⃣ Aadhaar OCR – Gemini 2.5 Flash
                // -------------------------------------------------
                Console.WriteLine("Step 1: Running Gemini OCR on Aadhaar card...");
                Console.WriteLine($"Aadhaar image size: {aadhaarFrontBase64.Length} characters");
                
                var ocr = await _verificationService
                    .AadhaarOcrWithGeminiAsync(aadhaarFrontBase64);

                if (ocr == null)
                {
                    Console.WriteLine("❌ OCR returned null");
                    throw new Exception("Aadhaar OCR failed - Gemini could not process the image. Please ensure the image is clear and well-lit.");
                }

                if (string.IsNullOrWhiteSpace(ocr.Name))
                {
                    Console.WriteLine($"❌ OCR returned empty name. Full OCR result: Name={ocr.Name}, DOB={ocr.Dob}, Gender={ocr.Gender}, Aadhaar={ocr.AadhaarNumber}");
                    throw new Exception("Aadhaar OCR failed - Could not extract name from card. Please upload a clearer image.");
                }

                Console.WriteLine($"✅ OCR Success: Name={ocr.Name}, Gender={ocr.Gender}, DOB={ocr.Dob}, Aadhaar={ocr.AadhaarNumber}");
                score += 0.15;
                reasons.Add($"✓ Aadhaar OCR successful - Name: {ocr.Name}");

                // -------------------------------------------------
                // 2️⃣ Aadhaar Number Validation – APYHub
                // -------------------------------------------------
                Console.WriteLine("Step 2: Validating Aadhaar number with APYHub...");
                var isValidFormat = await _verificationService
                    .ValidateAadhaarNumberAsync(asr.AadhaarNumber);

                if (!isValidFormat)
                    throw new Exception("Invalid Aadhaar number format");

                score += 0.10;
                reasons.Add("✓ Aadhaar number format validated (APYHub)");

                // -------------------------------------------------
                // 3️⃣ Match Entered Aadhaar with OCR Aadhaar
                // -------------------------------------------------
                Console.WriteLine("Step 3: Comparing entered Aadhaar with extracted Aadhaar...");
                var enteredAadhaar = asr.AadhaarNumber.Replace(" ", "").Replace("-", "");
                var extractedAadhaar = ocr.AadhaarNumber?.Replace(" ", "").Replace("-", "").Replace("X", "").Replace("x", "") ?? "";

                Console.WriteLine($"Entered Aadhaar: {enteredAadhaar}");
                Console.WriteLine($"Extracted Aadhaar: {extractedAadhaar}");

                if (!string.IsNullOrEmpty(extractedAadhaar) && extractedAadhaar.Length >= 4)
                {
                    // Check if entered number matches extracted number
                    if (enteredAadhaar == extractedAadhaar)
                    {
                        score += 0.15;
                        reasons.Add("✓ Entered Aadhaar matches card number exactly");
                    }
                    else
                    {
                        // Check last 4 digits match (common case for masked Aadhaar)
                        var enteredLast4 = enteredAadhaar.Length >= 4 
                            ? enteredAadhaar.Substring(enteredAadhaar.Length - 4) 
                            : "";
                        var extractedLast4 = extractedAadhaar.Length >= 4 
                            ? extractedAadhaar.Substring(extractedAadhaar.Length - 4) 
                            : "";

                        Console.WriteLine($"Comparing last 4 digits: {enteredLast4} vs {extractedLast4}");

                        if (enteredLast4 == extractedLast4 && !string.IsNullOrEmpty(enteredLast4))
                        {
                            score += 0.10;
                            reasons.Add($"✓ Aadhaar last 4 digits match: {enteredLast4}");
                        }
                        else
                        {
                            // Still give partial credit if format is valid
                            score += 0.05;
                            reasons.Add("⚠️ Aadhaar number format valid but could not verify exact match (card may be masked)");
                        }
                    }
                }
                else
                {
                    // OCR couldn't extract full number, but format is valid
                    Console.WriteLine("⚠️ Aadhaar number not extracted by OCR (card may be masked)");
                    score += 0.10;
                    reasons.Add("✓ Aadhaar number format validated (OCR extraction not possible - masked card)");
                }

                // -------------------------------------------------
                // 4️⃣ Age Verification
                // -------------------------------------------------
                Console.WriteLine("Step 4: Verifying age...");
                
                DateTime? parsedDob = null;
                if (!string.IsNullOrEmpty(ocr.Dob))
                {
                    // Try multiple date formats
                    string[] formats = { "dd/MM/yyyy", "dd-MM-yyyy", "dd.MM.yyyy", "yyyy-MM-dd" };
                    foreach (var format in formats)
                    {
                        if (DateTime.TryParseExact(ocr.Dob, format, null, System.Globalization.DateTimeStyles.None, out var date))
                        {
                            parsedDob = date;
                            break;
                        }
                    }
                }

                int age = CalculateAgeFromDob(
                    parsedDob,
                    int.TryParse(ocr.YearOfBirth, out var yob) ? yob : null
                );

                Console.WriteLine($"Calculated age: {age}");

                if (age == 0)
                {
                    Console.WriteLine("⚠️ Could not determine age from Aadhaar card");
                    score += 0.05;
                    reasons.Add("⚠️ Age could not be verified (DOB not clearly visible)");
                }
                else if (age < 18)
                {
                    throw new Exception($"Customer is under 18 years old (Age: {age})");
                }
                else
                {
                    score += 0.10;
                    reasons.Add($"✓ Age verified: {age} years");
                }

                // -------------------------------------------------
                // 5️⃣ Face Match – DeepFace via Python
                // -------------------------------------------------
                Console.WriteLine("Step 5: Performing face match...");
                var faceResult = await _verificationService.FaceMatchAsync(
                    aadhaarFrontBase64,
                    asr.CustomerPhotoUrl!
                );

                if (!faceResult.FaceMatch)
                    throw new Exception($"Face mismatch: {faceResult.Reason}");

                score += 0.30;
                reasons.Add($"✓ Face matched: {faceResult.Similarity:F1}% similarity");

                // -------------------------------------------------
                // 6️⃣ Signature Verification – Gemini 2.5 Flash
                // -------------------------------------------------
                Console.WriteLine("Step 6: Verifying signature with Gemini AI...");
                var signatureMatch = await _verificationService
                    .VerifySignatureWithGeminiAsync(aadhaarFrontBase64, asr.SignatureUrl!);

                if (signatureMatch)
                {
                    score += 0.20;
                    reasons.Add("✓ Signature verified as matching");
                }
                else
                {
                    score += 0.05;
                    reasons.Add("⚠️ Signature shows some differences (manual review recommended)");
                }

                // -------------------------------------------------
                // 7️⃣ Final Decision
                // -------------------------------------------------
                // Lower threshold to 0.65 to account for OCR challenges
                bool verified = score >= 0.65;

                Console.WriteLine($"📊 Final Score: {score:F2} (threshold: 0.65)");
                Console.WriteLine($"✅ Verification Result: {(verified ? "SUCCESS" : "FAILED")}");

                asr.AIVerifyScore = score;
                asr.AIVerifyStatus = verified ? "Success" : "Failed";
                asr.AIVerifyReasons = JsonSerializer.Serialize(reasons);
                asr.VerifiedAt = DateTime.UtcNow;

                // Store extracted data
                asr.VerificationMetadata = JsonSerializer.Serialize(new
                {
                    aadhaarName = ocr.Name,
                    maskedAadhaar = $"XXXX-XXXX-{enteredAadhaar.Substring(Math.Max(0, enteredAadhaar.Length - 4))}",
                    gender = ocr.Gender,
                    age = age,
                    dob = ocr.Dob,
                    address = ocr.Address,
                    verificationType = "Gemini 2.5 Flash OCR + APYHub + DeepFace",
                    verifiedAt = DateTime.UtcNow,
                    extractedAadhaarNumber = ocr.AadhaarNumber // For debugging
                });

                if (asr.Order != null)
                    asr.Order.ASRStatus = verified ? "Success" : "Failed";

                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ Verification complete: {asr.AIVerifyStatus}, Score: {score:F2}");
                Console.WriteLine($"📝 Reasons: {string.Join(", ", reasons)}");
                
                return asr;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Verification failed: {ex.Message}");
                asr.AIVerifyStatus = "Failed";
                asr.AIVerifyReasons = JsonSerializer.Serialize(
                    new[] { $"Verification error: {ex.Message}" });
                await _context.SaveChangesAsync();
                return asr;
            }
        }

        public async Task<ASRVerification> AdminOverrideAsync(
            int asrId, 
            int adminId, 
            string reason)
        {
            var asr = await _context.ASRVerifications
                .Include(a => a.Order)
                .FirstOrDefaultAsync(a => a.Id == asrId);

            if (asr == null)
                throw new Exception("ASR verification not found");

            asr.IsAdminOverride = true;
            asr.OverriddenByAdminId = adminId;
            asr.OverrideReason = reason;
            asr.AIVerifyStatus = "AdminOverride";
            asr.VerifiedAt = DateTime.UtcNow;

            if (asr.Order != null)
            {
                asr.Order.ASRStatus = "AdminOverride";
            }

            await _context.SaveChangesAsync();

            return asr;
        }

        private int CalculateAgeFromDob(DateTime? dob, int? yob)
        {
            if (dob.HasValue)
            {
                var today = DateTime.UtcNow.Date;
                int age = today.Year - dob.Value.Year;
                if (dob.Value.Date > today.AddYears(-age)) age--;
                return age;
            }

            if (yob.HasValue)
            {
                return DateTime.UtcNow.Year - yob.Value;
            }

            return 0;
        }

        public async Task<ASRVerification?> GetASRVerificationAsync(int orderId)
        {
            return await _context.ASRVerifications
                .Include(a => a.Order)
                .Include(a => a.Customer)
                .Include(a => a.Driver)
                .FirstOrDefaultAsync(a => a.OrderId == orderId);
        }

        public async Task<ASRVerification> RetryVerificationAsync(int asrId)
        {
            var asr = await _context.ASRVerifications.FindAsync(asrId);
            if (asr == null)
                throw new Exception("ASR verification not found");

            asr.RetryCount++;
            asr.AIVerifyStatus = "Pending";
            asr.DocumentUrls = "[]";
            asr.AadhaarNumber = "";
            asr.CustomerPhotoUrl = null;
            asr.SignatureUrl = null;
            asr.CustomerUploadedAt = null;

            await _context.SaveChangesAsync();

            return asr;
        }
    }
}