
using Microsoft.EntityFrameworkCore;
using Backend.Domain.Entity;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<RouteStop> RouteStops { get; set; }
        public DbSet<RoadIssue> RoadIssues { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Warehouse> Warehouses { get; set; }
        public DbSet<DriverLocation> DriverLocations { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.Role).IsRequired().HasMaxLength(50);
            });

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
        }
    }
}
