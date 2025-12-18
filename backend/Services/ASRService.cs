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

//                 // Aadhaar OCR – Gemini 2.5 Flash
//                 Console.WriteLine("Step 1: Running Gemini OCR on Aadhaar card...");
//                 Console.WriteLine($"Aadhaar image size: {aadhaarFrontBase64.Length} characters");
                
//                 var ocr = await _verificationService
//                     .AadhaarOcrWithGeminiAsync(aadhaarFrontBase64);

//                 if (ocr == null)
//                 {
//                     Console.WriteLine("❌ OCR returned null");
//                     throw new Exception("Aadhaar OCR failed - Gemini could not process the image. Please ensure the image is clear and well-lit.");
//                 }

//                 if (string.IsNullOrWhiteSpace(ocr.Name))
//                 {
//                     Console.WriteLine($"❌ OCR returned empty name. Full OCR result: Name={ocr.Name}, DOB={ocr.Dob}, Gender={ocr.Gender}, Aadhaar={ocr.AadhaarNumber}");
//                     throw new Exception("Aadhaar OCR failed - Could not extract name from card. Please upload a clearer image.");
//                 }

//                 Console.WriteLine($"✅ OCR Success: Name={ocr.Name}, Gender={ocr.Gender}, DOB={ocr.Dob}, Aadhaar={ocr.AadhaarNumber}");
//                 score += 0.15;
//                 reasons.Add($"✓ Aadhaar OCR successful - Name: {ocr.Name}");

//                 // Aadhaar Number Validation – APYHub
//                 Console.WriteLine("Step 2: Validating Aadhaar number with APYHub...");
//                 var isValidFormat = await _verificationService
//                     .ValidateAadhaarNumberAsync(asr.AadhaarNumber);

//                 if (!isValidFormat)
//                     throw new Exception("Invalid Aadhaar number format");

//                 score += 0.10;
//                 reasons.Add("✓ Aadhaar number format validated (APYHub)");

//                 // Match Entered Aadhaar with OCR Aadhaar
//                 Console.WriteLine("Step 3: Comparing entered Aadhaar with extracted Aadhaar...");
//                 var enteredAadhaar = asr.AadhaarNumber.Replace(" ", "").Replace("-", "");
//                 var extractedAadhaar = ocr.AadhaarNumber?.Replace(" ", "").Replace("-", "").Replace("X", "").Replace("x", "") ?? "";

//                 Console.WriteLine($"Entered Aadhaar: {enteredAadhaar}");
//                 Console.WriteLine($"Extracted Aadhaar: {extractedAadhaar}");

//                 if (!string.IsNullOrEmpty(extractedAadhaar) && extractedAadhaar.Length >= 4)
//                 {
//                     // Check if entered number matches extracted number
//                     if (enteredAadhaar == extractedAadhaar)
//                     {
//                         score += 0.15;
//                         reasons.Add("✓ Entered Aadhaar matches card number exactly");
//                     }
//                     else
//                     {
//                         // Check last 4 digits match (common case for masked Aadhaar)
//                         var enteredLast4 = enteredAadhaar.Length >= 4 
//                             ? enteredAadhaar.Substring(enteredAadhaar.Length - 4) 
//                             : "";
//                         var extractedLast4 = extractedAadhaar.Length >= 4 
//                             ? extractedAadhaar.Substring(extractedAadhaar.Length - 4) 
//                             : "";

//                         Console.WriteLine($"Comparing last 4 digits: {enteredLast4} vs {extractedLast4}");

//                         if (enteredLast4 == extractedLast4 && !string.IsNullOrEmpty(enteredLast4))
//                         {
//                             score += 0.10;
//                             reasons.Add($"✓ Aadhaar last 4 digits match: {enteredLast4}");
//                         }
//                         else
//                         {
//                             // Still give partial credit if format is valid
//                             score += 0.05;
//                             reasons.Add("⚠️ Aadhaar number format valid but could not verify exact match (card may be masked)");
//                         }
//                     }
//                 }
//                 else
//                 {
//                     // OCR couldn't extract full number, but format is valid
//                     Console.WriteLine("⚠️ Aadhaar number not extracted by OCR (card may be masked)");
//                     score += 0.10;
//                     reasons.Add("✓ Aadhaar number format validated (OCR extraction not possible - masked card)");
//                 }

//                 // Age Verification
//                 Console.WriteLine("Step 4: Verifying age...");
                
