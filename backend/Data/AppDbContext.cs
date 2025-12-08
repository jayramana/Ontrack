
using Microsoft.EntityFrameworkCore;
using Backend.Domain.Entity;

namespace Backend.Data
{
   public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
<<<<<<< HEAD
        public DbSet<Address> Addresses { get; set; }
        public DbSet<Seller> Sellers { get; set; }
        public DbSet<Driver> Drivers { get; set; }
=======
        public DbSet<Order> Orders { get; set; }
        public DbSet<RouteStop> RouteStops { get; set; }
        public DbSet<RoadIssue> RoadIssues { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Warehouse> Warehouses { get; set; }
        public DbSet<DriverLocation> DriverLocations { get; set; }

>>>>>>> origin/route

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<User>(entity =>
            {
                entity.ToTable("user_details");

                entity.HasKey(u => u.UserId);

                entity.Property(u => u.UserFName)
                    .HasColumnName("user_f_name")
                    .HasColumnType("varchar(100)")
                    .IsRequired();

                entity.Property(u => u.UserLName)
                    .HasColumnName("user_l_name")
                    .HasColumnType("varchar(100)")
                    .IsRequired();

                entity.Property(u => u.UserPhonePrimary)
                    .HasColumnName("user_phone_primary")
                    .HasColumnType("varchar(20)")
                    .IsRequired();

                entity.Property(u => u.UserPhoneSecondary)
                    .HasColumnName("user_phone_secondary")
                    .HasColumnType("varchar(20)");

                entity.Property(u => u.UserEmail)
                    .HasColumnName("user_email")
                    .HasColumnType("varchar(150)")
                    .IsRequired();

                entity.Property(u => u.UserPass)
                    .HasColumnName("user_pass")
                    .HasColumnType("text")       
                    .IsRequired();

                entity.Property(u => u.UserRole)
                    .HasColumnName("user_role")
                    .HasColumnType("varchar(50)")
                    .IsRequired();

                entity.Property(u => u.CreatedAt)
                    .HasColumnName("created_at")
                    .HasColumnType("timestamp")
                    .HasDefaultValueSql("NOW()");

                entity.Property(u => u.UpdatedAt)
                    .HasColumnName("updated_at")
                    .HasColumnType("timestamp")
                    .HasDefaultValueSql("NOW()");

                entity.Property(u => u.IsActive)
                    .HasColumnName("is_active")
                    .HasColumnType("boolean")
                    .HasDefaultValue(true);

                entity.HasIndex(u => u.UserEmail).IsUnique();
            });

<<<<<<< HEAD
            builder.Entity<Address>(entity =>
            {
                entity.ToTable("address_details");

                entity.HasKey(a => a.AddrId);

                entity.Property(a => a.AddressLine)
                    .HasColumnName("address_line")
                    .HasColumnType("varchar(300)")
                    .IsRequired();

                entity.Property(a => a.AddrCity)
                    .HasColumnName("addr_city")
                    .HasColumnType("varchar(100)")
                    .IsRequired();

                entity.Property(a => a.AddrState)
                    .HasColumnName("addr_state")
                    .HasColumnType("varchar(100)")
                    .IsRequired();

                entity.Property(a => a.AddrPostalCode)
                    .HasColumnName("addr_postal_code")
                    .HasColumnType("varchar(20)")
                    .IsRequired();

                entity.Property(a => a.AddrCountry)
                    .HasColumnName("addr_country")
                    .HasColumnType("varchar(100)")
                    .IsRequired();

                entity.HasOne(a => a.User)
                    .WithMany(u => u.Addresses)
                    .HasForeignKey(a => a.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<Seller>(entity =>
            {
                entity.ToTable("seller_details");

                entity.HasKey(s => s.SellerId);

                entity.Property(s => s.CompanyName)
                    .HasColumnName("company_name")
                    .HasColumnType("varchar(150)")
                    .IsRequired();

                entity.Property(s => s.CompanyEmail)
                    .HasColumnName("company_email")
                    .HasColumnType("varchar(150)")
                    .IsRequired();

                entity.Property(s => s.CompanyPhone1)
                    .HasColumnName("company_phone_1")
                    .HasColumnType("varchar(20)")
                    .IsRequired();

                entity.Property(s => s.CompanyPhone2)
                    .HasColumnName("company_phone_2")
                    .HasColumnType("varchar(20)");

                entity.HasOne(s => s.User)
                    .WithOne(u => u.Seller)
                    .HasForeignKey<Seller>(s => s.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<Driver>(entity =>
            {
                entity.ToTable("driver_details");

                entity.HasKey(d => d.DriverId);

                entity.Property(d => d.DriverLicenseNumber)
                    .HasColumnName("driver_license_number")
                    .HasColumnType("varchar(50)")
                    .IsRequired();

                entity.Property(d => d.DriverLicenseExpiry)
                    .HasColumnName("driver_license_expiry")
                    .HasColumnType("date")
                    .IsRequired();

                entity.HasOne(d => d.User)
                    .WithOne(u => u.Driver)
                    .HasForeignKey<Driver>(d => d.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
=======
            // Configure Order-Warehouse relationships
            modelBuilder.Entity<Order>(entity =>
            {
                // Origin Warehouse relationship
                entity.HasOne(o => o.OriginWarehouse)
                    .WithMany(w => w.OriginOrders)
                    .HasForeignKey(o => o.OriginWarehouseId)
                    .OnDelete(DeleteBehavior.SetNull);

                // Destination Warehouse relationship
                entity.HasOne(o => o.DestinationWarehouse)
                    .WithMany(w => w.DestinationOrders)
                    .HasForeignKey(o => o.DestinationWarehouseId)
                    .OnDelete(DeleteBehavior.SetNull);

                // Current Warehouse relationship
                entity.HasOne(o => o.CurrentWarehouse)
                    .WithMany(w => w.CurrentOrders)
                    .HasForeignKey(o => o.CurrentWarehouseId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Configure User-Warehouse relationship
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasOne(u => u.AssignedWarehouse)
                    .WithMany(w => w.AssignedUsers)
                    .HasForeignKey(u => u.AssignedWarehouseId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Seed initial users with BCrypt hashed passwords
            // Password for all users: "password123"
            // Pre-generated hashes to avoid model changes on migration
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Name = "John Customer",
                    Email = "customer@test.com",
                    PasswordHash = "$2a$11$XZPPqKjhrvOL.nJZqSJJUeWQXM0YqKK0VZ0hRFqVZ6tGHW8Q.JT0K", // password123
                    Role = UserRoles.Customer
                },
                new User
                {
                    Id = 2,
                    Name = "Jane Driver",
                    Email = "driver@test.com",
                    PasswordHash = "$2a$11$XZPPqKjhrvOL.nJZqSJJUeWQXM0YqKK0VZ0hRFqVZ6tGHW8Q.JT0K", // password123
                    Role = UserRoles.Driver
                },
                new User
                {
                    Id = 3,
                    Name = "Mike Admin",
                    Email = "admin@arrivenow.com",
                    PasswordHash = "$2a$11$DuJo7jxzUwBaDdINcbzgsOGJAYF7iDgJffCmn4AhSmX8VlGbMfF8e", // Admin@123
                    Role = UserRoles.Admin
                }
            );
>>>>>>> origin/route
        }
    }
}

