namespace Backend.Domain.Entity;

public class Geofence
{
    public int GeofenceId { get; set; }
    public string Name { get; set; } = string.Empty;
    public double CenterLat { get; set; }
    public double CenterLon { get; set; }
    public double RadiusMeters { get; set; }
    public int? OrderId { get; set; }
    public int? OwnerUserId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [System.ComponentModel.DataAnnotations.Schema.ForeignKey("OrderId")]
    public Order? Order { get; set; }
}
