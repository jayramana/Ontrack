using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Domain.Entity
{
    public class DriverLocation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int DriverId { get; set; }

        [Required]
        public double Latitude { get; set; }

        [Required]
        public double Longitude { get; set; }

        public double Speed { get; set; } = 0;  // km/h
        public double Heading { get; set; } = 0;  // degrees

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        [ForeignKey("DriverId")]
        public User? Driver { get; set; }
    }
}
