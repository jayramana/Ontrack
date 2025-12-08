using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Domain.Entity
{
    public class RouteStop
    {
        public int Id { get; set; }

        public int DriverId { get; set; }
        [ForeignKey("DriverId")]
        public User? Driver { get; set; }

        public int OrderId { get; set; }
        [ForeignKey("OrderId")]
        public Order? Order { get; set; }

        public int SequenceNumber { get; set; }
        public DateTime? EstimatedArrival { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Completed, Skipped

        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
