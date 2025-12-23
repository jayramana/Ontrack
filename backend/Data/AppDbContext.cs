// // using Microsoft.EntityFrameworkCore;
// // using Backend.Domain.Entity;

// // namespace Backend.Data
// // {
// //    public class AppDbContext : DbContext
// //     {
// //         public AppDbContext(DbContextOptions<AppDbContext> options)
// //             : base(options)
// //         {
// //         }

// //         public DbSet<User> Users { get; set; }
// //         public DbSet<Address> Addresses { get; set; }
// //         public DbSet<Order> Orders { get; set; }
// //         public DbSet<RouteStop> RouteStops { get; set; }
// //         public DbSet<RoadIssue> RoadIssues { get; set; }
// //         public DbSet<Notification> Notifications { get; set; }
// //         public DbSet<Warehouse> Warehouses { get; set; }
// //         public DbSet<DriverLocation> DriverLocations { get; set; }
// //         public DbSet<ASRVerification> ASRVerifications { get; set; }
// //         public DbSet<Geofence> Geofences { get; set; }
        
// //         // FIXED: Changed to PascalCase to match C# conventions
// //         public DbSet<GeofenceEvent> GeofenceEvents { get; set; }
// //         public DbSet<PushSubscriptionEntity> PushSubscriptions { get; set; }

// //         protected override void OnModelCreating(ModelBuilder builder)
// //         {
// //             base.OnModelCreating(builder);

// //             // ===============================
// //             // ASR VERIFICATION
// //             // ===============================
// //             builder.Entity<ASRVerification>()
// //                 .HasOne(a => a.Order)
// //                 .WithOne(o => o.ASRVerification)
// //                 .HasForeignKey<ASRVerification>(a => a.OrderId)
// //                 .OnDelete(DeleteBehavior.Restrict);

// //             builder.Entity<ASRVerification>()
// //                 .HasOne(a => a.Customer)
// //                 .WithMany()
// //                 .HasForeignKey(a => a.CustomerId)
// //                 .OnDelete(DeleteBehavior.Restrict);

// //             builder.Entity<ASRVerification>()
// //                 .HasOne(a => a.Driver)
// //                 .WithMany()
// //                 .HasForeignKey(a => a.DriverId)
// //                 .OnDelete(DeleteBehavior.Restrict);


// //             builder.Entity<User>(entity =>
// //             {
// //                 // entity.ToTable("user_details"); // Commented out to avoid conflict with "Users" table config later

// //                 entity.HasKey(u => u.UserId);

// //                 entity.Property(u => u.UserFName)
// //                     .HasColumnName("user_f_name")
// //                     .HasColumnType("varchar(100)")
// //                     .IsRequired();

// //                 entity.Property(u => u.UserLName)
// //                     .HasColumnName("user_l_name")
// //                     .HasColumnType("varchar(100)")
// //                     .IsRequired();

// //                 entity.Property(u => u.UserPhonePrimary)
// //                     .HasColumnName("user_phone_primary")
// //                     .HasColumnType("varchar(20)")
// //                     .IsRequired();

// //                 entity.Property(u => u.UserPhoneSecondary)
// //                     .HasColumnName("user_phone_secondary")
// //                     .HasColumnType("varchar(20)");

// //                 entity.Property(u => u.UserEmail)
// //                     .HasColumnName("user_email")
// //                     .HasColumnType("varchar(150)")
// //                     .IsRequired();

// //                 entity.Property(u => u.UserPass)
// //                     .HasColumnName("user_pass")
// //                     .HasColumnType("text")
// //                     .IsRequired();

// //                 entity.Property(u => u.UserRole)
// //                     .HasColumnName("user_role")
// //                     .HasColumnType("varchar(50)")
// //                     .IsRequired();

// //                 entity.Property(u => u.CreatedAt)
// //                     .HasColumnName("created_at")
// //                     .HasColumnType("timestamp")
// //                     .HasDefaultValueSql("NOW()");

// //                 entity.Property(u => u.UpdatedAt)
// //                     .HasColumnName("updated_at")
// //                     .HasColumnType("timestamp")
// //                     .HasDefaultValueSql("NOW()");

// //                 entity.Property(u => u.IsAvailable)
// //                     .HasColumnName("is_active")
// //                     .HasColumnType("boolean")
// //                     .HasDefaultValue(true);