//                 DateTime? parsedDob = null;
//                 if (!string.IsNullOrEmpty(ocr.Dob))
//                 {
//                     // Try multiple date formats
//                     string[] formats = { "dd/MM/yyyy", "dd-MM-yyyy", "dd.MM.yyyy", "yyyy-MM-dd" };
//                     foreach (var format in formats)
//                     {
//                         if (DateTime.TryParseExact(ocr.Dob, format, null, System.Globalization.DateTimeStyles.None, out var date))
//                         {
//                             parsedDob = date;
//                             break;
//                         }
//                     }
//                 }

//                 int age = CalculateAgeFromDob(
//                     parsedDob,
//                     int.TryParse(ocr.YearOfBirth, out var yob) ? yob : null
//                 );

//                 Console.WriteLine($"Calculated age: {age}");

//                 if (age == 0)
//                 {
//                     Console.WriteLine("⚠️ Could not determine age from Aadhaar card");
//                     score += 0.05;
//                     reasons.Add("⚠️ Age could not be verified (DOB not clearly visible)");
//                 }
//                 else if (age < 18)
//                 {
//                     throw new Exception($"Customer is under 18 years old (Age: {age})");
//                 }
//                 else
//                 {
//                     score += 0.10;
//                     reasons.Add($"✓ Age verified: {age} years");
//                 }

//                 //  Face Match – DeepFace via Python
//                 Console.WriteLine("Step 5: Performing face match...");
//                 var faceResult = await _verificationService.FaceMatchAsync(
//                     aadhaarFrontBase64,
//                     asr.CustomerPhotoUrl!
//                 );

//                 if (!faceResult.FaceMatch)
//                     throw new Exception($"Face mismatch: {faceResult.Reason}");

//                 score += 0.30;
//                 reasons.Add($"✓ Face matched: {faceResult.Similarity:F1}% similarity");

//                 // Signature Verification 
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

//                 // Lower threshold to 0.65 to account for OCR challenges
//                 bool verified = score >= 0.65;

//                 Console.WriteLine($"📊 Final Score: {score:F2} (threshold: 0.65)");
//                 Console.WriteLine($"✅ Verification Result: {(verified ? "SUCCESS" : "FAILED")}");

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
//                     verifiedAt = DateTime.UtcNow,
//                     extractedAadhaarNumber = ocr.AadhaarNumber // For debugging
//                 });

//                 if (asr.Order != null)
//                     asr.Order.ASRStatus = verified ? "Success" : "Failed";

//                 await _context.SaveChangesAsync();

//                 Console.WriteLine($"✅ Verification complete: {asr.AIVerifyStatus}, Score: {score:F2}");
//                 Console.WriteLine($"📝 Reasons: {string.Join(", ", reasons)}");
                
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
using System.Text;
using System.Text.Json;

namespace Backend.Services
{
    public class ASRService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly HttpClient _http;

        public ASRService(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
            _http = new HttpClient();
        }

        // =====================================================
        // CREATE ASR REQUEST (UNCHANGED)
        // =====================================================
        public async Task<ASRVerification> CreateASRRequestAsync(int orderId, int driverId)
        {
            var order = await _context.Orders
                .Include(o => o.Customer)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                throw new Exception("Order not found");

            if (!order.IsASR)
                throw new Exception("Order does not require ASR");

            var existing = await _context.ASRVerifications
                .FirstOrDefaultAsync(a => a.OrderId == orderId);

            if (existing != null)
                return existing;

            var asr = new ASRVerification
            {
                OrderId = orderId,
                CustomerId = order.CustomerId ?? 0,
                DriverId = driverId,
                AIVerifyStatus = "Pending",
                RequestedAt = DateTime.UtcNow,
                DocumentUrls = "[]",
                AadhaarNumber = ""
            };

            _context.ASRVerifications.Add(asr);
            await _context.SaveChangesAsync();

            order.ASRVerificationId = asr.Id;
            order.ASRStatus = "Pending";
            await _context.SaveChangesAsync();

            return asr;
        }

        // =====================================================
        // CUSTOMER UPLOADS DOCUMENTS (UNCHANGED)
        // =====================================================
        public async Task<ASRVerification> UploadCustomerDocumentsAsync(
            int asrId,
            List<string> documentUrls,
            string aadhaarNumber)
        {
            var asr = await _context.ASRVerifications.FindAsync(asrId);
            if (asr == null)
                throw new Exception("ASR not found");

            asr.DocumentUrls = JsonSerializer.Serialize(documentUrls);
            asr.AadhaarNumber = aadhaarNumber;
            asr.CustomerUploadedAt = DateTime.UtcNow;
            asr.AIVerifyStatus = "DocumentsReceived";

            await _context.SaveChangesAsync();
            return asr;
        }

