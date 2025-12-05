namespace Backend.DTO
{
    public class LoginResponseDto
    {
        public int UserId { get; set; }
        public required string Name { get; set; }
        public required string Role { get; set; }
        public required string Token { get; set; }
        public required string Message { get; set; }
    }
}
