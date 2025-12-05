namespace Backend.Domain.Entity;
public class Seller
{
        public int SellerId { get; set; }
        public int UserId { get; set; }
        public string CompanyName { get; set; } = null!;
        public string CompanyEmail { get; set; } = null!;
        public string CompanyPhone1 { get; set; } = null!;
        public string? CompanyPhone2 { get; set; }

        public User User { get; set; } = null!;

}