namespace Backend.DTO;

public class RescheduleRequestDto
{
    public DateTime NewDate { get; set; }
    public string Reason { get; set; } = string.Empty;
}
