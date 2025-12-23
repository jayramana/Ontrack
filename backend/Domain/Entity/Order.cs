// using System.ComponentModel.DataAnnotations;
// using System.ComponentModel.DataAnnotations.Schema;
// using System.Text.Json.Serialization;

// namespace Backend.Domain.Entity
// {
//     public class Order
//     {
//         public int Id { get; set; }

//         public int SenderId { get; set; }
        
//         [ForeignKey("SenderId")]
//         [JsonIgnore]
//         public User? Sender { get; set; }

//         [Required]
//         public string ReceiverName { get; set; } = string.Empty;

//         [Required]
//         public string ReceiverAddress { get; set; } = string.Empty;

//         [Required]
//         public string ReceiverPhone { get; set; } = string.Empty;

//         [Required]
//         public string PickupAddress { get; set; } = string.Empty;

//         public string ParcelSize { get; set; } = string.Empty;
//         public double Weight { get; set; }
//         public decimal Price { get; set; }

//         public string ReceiverPincode { get; set; } = string.Empty;
//         public string? PickupPincode { get; set; }
//         public string? DeliveryPincode { get; set; }

//         public string DeliveryType { get; set; } = "Normal";
//         public string DeliveryNotes { get; set; } = string.Empty;

//         public string SenderName { get; set; } = string.Empty;
//         public string SenderPhone { get; set; } = string.Empty;
//         public string SenderEmail { get; set; } = string.Empty;

//         public string Status { get; set; } = "PendingAssignment";

//         public int? DriverId { get; set; }

//         [ForeignKey("DriverId")]
//         [JsonIgnore]
//         public User? Driver { get; set; }

//         public int? CustomerId { get; set; }

//         [ForeignKey("CustomerId")]
//         [JsonIgnore]
//         public User? Customer { get; set; }

//         // ------ Warehouse References ------
//         public int? OriginWarehouseId { get; set; }

//         [ForeignKey("OriginWarehouseId")]
//         public Warehouse? OriginWarehouse { get; set; }

//         public int? DestinationWarehouseId { get; set; }

//         [ForeignKey("DestinationWarehouseId")]
//         public Warehouse? DestinationWarehouse { get; set; }

//         public int? CurrentWarehouseId { get; set; }

//         [ForeignKey("CurrentWarehouseId")]
//         public Warehouse? CurrentWarehouse { get; set; }

//         // ------ Priority & Scheduling ------
//         public int Priority { get; set; } = 2;
        
//         // AI PRIORITY FIELDS
//         public int? AiPriority { get; set; }
//         public string? AiPriorityJustification { get; set; }
        
//         public DateTime? RescheduledDate { get; set; }
//         public DateTime? EstimatedDeliveryDate { get; set; }

//         // Rescheduling fields
//         public DateTime? RescheduledAt { get; set; }
//         public string? RescheduleReason { get; set; }
        
//         public string ReceiverEmail { get; set; } = string.Empty;

//         public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

//         public DateTime? ScheduledDate { get; set; }
//         public string? ScheduledTimeSlot { get; set; }

//         public DateTime? DeliveredAt { get; set; }

//         // Coordinates
//         public double PickupLatitude { get; set; }
//         public double PickupLongitude { get; set; }
//         public double DeliveryLatitude { get; set; }
//         public double DeliveryLongitude { get; set; }

//         public string TrackingId { get; set; } = Guid.NewGuid().ToString("N")[..10].ToUpper();

//         // ==============================
//         // 🆕 ASR (ADULT SIGNATURE REQUIRED) FIELDS
//         // ==============================
        
//         /// <summary>
//         /// Indicates if this order requires Adult Signature verification
//         /// </summary>
//         public bool IsASR { get; set; } = false;

//         /// <summary>
//         /// ASR verification status: NotStarted, Pending, InProgress, Success, Failed, AdminOverride
//         /// </summary>
//         public string ASRStatus { get; set; } = "NotStarted";

//         /// <summary>
//         /// Foreign key to ASRVerification table
//         /// </summary>
//         public int? ASRVerificationId { get; set; }