// //                 entity.HasIndex(u => u.UserEmail).IsUnique();
// //             });

// //             builder.Entity<Order>(entity =>
// //             {
// //                 entity.HasOne(o => o.OriginWarehouse)
// //                     .WithMany(w => w.OriginOrders)
// //                     .HasForeignKey(o => o.OriginWarehouseId)
// //                     .OnDelete(DeleteBehavior.SetNull);

// //                 entity.HasOne(o => o.DestinationWarehouse)
// //                     .WithMany(w => w.DestinationOrders)
// //                     .HasForeignKey(o => o.DestinationWarehouseId)
// //                     .OnDelete(DeleteBehavior.SetNull);

// //                 entity.HasOne(o => o.CurrentWarehouse)
// //                     .WithMany(w => w.CurrentOrders)
// //                     .HasForeignKey(o => o.CurrentWarehouseId)
// //                     .OnDelete(DeleteBehavior.SetNull);
// //             });

// //             builder.Entity<User>(entity =>
// //             {
// //                 entity.HasOne(u => u.AssignedWarehouse)
// //                     .WithMany(w => w.AssignedUsers)
// //                     .HasForeignKey(u => u.AssignedWarehouseId)
// //                     .OnDelete(DeleteBehavior.SetNull);
// //             });

// //             builder.Entity<RoadIssue>(entity =>
// //             {
// //                 entity.HasKey(e => e.Id);

// //                 entity.HasOne(r => r.Driver)
// //                     .WithMany()
// //                     .HasForeignKey(r => r.DriverId)
// //                     .OnDelete(DeleteBehavior.Cascade);

// //                 entity.HasIndex(e => e.ReportedAt);
// //                 entity.HasIndex(e => e.IsResolved);
// //             });

// //             builder.Entity<DriverLocation>(entity =>
// //             {
// //                 entity.ToTable("DriverLocations");

// //                 entity.HasKey(dl => dl.Id);

// //                 entity.Property(dl => dl.Id)
// //                       .ValueGeneratedOnAdd();

// //                 entity.Property(dl => dl.Latitude)
// //                       .IsRequired();

// //                 entity.Property(dl => dl.Longitude)
// //                       .IsRequired();

// //                 entity.Property(dl => dl.Speed)
// //                       .HasDefaultValue(0);

// //                 entity.Property(dl => dl.Heading)
// //                       .HasDefaultValue(0);

// //                 entity.Property(dl => dl.UpdatedAt)
// //                       .HasDefaultValueSql("CURRENT_TIMESTAMP");

// //                 entity.HasOne(dl => dl.Driver)
// //                       .WithMany()
// //                       .HasForeignKey(dl => dl.DriverId)
// //                       .OnDelete(DeleteBehavior.Cascade);

// //                 entity.HasIndex(dl => dl.DriverId)
// //                       .HasDatabaseName("idx_driver_locations_driver");

// //                 entity.HasIndex(dl => dl.UpdatedAt)
// //                       .HasDatabaseName("idx_driver_locations_updated")
// //                       .IsDescending(true);
// //             });

// //             builder.Entity<Warehouse>(entity =>
// //             {
// //                 entity.ToTable("Warehouses");

// //                 entity.HasKey(w => w.Id);

// //                 entity.Property(w => w.Id).ValueGeneratedOnAdd();

// //                 entity.Property(w => w.Name).IsRequired();
// //                 entity.Property(w => w.Region).IsRequired();
// //                 entity.Property(w => w.City).IsRequired();
// //                 entity.Property(w => w.Pincode).IsRequired();
// //                 entity.Property(w => w.Address).IsRequired();

// //                 entity.Property(w => w.Latitude);
// //                 entity.Property(w => w.Longitude);

// //                 entity.Property(w => w.ManagerName);
// //                 entity.Property(w => w.ContactPhone);

// //                 entity.Property(w => w.CreatedAt)
// //                     .HasDefaultValueSql("CURRENT_TIMESTAMP");
// //             });

// //             builder.Entity<Order>(entity =>
// //             {
// //                 entity.ToTable("Orders");

// //                 entity.Property(o => o.Priority)
// //                     .HasDefaultValue(2);

