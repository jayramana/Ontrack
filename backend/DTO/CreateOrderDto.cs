// using System.ComponentModel.DataAnnotations;

// namespace Backend.DTOs
// {
//     public class CreateOrderDto
//     {
//         [Required]
//         public string ReceiverName { get; set; } = string.Empty;

//         [Required]
//         public string ReceiverAddress { get; set; } = string.Empty;

//         [Required]
//         public string ReceiverPhone { get; set; } = string.Empty;

//         public string ReceiverEmail { get; set; } = string.Empty;
//         public string ReceiverPincode { get; set; } = string.Empty;

//         [Required]
//         public string PickupAddress { get; set; } = string.Empty;
//         public string? PickupPincode { get; set; }

//         public string ParcelSize { get; set; } = string.Empty;
//         public double Weight { get; set; }
//         public decimal Price { get; set; }

//         public string? DeliveryPincode { get; set; }

//         public string DeliveryType { get; set; } = "Normal";
//         public string DeliveryNotes { get; set; } = string.Empty;

//         // Sender details typically passed from frontend form even if logged in
//         public string SenderName { get; set; } = string.Empty;
//         public string SenderPhone { get; set; } = string.Empty;
//         public string SenderEmail { get; set; } = string.Empty;

//         public DateTime? ScheduledDate { get; set; }
//         public string? ScheduledTimeSlot { get; set; }

//         // Coordinates
//         public double PickupLatitude { get; set; }
//         public double PickupLongitude { get; set; }
//         public double DeliveryLatitude { get; set; }
//         public double DeliveryLongitude { get; set; }
//     }
// }

namespace Backend.DTOs
{
    public class CreateOrderDto
    {
        // Sender details
        public string SenderName { get; set; } = string.Empty;
        public string SenderPhone { get; set; } = string.Empty;
        public string SenderEmail { get; set; } = string.Empty;

        // Pickup details
        public string PickupAddress { get; set; } = string.Empty;
        public string? PickupPincode { get; set; }
        public double PickupLatitude { get; set; }
        public double PickupLongitude { get; set; }

        // Receiver details
        public string ReceiverName { get; set; } = string.Empty;
        public string ReceiverPhone { get; set; } = string.Empty;
        public string? ReceiverEmail { get; set; }
        public string ReceiverAddress { get; set; } = string.Empty;
        public string ReceiverPincode { get; set; } = string.Empty;
        public double DeliveryLatitude { get; set; }
        public double DeliveryLongitude { get; set; }
        public string? DeliveryPincode { get; set; }

        // Package details
        public string ParcelSize { get; set; } = "Medium";
        public double Weight { get; set; }
        public decimal Price { get; set; }

        // Delivery details
        public string DeliveryType { get; set; } = "Normal";
        public string? DeliveryNotes { get; set; }

        // Scheduling
        public DateTime? ScheduledDate { get; set; }
        public string? ScheduledTimeSlot { get; set; }

        // 🆕 ASR (Adult Signature Required)
        /// <summary>
        /// Indicates if this order requires ASR verification
        /// </summary>
        public bool? IsASR { get; set; } = false;
    }
}