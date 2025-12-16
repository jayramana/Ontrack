using System.ComponentModel.DataAnnotations;

namespace Backend.DTO
{
    public class ReportIssueDto
    {
        [Required]
        [MaxLength(100)]
        public string IssueType { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public double Latitude { get; set; }

        [Required]
        public double Longitude { get; set; }

        public string Severity { get; set; } = "Medium";
    }
}