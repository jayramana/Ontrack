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
        public DbSet<Address> Addresses { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<RouteStop> RouteStops { get; set; }
        public DbSet<RoadIssue> RoadIssues { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Warehouse> Warehouses { get; set; }
        public DbSet<DriverLocation> DriverLocations { get; set; }
        public DbSet<ASRVerification> ASRVerifications { get; set; }
        public DbSet<Geofence> Geofences { get; set; }
        
        // FIXED: Changed to PascalCase to match C# conventions
        public DbSet<GeofenceEvent> GeofenceEvents { get; set; }
        public DbSet<PushSubscriptionEntity> PushSubscriptions { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // ===============================
            // ASR VERIFICATION
            // ===============================
            builder.Entity<ASRVerification>()
                .HasOne(a => a.Order)
                .WithOne(o => o.ASRVerification)
                .HasForeignKey<ASRVerification>(a => a.OrderId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<ASRVerification>()
                .HasOne(a => a.Customer)
                .WithMany()
                .HasForeignKey(a => a.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<ASRVerification>()
                .HasOne(a => a.Driver)
                .WithMany()
                .HasForeignKey(a => a.DriverId)
                .OnDelete(DeleteBehavior.Restrict);


            builder.Entity<User>(entity =>
            {
                // entity.ToTable("user_details"); // Commented out to avoid conflict with "Users" table config later

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

                entity.Property(u => u.IsAvailable)
                    .HasColumnName("is_active")
                    .HasColumnType("boolean")
                    .HasDefaultValue(true);

                entity.HasIndex(u => u.UserEmail).IsUnique();
            });

            builder.Entity<Order>(entity =>
            {
                entity.HasOne(o => o.OriginWarehouse)
                    .WithMany(w => w.OriginOrders)
                    .HasForeignKey(o => o.OriginWarehouseId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(o => o.DestinationWarehouse)
                    .WithMany(w => w.DestinationOrders)
                    .HasForeignKey(o => o.DestinationWarehouseId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(o => o.CurrentWarehouse)
                    .WithMany(w => w.CurrentOrders)
                    .HasForeignKey(o => o.CurrentWarehouseId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            builder.Entity<User>(entity =>
            {
                entity.HasOne(u => u.AssignedWarehouse)
                    .WithMany(w => w.AssignedUsers)
                    .HasForeignKey(u => u.AssignedWarehouseId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            builder.Entity<RoadIssue>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(r => r.Driver)
                    .WithMany()
                    .HasForeignKey(r => r.DriverId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.ReportedAt);
                entity.HasIndex(e => e.IsResolved);
            });

            builder.Entity<DriverLocation>(entity =>
            {
                entity.ToTable("DriverLocations");

                entity.HasKey(dl => dl.Id);

                entity.Property(dl => dl.Id)
                      .ValueGeneratedOnAdd();

                entity.Property(dl => dl.Latitude)
                      .IsRequired();

                entity.Property(dl => dl.Longitude)
                      .IsRequired();

                entity.Property(dl => dl.Speed)
                      .HasDefaultValue(0);

                entity.Property(dl => dl.Heading)
                      .HasDefaultValue(0);

                entity.Property(dl => dl.UpdatedAt)
                      .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(dl => dl.Driver)
                      .WithMany()
                      .HasForeignKey(dl => dl.DriverId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(dl => dl.DriverId)
                      .HasDatabaseName("idx_driver_locations_driver");

                entity.HasIndex(dl => dl.UpdatedAt)
                      .HasDatabaseName("idx_driver_locations_updated")
                      .IsDescending(true);
            });

            builder.Entity<Warehouse>(entity =>
            {
                entity.ToTable("Warehouses");

                entity.HasKey(w => w.Id);

                entity.Property(w => w.Id).ValueGeneratedOnAdd();

                entity.Property(w => w.Name).IsRequired();
                entity.Property(w => w.Region).IsRequired();
                entity.Property(w => w.City).IsRequired();
                entity.Property(w => w.Pincode).IsRequired();
                entity.Property(w => w.Address).IsRequired();

                entity.Property(w => w.Latitude);
                entity.Property(w => w.Longitude);

                entity.Property(w => w.ManagerName);
                entity.Property(w => w.ContactPhone);

                entity.Property(w => w.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            builder.Entity<Order>(entity =>
            {
                entity.ToTable("Orders");

                entity.Property(o => o.Priority)
                    .HasDefaultValue(2);

                entity.Property(o => o.RescheduledDate);
                entity.Property(o => o.PickupPincode);
                entity.Property(o => o.DeliveryPincode);
                entity.Property(o => o.EstimatedDeliveryDate);

                entity.HasOne(o => o.OriginWarehouse)
                    .WithMany(w => w.OriginOrders)
                    .HasForeignKey(o => o.OriginWarehouseId)
                    .OnDelete(DeleteBehavior.SetNull)
                    .HasConstraintName("FK_Orders_OriginWarehouse");

                entity.HasOne(o => o.DestinationWarehouse)
                    .WithMany(w => w.DestinationOrders)
                    .HasForeignKey(o => o.DestinationWarehouseId)
                    .OnDelete(DeleteBehavior.SetNull)
                    .HasConstraintName("FK_Orders_DestinationWarehouse");

                entity.HasOne(o => o.CurrentWarehouse)
                    .WithMany(w => w.CurrentOrders)
                    .HasForeignKey(o => o.CurrentWarehouseId)
                    .OnDelete(DeleteBehavior.SetNull)
                    .HasConstraintName("FK_Orders_CurrentWarehouse");
            });

            builder.Entity<Address>()
            .ToTable("Address", t =>
            {
                t.HasCheckConstraint(
                    "chk_seller_type",
                    "(is_seller = FALSE AND seller_type IS NULL) OR " +
                    "(is_seller = TRUE AND seller_type IN ('individual','company'))"
                );
            });

            builder.Entity<Address>(entity =>
            {
            entity.HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<User>(entity =>
            {
                entity.ToTable("Users");

                entity.HasOne(u => u.AssignedWarehouse)
                    .WithMany(w => w.AssignedUsers)
                    .HasForeignKey(u => u.AssignedWarehouseId)
                    .OnDelete(DeleteBehavior.SetNull)
                    .HasConstraintName("FK_Users_Warehouse");
            });

        }
    }
}