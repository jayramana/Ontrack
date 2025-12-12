using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Backend.Domain.Entity
{
    public class Warehouse
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Region { get; set; } = string.Empty;

        [Required]
        public string City { get; set; } = string.Empty;

        [Required]
        public string Pincode { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty;

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        public string? ManagerName { get; set; }
        public string? ContactPhone { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Parcel counters (keeps basic stats)
        public int ReceivedParcels { get; set; } = 0;      // Parcels received into this warehouse (incoming)
        public int OutgoingParcels { get; set; } = 0;      // Parcels assigned to be sent out (collected)
        public int CurrentParcels { get; set; } = 0;       // Parcels physically present

        // Prevent JSON infinite loops
        [JsonIgnore]
        public ICollection<Order>? OriginOrders { get; set; }

        [JsonIgnore]
        public ICollection<Order>? DestinationOrders { get; set; }

        [JsonIgnore]
        public ICollection<Order>? CurrentOrders { get; set; }

        [JsonIgnore]
        public ICollection<User>? AssignedUsers { get; set; }
    }
}