//         [ForeignKey("ASRVerificationId")]
//         [JsonIgnore]
//         public ASRVerification? ASRVerification { get; set; }
//     }
// }

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Backend.Domain.Entity
{
    public class Order
    {
        public int Id { get; set; }

        public int SenderId { get; set; }
        
        [ForeignKey("SenderId")]
        [JsonIgnore]
        public User? Sender { get; set; }

        [Required]
        public string ReceiverName { get; set; } = string.Empty;

        [Required]
        public string ReceiverAddress { get; set; } = string.Empty;

        [Required]
        public string ReceiverPhone { get; set; } = string.Empty;

        [Required]
        public string PickupAddress { get; set; } = string.Empty;

        public string ParcelSize { get; set; } = string.Empty;
        public double Weight { get; set; }
        public decimal Price { get; set; }

        public string ReceiverPincode { get; set; } = string.Empty;
        public string? PickupPincode { get; set; }
        public string? DeliveryPincode { get; set; }

        public string DeliveryType { get; set; } = "Normal";
        public string DeliveryNotes { get; set; } = string.Empty;

        public string SenderName { get; set; } = string.Empty;
        public string SenderPhone { get; set; } = string.Empty;
        public string SenderEmail { get; set; } = string.Empty;

        public string Status { get; set; } = "PendingAssignment";

        public int? DriverId { get; set; }

        public int? PreviousDriverId { get; set; }

        [ForeignKey("DriverId")]
        [JsonIgnore]
        public User? Driver { get; set; }

        public int? CustomerId { get; set; }

        [ForeignKey("CustomerId")]
        [JsonIgnore]
        public User? Customer { get; set; }

        // ------ Warehouse References ------
        public int? OriginWarehouseId { get; set; }

        [ForeignKey("OriginWarehouseId")]
        public Warehouse? OriginWarehouse { get; set; }

        public int? DestinationWarehouseId { get; set; }

        [ForeignKey("DestinationWarehouseId")]
        public Warehouse? DestinationWarehouse { get; set; }

        public int? CurrentWarehouseId { get; set; }

        [ForeignKey("CurrentWarehouseId")]
        public Warehouse? CurrentWarehouse { get; set; }

        // ------ Priority & Scheduling ------
        public int Priority { get; set; } = 2;
        
        // AI PRIORITY FIELDS
        public int? AiPriority { get; set; }
        public string? AiPriorityJustification { get; set; }
        
        public DateTime? RescheduledDate { get; set; }
        public DateTime? EstimatedDeliveryDate { get; set; }

        // Rescheduling fields
        public DateTime? RescheduledAt { get; set; }
        public string? RescheduleReason { get; set; }
        
        public string ReceiverEmail { get; set; } = string.Empty;

        // ✅ ADD THESE
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public DateTime? ScheduledDate { get; set; }
        public string? ScheduledTimeSlot { get; set; }

        public DateTime? DeliveredAt { get; set; }

        // Coordinates
        public double PickupLatitude { get; set; }
        public double PickupLongitude { get; set; }
        public double DeliveryLatitude { get; set; }
        public double DeliveryLongitude { get; set; }

        public string TrackingId { get; set; } = Guid.NewGuid().ToString("N")[..10].ToUpper();

        // ==============================
        // 🆕 ASR (ADULT SIGNATURE REQUIRED) FIELDS
        // ==============================
        
        /// <summary>
        /// Indicates if this order requires Adult Signature verification
        /// </summary>
        public bool IsASR { get; set; } = false;

        /// <summary>
        /// ASR verification status: NotStarted, Pending, InProgress, Success, Failed, AdminOverride
        /// </summary>
        public string ASRStatus { get; set; } = "NotStarted";

        /// <summary>
        /// Foreign key to ASRVerification table
        /// </summary>
        public int? ASRVerificationId { get; set; }

        [ForeignKey("ASRVerificationId")]
        [JsonIgnore]
        public ASRVerification? ASRVerification { get; set; }
    }
}