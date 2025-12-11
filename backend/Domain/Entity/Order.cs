// // // // using System.ComponentModel.DataAnnotations;
// // // // using System.ComponentModel.DataAnnotations.Schema;

// // // // namespace Backend.Domain.Entity
// // // // {
// // // //     public class Order
// // // //     {
// // // //         public int Id { get; set; }

// // // //         public int SenderId { get; set; }
// // // //         [ForeignKey("SenderId")]
// // // //         public User? Sender { get; set; }

// // // //         [Required]
// // // //         public string ReceiverName { get; set; } = string.Empty;

// // // //         [Required]
// // // //         public string ReceiverAddress { get; set; } = string.Empty;

// // // //         [Required]
// // // //         public string ReceiverPhone { get; set; } = string.Empty;

// // // //         [Required]
// // // //         public string PickupAddress { get; set; } = string.Empty;

// // // //         public string ParcelSize { get; set; } = string.Empty; // Small, Medium, Large
// // // //         public double Weight { get; set; }
// // // //         public decimal Price { get; set; }

// // // //         public string ReceiverPincode { get; set; } = string.Empty;
// // // //         public string? PickupPincode { get; set; }
// // // //         public string? DeliveryPincode { get; set; }
// // // //         public string DeliveryType { get; set; } = "Normal"; // Normal, ASR
// // // //         public string DeliveryNotes { get; set; } = string.Empty;
        
// // // //         // Sender details snapshot (optional, can rely on SenderId but good for history)
// // // //         public string SenderName { get; set; } = string.Empty;
// // // //         public string SenderPhone { get; set; } = string.Empty;
// // // //         public string SenderEmail { get; set; } = string.Empty;
// // // //         // PickupAddress is already there

// // // //         public string Status { get; set; } = "PendingAssignment"; // PendingAssignment, Assigned, AtOriginWarehouse, InTransitToHub, AtDestinationWarehouse, OutForDelivery, Delivered, Attempted

// // // //         public int? DriverId { get; set; }
// // // //         [ForeignKey("DriverId")]
// // // //         public User? Driver { get; set; }

// // // //         public int? CustomerId { get; set; }
// // // //         [ForeignKey("CustomerId")]
// // // //         public User? Customer { get; set; }

// // // //         // Warehouse Tracking
// // // //         public int? OriginWarehouseId { get; set; }
// // // //         [ForeignKey("OriginWarehouseId")]
// // // //         public Warehouse? OriginWarehouse { get; set; }

// // // //         public int? DestinationWarehouseId { get; set; }
// // // //         [ForeignKey("DestinationWarehouseId")]
// // // //         public Warehouse? DestinationWarehouse { get; set; }

// // // //         public int? CurrentWarehouseId { get; set; }
// // // //         [ForeignKey("CurrentWarehouseId")]
// // // //         public Warehouse? CurrentWarehouse { get; set; }

// // // //         // Priority & Reschedule
// // // //         public int Priority { get; set; } = 2;  // 1=High, 2=Normal, 3=Low/Rescheduled
// // // //         public DateTime? RescheduledDate { get; set; }
// // // //         public DateTime? EstimatedDeliveryDate { get; set; }

// // // //         public string ReceiverEmail { get; set; } = string.Empty;

// // // //         // PHASE 5 International Shipping - TEMPORARILY DISABLED
// // // //         // Uncomment after running phase5_manual_migration.sql
// // // //         /*
// // // //         public bool IsInternational { get; set; } = false;
// // // //         public string? DestinationCountryCode { get; set; }
// // // //         [ForeignKey("DestinationCountryCode")]
// // // //         public Country? DestinationCountry { get; set; }
// // // //         public string? CustomsDeclaration { get; set; }
// // // //         public string? InternationalTrackingNumber { get; set; }

// // // //         public int? TransportId { get; set; }
// // // //         [ForeignKey("TransportId")]
// // // //         public Transport? Transport { get; set; }
// // // //         */

// // // //         public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
// // // //         public DateTime? ScheduledDate { get; set; }
// // // //         public string? ScheduledTimeSlot { get; set; }
        
// // // //         // Coordinates for routing
// // // //         public double PickupLatitude { get; set; }
// // // //         public double PickupLongitude { get; set; }
// // // //         public double DeliveryLatitude { get; set; }
// // // //         public double DeliveryLongitude { get; set; }
// // // //     }
// // // // }


// // // using System.ComponentModel.DataAnnotations;
// // // using System.ComponentModel.DataAnnotations.Schema;
// // // using System.Text.Json.Serialization;

