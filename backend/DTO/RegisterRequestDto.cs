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

    // Address Fields
    public string AddressLine1 { get; set; } = null!;
    public string? AddressLine2 { get; set; }
    public string City { get; set; } = null!;
    public string State { get; set; } = null!;
    public string PostalCode { get; set; } = null!;
    public string Country { get; set; } = null!;
    public string? SellerType { get; set; }
}
