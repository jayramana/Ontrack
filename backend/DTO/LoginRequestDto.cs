namespace Backend.DTO
{
    public class LoginRequestDto
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string Role { get; set; }
    }
}
