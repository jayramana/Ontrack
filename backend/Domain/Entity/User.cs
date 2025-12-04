namespace Backend.Domain.Entity
{
    public class User
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public required string Role { get; set; }
    }

    public static class UserRoles
    {
        public const string Customer = "Customer";
        public const string Driver = "Driver";
        public const string Admin = "Admin";

        public static bool IsValidRole(string role)
        {
            return role == Customer || role == Driver || role == Admin;
        }
    }
}
