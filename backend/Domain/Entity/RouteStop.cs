using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Backend.Domain.Entity
{
    public class RouteStop
    {
        [Key]
        public int Id { get; set; }

        // Foreign Keys
        public int DriverId { get; set; }
        
        [ForeignKey("DriverId")]
        [JsonIgnore]
        public User? Driver { get; set; }

        public int OrderId { get; set; }
        
        [ForeignKey("OrderId")]
        [JsonIgnore]
        public Order? Order { get; set; }

        // Location
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        // Sequence and Status
        public int SequenceNumber { get; set; }
        
        public string Status { get; set; } = "Pending"; // Pending, Completed, Skipped

        // Timing
        public DateTime? EstimatedArrival { get; set; }
        
        public DateTime? ActualArrival { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ============================================
        // 🆕 ASR (ADULT SIGNATURE REQUIRED) FIELDS
        // ============================================
        
        /// <summary>
        /// Indicates if this stop requires ASR verification
        /// </summary>
        public bool IsASR { get; set; } = false;

        /// <summary>
        /// Priority override for ASR stops (1 = highest)
        /// </summary>
        public int ASRPriority { get; set; } = 2;
    }
}