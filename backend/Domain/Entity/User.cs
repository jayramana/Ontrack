namespace Backend.Domain.Entity;
    public class User
    {
        public int UserId { get; set; }
        public string UserFName { get; set; } = null!;
        public string UserLName { get; set; } = null!;
        public string UserPhonePrimary { get; set; } = null!;
        public string? UserPhoneSecondary { get; set; }
        public string UserEmail { get; set; } = null!;
        public string UserPass { get; set; } = null!;
        public string UserRole { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }

        public ICollection<Address> Addresses { get; set; } = null!;
        public Seller? Seller { get; set; }
        public Driver? Driver { get; set; }

    }

