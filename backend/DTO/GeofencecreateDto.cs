namespace Backend.DTO;

public class GeofenceCreateDto
{
    public string? Name { get; set; }
    public double CenterLat { get; set; }
    public double CenterLon { get; set; }
    public double RadiusMeters { get; set; }
    public int? OrderId { get; set; }
    public int? OwnerUserId { get; set; }
}