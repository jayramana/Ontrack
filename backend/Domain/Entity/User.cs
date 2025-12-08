using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Domain.Entity
{
    public class User
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public required string Role { get; set; }

        // Driver specific properties
        public double? CurrentLatitude { get; set; }
        public double? CurrentLongitude { get; set; }
        public bool IsAvailable { get; set; } = true;

        // Warehouse assignment for drivers and warehouse admins
        public int? AssignedWarehouseId { get; set; }
        [ForeignKey("AssignedWarehouseId")]
        public Warehouse? AssignedWarehouse { get; set; }
    }

    public static class UserRoles
    {
        public const string Customer = "Customer";
        public const string Driver = "Driver";
        public const string Admin = "Admin";
        public const string Sender = "Sender";

        public static bool IsValidRole(string role)
        {
            return role == Customer || role == Driver || role == Admin || role == Sender;
        }
    }
}
