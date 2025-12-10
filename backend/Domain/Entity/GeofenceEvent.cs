namespace Backend.Domain.Entity;

public class GeofenceEvent
{
    public int GeofenceEventId { get; set; }
    public int GeofenceId { get; set; }
    public int DriverId { get; set; }
    public DateTime EventAt { get; set; } = DateTime.UtcNow;
    public string EventType { get; set; } = "ENTER";
    public double DistanceMeters { get; set; }
}