        // =====================================================
        // DRIVER UPLOADS PHOTO & SIGNATURE
        // =====================================================
        public async Task<ASRVerification> UploadDriverCapturesAsync(
            int asrId,
            string customerPhotoUrl,
            string signatureUrl)
        {
            var asr = await _context.ASRVerifications.FindAsync(asrId);
            if (asr == null)
                throw new Exception("ASR not found");

            asr.CustomerPhotoUrl = customerPhotoUrl;
            asr.SignatureUrl = signatureUrl;
            asr.AIVerifyStatus = "InProgress";

            await _context.SaveChangesAsync();
            return asr;
        }

        // =====================================================
        // 🔥 MAIN: PERFORM AI VERIFICATION (n8n ONLY)
        // =====================================================
        public async Task<ASRVerification> PerformAIVerificationAsync(int asrId)
        {
            var asr = await _context.ASRVerifications
                .Include(a => a.Order)
                .FirstOrDefaultAsync(a => a.Id == asrId);

            if (asr == null)
                throw new Exception("ASR not found");

            // Validate required data
            var documentUrls = JsonSerializer.Deserialize<List<string>>(asr.DocumentUrls ?? "[]") ?? new();
            var aadhaarFront = documentUrls.FirstOrDefault();

            if (string.IsNullOrEmpty(aadhaarFront) || string.IsNullOrEmpty(asr.AadhaarNumber))
            {
                asr.AIVerifyStatus = "Failed";
                asr.AIVerifyReasons = JsonSerializer.Serialize(
                    new[] { "Missing Aadhaar image or Aadhaar number" }
                );
                await _context.SaveChangesAsync();
                return asr;
            }

            try
            {
                // =============================
                // CALL n8n WEBHOOK
                // =============================
                var payload = new
                {
                    aadhaarNumber = asr.AadhaarNumber,
                    aadhaarFrontImage = aadhaarFront,
                    aadhaarBackImage = documentUrls.Count > 1 ? documentUrls[1] : null,
                    asrId = asr.Id
                };

                var response = await _http.PostAsync(
                    _config["n8n:AadhaarVerifyUrl"],
                    new StringContent(
                        JsonSerializer.Serialize(payload),
                        Encoding.UTF8,
                        "application/json"
                    )
                );

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception("n8n verification service unavailable");
                }

                var result = JsonDocument.Parse(
                    await response.Content.ReadAsStringAsync()
                ).RootElement;

                // =============================
                // MAP n8n RESULT
                // =============================
                var status = result.GetProperty("status").GetString() ?? "Failed";
                var score = result.GetProperty("score").GetDouble();
                var reasons = result.GetProperty("reasons")
                    .EnumerateArray()
                    .Select(r => r.GetString() ?? "")
                    .ToList();

                asr.AIVerifyStatus = status;
                asr.AIVerifyScore = score;
                asr.AIVerifyReasons = JsonSerializer.Serialize(reasons);
                asr.VerifiedAt = DateTime.UtcNow;

                if (status == "Success" && result.TryGetProperty("aadhaarData", out var aadhaarData))
                {
                    asr.VerificationMetadata = aadhaarData.GetRawText();
                }

                if (asr.Order != null)
                {
                    asr.Order.ASRStatus = status;
                }

                await _context.SaveChangesAsync();
                return asr;
            }
            catch (Exception ex)
            {
                asr.AIVerifyStatus = "Failed";
                asr.AIVerifyReasons = JsonSerializer.Serialize(
                    new[] { $"Verification error: {ex.Message}" }
                );
                await _context.SaveChangesAsync();
                return asr;
            }
        }

        // =====================================================
        // GET ASR STATUS (UNCHANGED)
        // =====================================================
        public async Task<ASRVerification?> GetASRVerificationAsync(int orderId)
        {
            return await _context.ASRVerifications
                .Include(a => a.Order)
                .Include(a => a.Customer)
                .Include(a => a.Driver)
                .FirstOrDefaultAsync(a => a.OrderId == orderId);
        }

        // =====================================================
        // ADMIN OVERRIDE (UNCHANGED)
        // =====================================================
        public async Task<ASRVerification> AdminOverrideAsync(
            int asrId,
            int adminId,
            string reason)
        {
            var asr = await _context.ASRVerifications
                .Include(a => a.Order)
                .FirstOrDefaultAsync(a => a.Id == asrId);

            if (asr == null)
                throw new Exception("ASR not found");

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

        // =====================================================
        // RETRY (UNCHANGED)
        // =====================================================
        public async Task<ASRVerification> RetryVerificationAsync(int asrId)
        {
            var asr = await _context.ASRVerifications.FindAsync(asrId);
            if (asr == null)
                throw new Exception("ASR not found");

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