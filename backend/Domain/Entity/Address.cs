using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Backend.Domain.Entity;

public class Address
{
    [Key]
    [Column("address_id")]
    public int AddressId { get; set; }

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    // role flags
    [Required]
    [Column("is_seller")]
    public bool IsSeller { get; set; } = false;

    // only applicable if IsSeller = true
    [Column("seller_type")]
    public string? SellerType { get; set; } 

    // address details
    [Required]
    [MaxLength(255)]
    [Column("address_line_1")]
    public string AddressLine1 { get; set; } = null!;

    [MaxLength(255)]
    [Column("address_line_2")]
    public string? AddressLine2 { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("city")]
    public string City { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    [Column("state")]
    public string State { get; set; } = null!;

    [Required]
    [MaxLength(20)]
    [Column("postal_code")]
    public string PostalCode { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    [Column("country")]
    public string Country { get; set; } = null!;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    // navigation
    public User User { get; set; } = null!;
}
