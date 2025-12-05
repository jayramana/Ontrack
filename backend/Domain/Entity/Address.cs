namespace Backend.Domain.Entity;

public class Address
{
        public int AddrId { get; set; }
        public int UserId { get; set; }
        public string AddressLine { get; set; } = null!;
        public string AddrCity { get; set; } = null!;
        public string AddrState { get; set; } = null!;
        public string AddrPostalCode { get; set; } = null!;
        public string AddrCountry { get; set; } = null!;

        public User User { get; set; } = null!;
}