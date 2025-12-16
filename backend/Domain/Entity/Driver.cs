namespace Backend.Domain.Entity;

public class Driver
{
        public int DriverId { get; set; }
        public int UserId { get; set; }
        public string DriverLicenseNumber { get; set; } = null!;
        public DateTime DriverLicenseExpiry { get; set; }

        public User User { get; set; } = null!;
}