// //                 entity.Property(o => o.RescheduledDate);
// //                 entity.Property(o => o.PickupPincode);
// //                 entity.Property(o => o.DeliveryPincode);
// //                 entity.Property(o => o.EstimatedDeliveryDate);

// //                 entity.HasOne(o => o.OriginWarehouse)
// //                     .WithMany(w => w.OriginOrders)
// //                     .HasForeignKey(o => o.OriginWarehouseId)
// //                     .OnDelete(DeleteBehavior.SetNull)
// //                     .HasConstraintName("FK_Orders_OriginWarehouse");

// //                 entity.HasOne(o => o.DestinationWarehouse)
// //                     .WithMany(w => w.DestinationOrders)
// //                     .HasForeignKey(o => o.DestinationWarehouseId)
// //                     .OnDelete(DeleteBehavior.SetNull)
// //                     .HasConstraintName("FK_Orders_DestinationWarehouse");

// //                 entity.HasOne(o => o.CurrentWarehouse)
// //                     .WithMany(w => w.CurrentOrders)
// //                     .HasForeignKey(o => o.CurrentWarehouseId)
// //                     .OnDelete(DeleteBehavior.SetNull)
// //                     .HasConstraintName("FK_Orders_CurrentWarehouse");
// //             });

// //             builder.Entity<Address>()
// //             .ToTable("Address", t =>
// //             {
// //                 t.HasCheckConstraint(
// //                     "chk_seller_type",
// //                     "(is_seller = FALSE AND seller_type IS NULL) OR " +
// //                     "(is_seller = TRUE AND seller_type IN ('individual','company'))"
// //                 );
// //             });

// //             builder.Entity<Address>(entity =>
// //             {
// //             entity.HasOne(a => a.User)
// //                 .WithMany()
// //                 .HasForeignKey(a => a.UserId)
// //                 .OnDelete(DeleteBehavior.Cascade);
// //             });

// //             builder.Entity<User>(entity =>
// //             {
// //                 entity.ToTable("Users");

// //                 entity.HasOne(u => u.AssignedWarehouse)
// //                     .WithMany(w => w.AssignedUsers)
// //                     .HasForeignKey(u => u.AssignedWarehouseId)
// //                     .OnDelete(DeleteBehavior.SetNull)
// //                     .HasConstraintName("FK_Users_Warehouse");
// //             });

// //         }
// //     }
// // }

// using Microsoft.EntityFrameworkCore;
// using Backend.Domain.Entity;
// using System;
// using System.Linq;
// using System.Threading;
// using System.Threading.Tasks;

// namespace Backend.Data
// {
//     public class AppDbContext : DbContext
//     {
//         public AppDbContext(DbContextOptions<AppDbContext> options)
//             : base(options)
//         {
//         }

//         /* ===============================
//            DB SETS
//         =============================== */

//         public DbSet<User> Users { get; set; }
//         public DbSet<Address> Addresses { get; set; }
//         public DbSet<Order> Orders { get; set; }
//         public DbSet<RouteStop> RouteStops { get; set; }
//         public DbSet<RoadIssue> RoadIssues { get; set; }
//         public DbSet<Notification> Notifications { get; set; }
//         public DbSet<Warehouse> Warehouses { get; set; }
//         public DbSet<DriverLocation> DriverLocations { get; set; }
//         public DbSet<ASRVerification> ASRVerifications { get; set; }
//         public DbSet<Geofence> Geofences { get; set; }
//         public DbSet<GeofenceEvent> GeofenceEvents { get; set; }
//         public DbSet<PushSubscriptionEntity> PushSubscriptions { get; set; }

//         /* ===============================
//            IST TIME HANDLING
//         =============================== */

//         private static DateTime GetIndianTime()
//         {
//             var istZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
//             return DateTime.SpecifyKind(
//                 TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, istZone),
//                 DateTimeKind.Unspecified
//             );
//         }

//         public override int SaveChanges()
//         {
//             ApplyIndianTimestamps();
//             return base.SaveChanges();
//         }

//         public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
//         {
//             ApplyIndianTimestamps();
//             return await base.SaveChangesAsync(cancellationToken);
//         }

