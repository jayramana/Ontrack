namespace Ontrack.Backend.Models
{
    public class LoginRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string Role { get; set; }
    }
}
