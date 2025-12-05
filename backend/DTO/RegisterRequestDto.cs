namespace Backend.DTO;

public class RegisterRequestDto
{
    public string UserFName { get; set; } = null!;
    public string UserLName { get; set; } = null!;
    public string PhonePrimary { get; set; } = null!;
    public string? PhoneSecondary { get; set; }
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string Role { get; set; } = null!;
}
