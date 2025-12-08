using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Domain.Entity
{
    public class PricingTier
    {
        public int Id { get; set; }

        [Required]
        public string Region { get; set; } = string.Empty; // "Tamil Nadu", "All India", "International"

        public double DistanceMin { get; set; } // in kilometers
        public double DistanceMax { get; set; } // in kilometers
        
        public double WeightMin { get; set; } // in kg
        public double WeightMax { get; set; } // in kg

        [Column(TypeName = "decimal(10,2)")]
        public decimal BasePrice { get; set; } // Base delivery price

        [Column(TypeName = "decimal(10,2)")]
        public decimal PerKmRate { get; set; } // Additional charge per km

        [Column(TypeName = "decimal(10,2)")]
        public decimal PerKgRate { get; set; } // Additional charge per kg

        public string? SurchargeType { get; set; } // "Express", "ASR", "International", etc.
        
        [Column(TypeName = "decimal(10,2)")]
        public decimal SurchargeAmount { get; set; } // Additional surcharge

        public bool IsActive { get; set; } = true;
    }
}
