using System.ComponentModel.DataAnnotations;

namespace Backend.Domain.Entity
{
    public class Country
    {
        [Key]
        public string Code { get; set; } = string.Empty; // ISO 3166 code (e.g., "IN", "US", "GB")

        [Required]
        public string Name { get; set; } = string.Empty;

        public bool CustomsRequired { get; set; } = false;
        public double MaxWeightLimit { get; set; } = 50.0; // Default 50kg limit

        public decimal InternationalRateMultiplier { get; set; } = 2.0m; // 2x for international

        public bool IsActive { get; set; } = true;
    }
}
