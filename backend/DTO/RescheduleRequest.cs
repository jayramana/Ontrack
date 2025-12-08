namespace Backend.DTO;

public class RescheduleRequest
{
    public DateTime NewDate { get; set; }
    public string Reason { get; set; } = string.Empty;
}
