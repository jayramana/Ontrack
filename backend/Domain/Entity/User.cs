<<<<<<< HEAD
namespace Backend.Domain.Entity;
    public class User
    {
        public int UserId { get; set; }
        public string UserFName { get; set; } = null!;
        public string UserLName { get; set; } = null!;
        public string UserPhonePrimary { get; set; } = null!;
        public string? UserPhoneSecondary { get; set; }
        public string UserEmail { get; set; } = null!;
        public string UserPass { get; set; } = null!;
        public string UserRole { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }

        public ICollection<Address> Addresses { get; set; } = null!;
        public Seller? Seller { get; set; }
        public Driver? Driver { get; set; }

    }

=======
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
>>>>>>> origin/route