// // // namespace Backend.Domain.Entity
// // // {
// // //     public class Order
// // //     {
// // //         public int Id { get; set; }

// // //         public int SenderId { get; set; }
        
// // //         [ForeignKey("SenderId")]
// // //         [JsonIgnore] // Prevent cycles
// // //         public User? Sender { get; set; }

// // //         [Required]
// // //         public string ReceiverName { get; set; } = string.Empty;

// // //         [Required]
// // //         public string ReceiverAddress { get; set; } = string.Empty;

// // //         [Required]
// // //         public string ReceiverPhone { get; set; } = string.Empty;

// // //         [Required]
// // //         public string PickupAddress { get; set; } = string.Empty;

// // //         public string ParcelSize { get; set; } = string.Empty;
// // //         public double Weight { get; set; }
// // //         public decimal Price { get; set; }

// // //         public string ReceiverPincode { get; set; } = string.Empty;
// // //         public string? PickupPincode { get; set; }
// // //         public string? DeliveryPincode { get; set; }

// // //         public string DeliveryType { get; set; } = "Normal";
// // //         public string DeliveryNotes { get; set; } = string.Empty;

// // //         public string SenderName { get; set; } = string.Empty;
// // //         public string SenderPhone { get; set; } = string.Empty;
// // //         public string SenderEmail { get; set; } = string.Empty;

// // //         public string Status { get; set; } = "PendingAssignment";

// // //         public int? DriverId { get; set; }

// // //         [ForeignKey("DriverId")]
// // //         [JsonIgnore]
// // //         public User? Driver { get; set; }

// // //         public int? CustomerId { get; set; }

// // //         [ForeignKey("CustomerId")]
// // //         [JsonIgnore]
// // //         public User? Customer { get; set; }

// // //         // ------ Warehouse References ------

// // //         public int? OriginWarehouseId { get; set; }

// // //         [ForeignKey("OriginWarehouseId")]
// // //         [JsonIgnore]
// // //         public Warehouse? OriginWarehouse { get; set; }

// // //         public int? DestinationWarehouseId { get; set; }

// // //         [ForeignKey("DestinationWarehouseId")]
// // //         [JsonIgnore]
// // //         public Warehouse? DestinationWarehouse { get; set; }

// // //         public int? CurrentWarehouseId { get; set; }

// // //         [ForeignKey("CurrentWarehouseId")]
// // //         [JsonIgnore]
// // //         public Warehouse? CurrentWarehouse { get; set; }

// // //         // ------ Priority & Scheduling ------
// // //         public int Priority { get; set; } = 2;
// // //         public DateTime? RescheduledDate { get; set; }
// // //         public DateTime? EstimatedDeliveryDate { get; set; }

// // //         public string ReceiverEmail { get; set; } = string.Empty;

// // //         public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

// // //         public DateTime? ScheduledDate { get; set; }
// // //         public string? ScheduledTimeSlot { get; set; }

// // //         // Coordinates
// // //         public double PickupLatitude { get; set; }
// // //         public double PickupLongitude { get; set; }
// // //         public double DeliveryLatitude { get; set; }
// // //         public double DeliveryLongitude { get; set; }

// // //         public string TrackingId { get; set; } = Guid.NewGuid().ToString("N")[..10].ToUpper();

// // //     }
// // // }


// // using System.ComponentModel.DataAnnotations;
// // using System.ComponentModel.DataAnnotations.Schema;
// // using System.Text.Json.Serialization;

// // namespace Backend.Domain.Entity
// // {
// //     public class Order
// //     {
// //         public int Id { get; set; }

// //         public int SenderId { get; set; }
        
// //         [ForeignKey("SenderId")]
// //         [JsonIgnore]
// //         public User? Sender { get; set; }

// //         [Required]
// //         public string ReceiverName { get; set; } = string.Empty;

// //         [Required]
// //         public string ReceiverAddress { get; set; } = string.Empty;

// //         [Required]
// //         public string ReceiverPhone { get; set; } = string.Empty;

// //         [Required]
// //         public string PickupAddress { get; set; } = string.Empty;

// //         public string ParcelSize { get; set; } = string.Empty;
// //         public double Weight { get; set; }
// //         public decimal Price { get; set; }

// //         public string ReceiverPincode { get; set; } = string.Empty;
// //         public string? PickupPincode { get; set; }
// //         public string? DeliveryPincode { get; set; }

// //         public string DeliveryType { get; set; } = "Normal";
// //         public string DeliveryNotes { get; set; } = string.Empty;

// //         public string SenderName { get; set; } = string.Empty;
// //         public string SenderPhone { get; set; } = string.Empty;
// //         public string SenderEmail { get; set; } = string.Empty;

