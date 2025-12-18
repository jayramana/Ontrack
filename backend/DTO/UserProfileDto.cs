using System.ComponentModel.DataAnnotations;

namespace Backend.DTO;

public class UserProfileDto
{
    public int UserId { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Role { get; set; } = null!;
    
    // Address Details
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    
    // Seller Specific
    public bool IsSeller { get; set; }
    public string? SellerType { get; set; }
    public bool IsSharingLocation { get; set; }
}
