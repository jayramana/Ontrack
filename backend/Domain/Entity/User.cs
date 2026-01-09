using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Domain.Entity;

[Table("users")] // MUST match DB exactly
public class User
{
    [Key]
    [Column("UserId")]
    public int UserId { get; set; }

    [Column("user_f_name")]
    public string UserFName { get; set; } = null!;

    [Column("user_l_name")]
    public string UserLName { get; set; } = null!;

    [Column("user_phone_primary")]
    public string UserPhonePrimary { get; set; } = null!;

    [Column("user_phone_secondary")]
    public string? UserPhoneSecondary { get; set; }

    [Column("user_email")]
    public string UserEmail { get; set; } = null!;

    [Column("user_pass")]
    public string UserPass { get; set; } = null!;

    [Column("user_role")]
    public string UserRole { get; set; } = null!;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [Column("CurrentLatitude")]
    public double? CurrentLatitude { get; set; }

    [Column("CurrentLongitude")]
    public double? CurrentLongitude { get; set; }

    [Column("is_active")]
    public bool IsAvailable { get; set; } = true;

    [Column("is_sharing_location")]
    public bool IsSharingLocation { get; set; } = true;

    [Column("is_simulating")]
    public bool IsSimulating { get; set; } = false;

    [Column("simulation_lat")]
    public double? SimulationLat { get; set; }

    [Column("simulation_lon")]
    public double? SimulationLon { get; set; }

    // Warehouse
    [Column("AssignedWarehouseId")]
    public int? AssignedWarehouseId { get; set; }

    [ForeignKey(nameof(AssignedWarehouseId))]
    public Warehouse? AssignedWarehouse { get; set; }
}
