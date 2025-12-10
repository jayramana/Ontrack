using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class RescheduleDto
    {
        [Required]
        public DateTime NewDate { get; set; }

        public string? Reason { get; set; }
    }

    
}