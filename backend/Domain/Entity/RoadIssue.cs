
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Domain.Entity
{
    public class RoadIssue
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int DriverId { get; set; }

        [ForeignKey("DriverId")]
        public User Driver { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string IssueType { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public double Latitude { get; set; }

        [Required]
        public double Longitude { get; set; }

        [Required]
        public DateTime ReportedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Active"; // Active, Resolved

        [MaxLength(20)]
        public string Severity { get; set; } = "Medium";

        // ✅ REAL COLUMN (EF will create DB field)
        public bool IsResolved { get; set; } = false;

        public DateTime? ResolvedAt { get; set; }
    }
}
