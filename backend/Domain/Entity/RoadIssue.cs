using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Domain.Entity
{
    public class RoadIssue
    {
        public int Id { get; set; }

        public int DriverId { get; set; }
        [ForeignKey("DriverId")]
        public User? Driver { get; set; }

        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string IssueType { get; set; } = string.Empty; // Accident, Traffic, Construction
        public string Severity { get; set; } = "Medium"; // Low, Medium, High
        public string Description { get; set; } = string.Empty;
        public DateTime ReportedAt { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Active"; // Active, Resolved
    }
}