//         private void ApplyIndianTimestamps()
//         {
//             var entries = ChangeTracker.Entries()
//                 .Where(e =>
//                     e.Entity is User ||
//                     e.Entity is Order ||
//                     e.Entity is Warehouse ||
//                     e.Entity is DriverLocation ||
//                     e.Entity is RoadIssue ||
//                     e.Entity is Notification ||
//                     e.Entity is ASRVerification
//                 );

//             foreach (var entry in entries)
//             {
//                 var now = GetIndianTime();

//                 if (entry.State == EntityState.Added)
//                 {
//                     if (entry.Properties.Any(p => p.Metadata.Name == "CreatedAt"))
//                         entry.Property("CreatedAt").CurrentValue = now;

//                     if (entry.Properties.Any(p => p.Metadata.Name == "UpdatedAt"))
//                         entry.Property("UpdatedAt").CurrentValue = now;
//                 }

//                 if (entry.State == EntityState.Modified)
//                 {
//                     if (entry.Properties.Any(p => p.Metadata.Name == "UpdatedAt"))
//                         entry.Property("UpdatedAt").CurrentValue = now;
//                 }
//             }
//         }

//         /* ===============================
//            MODEL CONFIGURATION
//         =============================== */

//         protected override void OnModelCreating(ModelBuilder builder)
//         {
//             base.OnModelCreating(builder);

//             /* ===============================
//                USER
//             =============================== */

//             builder.Entity<User>(entity =>
//             {
//                 entity.ToTable("Users");
//                 entity.HasKey(u => u.UserId);

//                 entity.Property(u => u.UserFName)
//                     .HasColumnName("user_f_name")
//                     .HasColumnType("varchar(100)")
//                     .IsRequired();

//                 entity.Property(u => u.UserLName)
//                     .HasColumnName("user_l_name")
//                     .HasColumnType("varchar(100)")
//                     .IsRequired();

//                 entity.Property(u => u.UserPhonePrimary)
//                     .HasColumnName("user_phone_primary")
//                     .HasColumnType("varchar(20)")
//                     .IsRequired();

//                 entity.Property(u => u.UserPhoneSecondary)
//                     .HasColumnName("user_phone_secondary")
//                     .HasColumnType("varchar(20)");

//                 entity.Property(u => u.UserEmail)
//                     .HasColumnName("user_email")
//                     .HasColumnType("varchar(150)")
//                     .IsRequired();

//                 entity.Property(u => u.UserPass)
//                     .HasColumnName("user_pass")
//                     .HasColumnType("text")
//                     .IsRequired();

//                 entity.Property(u => u.UserRole)
//                     .HasColumnName("user_role")
//                     .HasColumnType("varchar(50)")
//                     .IsRequired();

//                 entity.Property(u => u.CreatedAt)
//                     .HasColumnName("created_at")
//                     .HasColumnType("timestamp without time zone");

//                 entity.Property(u => u.UpdatedAt)
//                     .HasColumnName("updated_at")
//                     .HasColumnType("timestamp without time zone");

//                 entity.Property(u => u.IsAvailable)
//                     .HasColumnName("is_active")
//                     .HasColumnType("boolean")
//                     .HasDefaultValue(true);

//                 entity.HasIndex(u => u.UserEmail).IsUnique();

//                 entity.HasOne(u => u.AssignedWarehouse)
//                     .WithMany(w => w.AssignedUsers)
//                     .HasForeignKey(u => u.AssignedWarehouseId)
//                     .OnDelete(DeleteBehavior.SetNull)
//                     .HasConstraintName("FK_Users_Warehouse");
//             });

//             /* ===============================
//                WAREHOUSE
//             =============================== */

//             builder.Entity<Warehouse>(entity =>
//             {
//                 entity.ToTable("Warehouses");
//                 entity.HasKey(w => w.Id);

//                 entity.Property(w => w.CreatedAt)
//                     .HasColumnType("timestamp without time zone");
//             });

//             /* ===============================
//                DRIVER LOCATION
//             =============================== */

//             builder.Entity<DriverLocation>(entity =>
//             {
//                 entity.ToTable("DriverLocations");
//                 entity.HasKey(dl => dl.Id);

//                 entity.Property(dl => dl.UpdatedAt)
//                     .HasColumnType("timestamp without time zone");

