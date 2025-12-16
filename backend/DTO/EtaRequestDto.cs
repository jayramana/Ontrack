namespace Backend.DTO;

public class EtaRequestDto
{
    public double DriverLat { get; set; }
    public double DriverLon { get; set; }
    public double CustomerLat { get; set; }
    public double CustomerLon { get; set; }
    public double SpeedKmph { get; set; } = 40;
}

