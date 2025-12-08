using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Domain.Entity
{
    public class Notification
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User? User { get; set; }

        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = "Info"; // Info, Alert, Success
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