// //         public string Status { get; set; } = "PendingAssignment";

// //         public int? DriverId { get; set; }

// //         [ForeignKey("DriverId")]
// //         [JsonIgnore]
// //         public User? Driver { get; set; }

// //         public int? CustomerId { get; set; }

// //         [ForeignKey("CustomerId")]
// //         [JsonIgnore]
// //         public User? Customer { get; set; }

// //         // ------ Warehouse References ------

// //         public int? OriginWarehouseId { get; set; }

// //         [ForeignKey("OriginWarehouseId")]
// //         [JsonIgnore]
// //         public Warehouse? OriginWarehouse { get; set; }

// //         public int? DestinationWarehouseId { get; set; }

// //         [ForeignKey("DestinationWarehouseId")]
// //         [JsonIgnore]
// //         public Warehouse? DestinationWarehouse { get; set; }

// //         public int? CurrentWarehouseId { get; set; }

// //         [ForeignKey("CurrentWarehouseId")]
// //         [JsonIgnore]
// //         public Warehouse? CurrentWarehouse { get; set; }

// //         // ------ Priority & Scheduling ------
// //         public int Priority { get; set; } = 2;
// //         public DateTime? RescheduledDate { get; set; }
// //         public DateTime? EstimatedDeliveryDate { get; set; }

// //         // 🆕 NEW FIELDS FOR RESCHEDULING
// //         public DateTime? RescheduledAt { get; set; }
// //         public string? RescheduleReason { get; set; }
        

// //         public string ReceiverEmail { get; set; } = string.Empty;

// //         public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

// //         public DateTime? ScheduledDate { get; set; }
// //         public string? ScheduledTimeSlot { get; set; }

// //         public DateTime? DeliveredAt { get; set; }


// //         // Coordinates
// //         public double PickupLatitude { get; set; }
// //         public double PickupLongitude { get; set; }
// //         public double DeliveryLatitude { get; set; }
// //         public double DeliveryLongitude { get; set; }

// //         public string TrackingId { get; set; } = Guid.NewGuid().ToString("N")[..10].ToUpper();
// //     }
// // }

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
//         [JsonIgnore]
//         public Warehouse? OriginWarehouse { get; set; }

//         public int? DestinationWarehouseId { get; set; }

//         [ForeignKey("DestinationWarehouseId")]
//         [JsonIgnore]
//         public Warehouse? DestinationWarehouse { get; set; }

//         public int? CurrentWarehouseId { get; set; }

//         [ForeignKey("CurrentWarehouseId")]
//         [JsonIgnore]
//         public Warehouse? CurrentWarehouse { get; set; }

//         // ------ Priority & Scheduling ------
//         public int Priority { get; set; } = 2;
        
//         // 🆕 FEATURE 1: AI PRIORITY FIELDS
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

        // Use more explicit statuses: PendingAssignment, AtOriginWarehouse, InTransit, OutForDelivery, Assigned, Delivered, Cancelled
        public string Status { get; set; } = "PendingAssignment";

        public int? DriverId { get; set; }

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
        [JsonIgnore]
        public Warehouse? OriginWarehouse { get; set; }

        public int? DestinationWarehouseId { get; set; }

        [ForeignKey("DestinationWarehouseId")]
        [JsonIgnore]
        public Warehouse? DestinationWarehouse { get; set; }

        // Current warehouse where parcel physically is (initially origin)
        public int? CurrentWarehouseId { get; set; }

        [ForeignKey("CurrentWarehouseId")]
        [JsonIgnore]
        public Warehouse? CurrentWarehouse { get; set; }

        // ------ Priority & Scheduling ------
        public int Priority { get; set; } = 2;
        
        // 🆕 FEATURE 1: AI PRIORITY FIELDS
        public int? AiPriority { get; set; }
        public string? AiPriorityJustification { get; set; }
        
        public DateTime? RescheduledDate { get; set; }
        public DateTime? EstimatedDeliveryDate { get; set; }

        // Rescheduling fields
        public DateTime? RescheduledAt { get; set; }
        public string? RescheduleReason { get; set; }
        
        public string ReceiverEmail { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ScheduledDate { get; set; }
        public string? ScheduledTimeSlot { get; set; }

        public DateTime? DeliveredAt { get; set; }

        // Coordinates
        public double PickupLatitude { get; set; }
        public double PickupLongitude { get; set; }
        public double DeliveryLatitude { get; set; }
        public double DeliveryLongitude { get; set; }

        public string TrackingId { get; set; } = Guid.NewGuid().ToString("N")[..10].ToUpper();
    }
}
