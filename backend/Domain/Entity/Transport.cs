using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Domain.Entity
{
    public class Transport
    {
        public int Id { get; set; }

        public int OriginWarehouseId { get; set; }
        [ForeignKey("OriginWarehouseId")]
        public Warehouse? OriginWarehouse { get; set; }

        public int DestinationWarehouseId { get; set; }
        [ForeignKey("DestinationWarehouseId")]
        public Warehouse? DestinationWarehouse { get; set; }

        public DateTime ScheduledDepartureTime { get; set; }
        public DateTime? ActualDepartureTime { get; set; }
        public DateTime EstimatedArrivalTime { get; set; }
        public DateTime? ActualArrivalTime { get; set; }

        [Required]
        public string Status { get; set; } = "Scheduled"; // Scheduled, InTransit, Arrived, Cancelled

        public string? VehicleNumber { get; set; }
        public string? DriverName { get; set; }
        public string? DriverPhone { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? TransportCost { get; set; }

        // Navigation property for orders in this transport
        public List<Order> Orders { get; set; } = new();
    }
}
