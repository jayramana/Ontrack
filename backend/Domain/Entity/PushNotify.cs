namespace Backend.Domain.Entity;

public class PushSubscriptionEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }           // owner user id (customer/driver)
    public string Endpoint { get; set; } = string.Empty;
    public string P256DH { get; set; } = string.Empty;
    public string Auth { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

