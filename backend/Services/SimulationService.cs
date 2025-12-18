using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Backend.Data;
using Backend.Domain.Entity;
using Backend.Hubs;

namespace Backend.Services
{
    public class SimulationService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<SimulationService> _logger;

        public SimulationService(IServiceProvider serviceProvider, ILogger<SimulationService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("🚀 Driver Simulation Service Started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessSimulations();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in Simulation Loop");
                }

                // Run every 5 seconds
                await Task.Delay(5000, stoppingToken);
            }
        }

        private async Task ProcessSimulations()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<LogisticsHub>>();
                var geofenceService = scope.ServiceProvider.GetRequiredService<GeofenceService>();

                // Find drivers who are actively simulating
                var simulatingDrivers = await context.Users
                    .Where(u => u.IsSimulating && u.IsSharingLocation == false)
                    .ToListAsync();

                foreach (var driver in simulatingDrivers)
                {
                    // Find their active order (OutForDelivery or Assigned)
                    var activeOrder = await context.Orders
                        .Where(o => o.DriverId == driver.UserId 
                                 && (o.Status == "OutForDelivery" || o.Status == "Assigned"))
                        .OrderByDescending(o => o.AiPriority)
                        .FirstOrDefaultAsync();

                    if (activeOrder == null || activeOrder.DeliveryLatitude == 0 || activeOrder.DeliveryLongitude == 0)
                    {
                        continue; // Nothing to simulate towards
                    }

                    // Current Position (Start from last known or Warehouse if null)
                    double currentLat = driver.SimulationLat ?? driver.CurrentLatitude ?? activeOrder.PickupLatitude;
                    double currentLon = driver.SimulationLon ?? driver.CurrentLongitude ?? activeOrder.PickupLongitude;

                    // Destination
                    double destLat = activeOrder.DeliveryLatitude;
                    double destLon = activeOrder.DeliveryLongitude;

                    // Calculate Distance
                    double distanceKm = CalculateDistance(currentLat, currentLon, destLat, destLon);

                    // Stop if close (0.1km / 100m)
                    if (distanceKm < 0.1)
                    {
                        if (driver.IsSimulating) 
                        {
                            // PAUSE SIMULATION (Do not turn off flag)
                            // This allows it to resume automatically when the Order Status changes (and a new Order is found)
                            _logger.LogInformation($"⏸️ [Simulation] Driver {driver.UserId} paused at 100m from destination (Order {activeOrder.Id}). Waiting for status update.");
                            
                            // Optional: Force exact location to 100m mark or just stay put?
                            // Staying put at last step is smoother. 
                        }
                    }
                    else
                    {
                        // MOVE DRIVER
                        // Speed: 60km/h = 1km/min = ~0.08km/5sec
                        double stepDistance = 0.08; // 80 meters per tick
                        double ratio = Math.Min(1, stepDistance / distanceKm);

                        double newLat = currentLat + (destLat - currentLat) * ratio;
                        double newLon = currentLon + (destLon - currentLon) * ratio;

                        // UPDATE DB STATE
                        driver.SimulationLat = newLat;
                        driver.SimulationLon = newLon;
                        driver.CurrentLatitude = newLat;
                        driver.CurrentLongitude = newLon;

                        // OPTIMIZATION: Update latest DriverLocation instead of inserting new rows (Prevent DB Bloat)
                        var lastLocation = await context.DriverLocations
                            .Where(dl => dl.DriverId == driver.UserId)
                            .OrderByDescending(dl => dl.UpdatedAt)
                            .FirstOrDefaultAsync();

                        if (lastLocation != null)
                        {
                            // Update existing (Upsert)
                            lastLocation.Latitude = newLat;
                            lastLocation.Longitude = newLon;
                            lastLocation.Speed = 60;
                            lastLocation.UpdatedAt = DateTime.UtcNow;
                            // context.Update(lastLocation); // Not strictly needed as it's tracked, but clear intent
                        }
                        else
                        {
                            // Create first entry if none exists
                            context.DriverLocations.Add(new DriverLocation
                            {
                                DriverId = driver.UserId,
                                Latitude = newLat,
                                Longitude = newLon,
                                Speed = 60, 
                                UpdatedAt = DateTime.UtcNow
                            });
                        }

                        // 📡 EMIT SIGNALR
                        await hubContext.Clients.All.SendAsync("ReceiveDriverLocation", new
                        {
                            driverId = driver.UserId,
                            latitude = newLat,
                            longitude = newLon,
                            speed = 60,
                            updatedAt = DateTime.UtcNow
                        });
                        
                        // 🔔 TRIGGER GEOFENCE ALERTS
                        await geofenceService.CheckAndNotifyAsync(driver.UserId, newLat, newLon);

                        _logger.LogInformation($"📍 [Sim] Driver {driver.UserId} moving → Order {activeOrder.Id} ({distanceKm:F2}km left)");
                    }
                }

                await context.SaveChangesAsync();
            }
        }

        // Haversine Helper
        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            var R = 6371; // Earth radius km
            var dLat = ToRad(lat2 - lat1);
            var dLon = ToRad(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private double ToRad(double deg) => deg * (Math.PI / 180);
    }
}