//                 entity.HasOne(dl => dl.Driver)
//                     .WithMany()
//                     .HasForeignKey(dl => dl.DriverId)
//                     .OnDelete(DeleteBehavior.Cascade);
//             });

//             /* ===============================
//                ORDER RELATIONSHIPS
//             =============================== */

//             builder.Entity<Order>(entity =>
// {
//     entity.ToTable("Orders");

//     entity.Property(o => o.CreatedAt)
//         .HasColumnType("timestamp without time zone")
//         .IsRequired();

//     entity.Property(o => o.UpdatedAt)
//         .HasColumnType("timestamp without time zone")
//         .IsRequired();

//     entity.Property(o => o.Priority)
//         .HasDefaultValue(2);

//     entity.HasOne(o => o.OriginWarehouse)
//         .WithMany(w => w.OriginOrders)
//         .HasForeignKey(o => o.OriginWarehouseId)
//         .OnDelete(DeleteBehavior.SetNull);

//     entity.HasOne(o => o.DestinationWarehouse)
//         .WithMany(w => w.DestinationOrders)
//         .HasForeignKey(o => o.DestinationWarehouseId)
//         .OnDelete(DeleteBehavior.SetNull);

//     entity.HasOne(o => o.CurrentWarehouse)
//         .WithMany(w => w.CurrentOrders)
//         .HasForeignKey(o => o.CurrentWarehouseId)
//         .OnDelete(DeleteBehavior.SetNull);
// });


//             /* ===============================
//                ADDRESS
//             =============================== */

//             builder.Entity<Address>(entity =>
//             {
//                 entity.ToTable("Address");

//                 entity.HasOne(a => a.User)
//                     .WithMany()
//                     .HasForeignKey(a => a.UserId)
//                     .OnDelete(DeleteBehavior.Cascade);
//             });

//             /* ===============================
//                ASR VERIFICATION
//             =============================== */

//             builder.Entity<ASRVerification>(entity =>
//             {
//                 entity.HasOne(a => a.Order)
//                     .WithOne(o => o.ASRVerification)
//                     .HasForeignKey<ASRVerification>(a => a.OrderId)
//                     .OnDelete(DeleteBehavior.Restrict);

//                 entity.HasOne(a => a.Customer)
//                     .WithMany()
//                     .HasForeignKey(a => a.CustomerId)
//                     .OnDelete(DeleteBehavior.Restrict);

//                 entity.HasOne(a => a.Driver)
//                     .WithMany()
//                     .HasForeignKey(a => a.DriverId)
//                     .OnDelete(DeleteBehavior.Restrict);
//             });
//         }
//     }
// }

