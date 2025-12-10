namespace Backend.DTO;

public class DriverLocationDto
{
    public int DriverId { get; set; }
    public double Lat { get; set; }
    public double Lon { get; set; }
    public double? SpeedKmph { get; set; }
    public int? OrderId { get; set; }           // optional: attach to order to notify order group
}