// // using System.ComponentModel.DataAnnotations;
// // using System.ComponentModel.DataAnnotations.Schema;

// // namespace Backend.Domain.Entity
// // {
// //     public class ASRVerification
// //     {
// //         [Key]
// //         public int Id { get; set; }

// //         // Foreign Keys
// //         public int OrderId { get; set; }
        
// //         [ForeignKey("OrderId")]
// //         public Order? Order { get; set; }

// //         public int CustomerId { get; set; }
        
// //         [ForeignKey("CustomerId")]
// //         public User? Customer { get; set; }

// //         public int? DriverId { get; set; }
        
// //         [ForeignKey("DriverId")]
// //         public User? Driver { get; set; }

// //         // Document URLs (JSON array stored as string)
// //         public string DocumentUrls { get; set; } = "[]"; // Aadhaar front, back, PAN, etc.

// //         // Customer Photo taken by driver
// //         public string? CustomerPhotoUrl { get; set; }

// //         // Digital Signature captured on driver device
// //         public string? SignatureUrl { get; set; }

// //         // AI Verification Results
// //         public string AIVerifyStatus { get; set; } = "Pending"; // Pending, Success, Failed, AdminOverride

// //         public double? AIVerifyScore { get; set; } // 0.0 to 1.0

// //         public string? AIVerifyReasons { get; set; } // JSON string with detailed reasons

// //         // Timestamps
// //         public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        
// //         public DateTime? VerifiedAt { get; set; }

// //         public DateTime? CustomerUploadedAt { get; set; }

// //         // Admin Override
// //         public bool IsAdminOverride { get; set; } = false;
        
// //         public int? OverriddenByAdminId { get; set; }
        
// //         public string? OverrideReason { get; set; }

// //         // Retry tracking
// //         public int RetryCount { get; set; } = 0;
// //     }
// // }

// namespace Backend.Domain.Entity
// {
//     public class ASRVerification
//     {
//         public int Id { get; set; }
//         public int OrderId { get; set; }
//         public int CustomerId { get; set; }
//         public int? DriverId { get; set; }
        
//         // Document URLs (JSON array)
//         public string? DocumentUrls { get; set; }
        
//         // Driver captured data
//         public string? CustomerPhotoUrl { get; set; }
//         public string? SignatureUrl { get; set; }
        
//         // AI Verification
//         public string AIVerifyStatus { get; set; } = "Pending"; // Pending, DocumentsReceived, InProgress, Success, Failed, AdminOverride
//         public double? AIVerifyScore { get; set; }
//         public string? AIVerifyReasons { get; set; } // JSON array
        
//         // 🆕 Verification Metadata (stores Aadhaar data, verification type, etc.)
//         public string? VerificationMetadata { get; set; } // JSON object
        
//         // Timestamps
//         public DateTime RequestedAt { get; set; }
//         public DateTime? CustomerUploadedAt { get; set; }
//         public DateTime? VerifiedAt { get; set; }
        
//         // Admin Override
//         public bool IsAdminOverride { get; set; }
//         public int? OverriddenByAdminId { get; set; }
//         public string? OverrideReason { get; set; }
        
//         // Retry tracking
//         public int RetryCount { get; set; }
        
//         // Navigation properties
//         public Order? Order { get; set; }
//         public User? Customer { get; set; }
//         public User? Driver { get; set; }
//     }
// }

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Domain.Entity
{
    public class ASRVerification
    {
        [Key]
        public int Id { get; set; }

        // Order reference
        public int OrderId { get; set; }
        [ForeignKey("OrderId")]
        public Order? Order { get; set; }

        // Customer who owns the documents
        public int CustomerId { get; set; }
        [ForeignKey("CustomerId")]
        public User? Customer { get; set; }

        // Driver performing verification
        public int? DriverId { get; set; }
        [ForeignKey("DriverId")]
        public User? Driver { get; set; }

        // Customer-uploaded documents (JSON array of base64 strings)
        // [0] = Aadhaar Front (mandatory)
        // [1] = Aadhaar Back (optional)
        // [2] = PAN Card (optional)
        public string DocumentUrls { get; set; } = "[]";

        // Customer-entered Aadhaar number (12 digits)
        [StringLength(12)]
        public string AadhaarNumber { get; set; } = "";

        // Driver-captured customer photo (base64)
        public string? CustomerPhotoUrl { get; set; }

        // Driver-captured signature (base64)
        public string? SignatureUrl { get; set; }

        // AI Verification Status
        // Values: Pending, DocumentsReceived, InProgress, Success, Failed, AdminOverride
        [Required]
        [StringLength(50)]
        public string AIVerifyStatus { get; set; } = "Pending";

        // AI confidence score (0.0 to 1.0)
        public double? AIVerifyScore { get; set; }

        // Verification reasons (JSON array of strings)
        public string? AIVerifyReasons { get; set; }

        // Extracted and verified Aadhaar data (JSON object)
        // Contains: name, maskedAadhaar, gender, age, verificationType, etc.
        public string? VerificationMetadata { get; set; }

        // Timestamps
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CustomerUploadedAt { get; set; }
        public DateTime? VerifiedAt { get; set; }

        // Admin override
        public bool IsAdminOverride { get; set; } = false;
        public int? OverriddenByAdminId { get; set; }
        [ForeignKey("OverriddenByAdminId")]
        public User? OverriddenByAdmin { get; set; }
        public string? OverrideReason { get; set; }

        // Retry tracking
        public int RetryCount { get; set; } = 0;
    }
}