using Microsoft.EntityFrameworkCore;
using Backend.Domain.Entity;
using System;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        /* ===============================
           DB SETS
        =============================== */

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
        public DbSet<GeofenceEvent> GeofenceEvents { get; set; }
        public DbSet<PushSubscriptionEntity> PushSubscriptions { get; set; }

        /* ===============================
           UTC TIME HANDLING (CORRECT)
        =============================== */

        private static DateTime GetUtcNow() => DateTime.UtcNow;

        public override int SaveChanges()
        {
            ApplyUtcTimestamps();
            return base.SaveChanges();
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            ApplyUtcTimestamps();
            return await base.SaveChangesAsync(cancellationToken);
        }

        private void ApplyUtcTimestamps()
        {
            var entries = ChangeTracker.Entries()
                .Where(e =>
                    e.Entity is User ||
                    e.Entity is Order ||
                    e.Entity is Warehouse ||
                    e.Entity is DriverLocation ||
                    e.Entity is RoadIssue ||
                    e.Entity is Notification ||
                    e.Entity is ASRVerification
                );

            foreach (var entry in entries)
            {
                var now = GetUtcNow();

                if (entry.State == EntityState.Added)
                {
                    if (entry.Properties.Any(p => p.Metadata.Name == "CreatedAt"))
                        entry.Property("CreatedAt").CurrentValue = now;

                    if (entry.Properties.Any(p => p.Metadata.Name == "UpdatedAt"))
                        entry.Property("UpdatedAt").CurrentValue = now;
                }

                if (entry.State == EntityState.Modified)
                {
                    if (entry.Properties.Any(p => p.Metadata.Name == "UpdatedAt"))
                        entry.Property("UpdatedAt").CurrentValue = now;
                }
            }
        }

        /* ===============================
           MODEL CONFIGURATION
        =============================== */

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            /* ===============================
               USER
            =============================== */
            builder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.UserId);

                entity.Property(u => u.UserFName).IsRequired();
                entity.Property(u => u.UserLName).IsRequired();
                entity.Property(u => u.UserPhonePrimary).IsRequired();
                entity.Property(u => u.UserEmail).IsRequired();
                entity.Property(u => u.UserPass).IsRequired();
                entity.Property(u => u.UserRole).IsRequired();

                entity.Property(u => u.IsAvailable)
                      .HasDefaultValue(true);

                entity.HasIndex(u => u.UserEmail).IsUnique();

                entity.HasOne(u => u.AssignedWarehouse)
                      .WithMany(w => w.AssignedUsers)
                      .HasForeignKey(u => u.AssignedWarehouseId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            /* ===============================
               WAREHOUSE
            =============================== */
            builder.Entity<Warehouse>(entity =>
            {
                entity.HasKey(w => w.Id);

                entity.Property(w => w.Name).IsRequired();
                entity.Property(w => w.Region).IsRequired();
                entity.Property(w => w.City).IsRequired();
                entity.Property(w => w.Pincode).IsRequired();
                entity.Property(w => w.Address).IsRequired();

                entity.Property(w => w.ReceivedParcels).HasDefaultValue(0);
                entity.Property(w => w.OutgoingParcels).HasDefaultValue(0);
                entity.Property(w => w.CurrentParcels).HasDefaultValue(0);
            });

            /* ===============================
               DRIVER LOCATION
            =============================== */
            builder.Entity<DriverLocation>(entity =>
            {
                entity.HasKey(dl => dl.Id);

                entity.Property(dl => dl.Latitude).IsRequired();
                entity.Property(dl => dl.Longitude).IsRequired();

                entity.Property(dl => dl.Speed).HasDefaultValue(0);
                entity.Property(dl => dl.Heading).HasDefaultValue(0);

                entity.HasOne(dl => dl.Driver)
                      .WithMany()
                      .HasForeignKey(dl => dl.DriverId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(dl => dl.DriverId);
                entity.HasIndex(dl => dl.UpdatedAt);
            });

            /* ===============================
               ORDER
            =============================== */
            builder.Entity<Order>(entity =>
            {
                entity.Property(o => o.Priority)
                      .HasDefaultValue(2);

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

            /* ===============================
               ADDRESS
            =============================== */
            builder.Entity<Address>(entity =>
            {
                entity.HasOne(a => a.User)
                      .WithMany()
                      .HasForeignKey(a => a.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            /* ===============================
               ASR VERIFICATION
            =============================== */
            builder.Entity<ASRVerification>(entity =>
            {
                entity.HasOne(a => a.Order)
                      .WithOne(o => o.ASRVerification)
                      .HasForeignKey<ASRVerification>(a => a.OrderId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.Customer)
                      .WithMany()
                      .HasForeignKey(a => a.CustomerId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.Driver)
                      .WithMany()
                      .HasForeignKey(a => a.DriverId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            /* ===============================
               GLOBAL snake_case + timestamptz
            =============================== */
            foreach (var entity in builder.Model.GetEntityTypes())
            {
                entity.SetTableName(ToSnakeCase(entity.GetTableName()));

                foreach (var property in entity.GetProperties())
                {
                    property.SetColumnName(ToSnakeCase(property.GetColumnName()));

                    if (property.ClrType == typeof(DateTime) ||
                        property.ClrType == typeof(DateTime?))
                    {
                        property.SetColumnType("timestamp with time zone");
                    }
                }
            }
        }

        /* ===============================
           SNAKE_CASE HELPER
        =============================== */
        private static string ToSnakeCase(string text)
        {
            if (string.IsNullOrEmpty(text))
                return text;

            var sb = new StringBuilder();
            sb.Append(char.ToLowerInvariant(text[0]));

            for (int i = 1; i < text.Length; i++)
            {
                if (char.IsUpper(text[i]))
                {
                    sb.Append('_');
                    sb.Append(char.ToLowerInvariant(text[i]));
                }
                else
                {
                    sb.Append(text[i]);
                }
            }

            return sb.ToString();
        }
    }
}
