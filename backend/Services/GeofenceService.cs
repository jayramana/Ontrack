// // namespace Backend.Services;

// // // Services/GeofenceService.cs
// // using Microsoft.AspNetCore.SignalR;
// // using Microsoft.Extensions.Caching.Memory;
// // using System;
// // using System.Collections.Generic;
// // using System.Linq;
// // using System.Threading.Tasks;
// // using WebPush; // from WebPush NuGet
// // using Backend.Domain.Entity; // adjust namespace
// // using Backend.Data;
// // using Backend.Services;

// // public class GeofenceService
// // {
// //     private readonly AppDbContext _db;
// //     private readonly IHubContext<GeofenceHub> _hub;
// //     private readonly IMemoryCache _cache;
// //     private readonly WebPushClient _webPushClient;
// //     private readonly VapidDetails _vapidDetails;
// //     // cooldown - don't re-notify same driver/geofence within this
// //     private readonly TimeSpan _repeatCooldown = TimeSpan.FromSeconds(5);

// //     public GeofenceService(
// //         AppDbContext db,
// //         IHubContext<GeofenceHub> hub,
// //         IMemoryCache cache,
// //         IConfiguration config)
// //     {
// //         _db = db;
// //         _hub = hub;
// //         _cache = cache;
// //         _webPushClient = new WebPushClient();

// //         var publicKey = config["Vapid:PublicKey"] ?? throw new ArgumentNullException("Vapid:PublicKey");
// //         var privateKey = config["Vapid:PrivateKey"] ?? throw new ArgumentNullException("Vapid:PrivateKey");
// //         var subject = config["Vapid:Subject"] ?? "mailto:admin@example.com";

// //         _vapidDetails = new VapidDetails(subject, publicKey, privateKey);
// //     }

// //     public async Task CreateGeofenceForOrderAsync(Order order)
// //     {

// //         var geofence = new Geofence
// //         {
// //             Name = $"Order-{order.Id}-{order.ReceiverName}",
// //             CenterLat = order.DeliveryLatitude,
// //             CenterLon = order.DeliveryLongitude,
// //             RadiusMeters = 1000, 
// //             OrderId = order.Id,
// //             OwnerUserId = order.CustomerId, 
// //             IsActive = true,
// //             CreatedAt = DateTime.UtcNow
// //         };

// //         _db.Geofences.Add(geofence);
// //         await _db.SaveChangesAsync();
// //     }

// //     public async Task CheckAndNotifyAsync(int driverId, double driverLat, double driverLon, IEnumerable<string>? targetGroups = null)
// //     {
// //         // 1. Persist Driver Location
// //         var driver = await _db.Users.FindAsync(driverId);
// //         if (driver != null)
// //         {
// //             driver.CurrentLatitude = driverLat;
// //             driver.CurrentLongitude = driverLon;
// //             await _db.SaveChangesAsync();
// //         }

// //         var geofences = _db.Geofences.Where(g => g.IsActive).ToList();
// //         Console.WriteLine($"[DEBUG] Checking {geofences.Count} active geofences for Driver {driverId}");

// //         foreach (var g in geofences)
// //         {
// //             var distanceMeters = HaversineDistanceMeters(driverLat, driverLon, g.CenterLat, g.CenterLon);
// //             bool isInside = distanceMeters <= g.RadiusMeters;
            
// //             Console.WriteLine($"[DEBUG] Geofence {g.GeofenceId}: Dist {distanceMeters}m (Radius {g.RadiusMeters}m). Inside? {isInside}");

// //             string stateKey = $"geofence_state:{g.GeofenceId}:driver:{driverId}";
// //             var last = _cache.Get<GeofenceState>(stateKey);

// //             if (isInside)
// //             {
// //                 // Trigger only if previously outside or null (first time entry)
// //                 if (last == null || last.IsInside == false)
// //                 {
// //                     // Debounce check: if we just triggered very recently, skip
// //                     if (last != null && (DateTime.UtcNow - last.LastEventAt) < _repeatCooldown)
// //                     {
// //                         UpdateState(stateKey, true);
// //                         continue;
// //                     }

// //                     // Persist event
// //                     var evt = new GeofenceEvent
// //                     {
// //                         GeofenceId = g.GeofenceId,
// //                         DriverId = driverId,
// //                         EventType = "ENTER",
// //                         DistanceMeters = distanceMeters,
// //                         EventAt = DateTime.UtcNow
// //                     };
// //                     _db.geofenceEvents.Add(evt);
// //                     await _db.SaveChangesAsync();

// //                     var payload = new
// //                     {
// //                         geofenceId = g.GeofenceId,
// //                         name = g.Name,
// //                         @event = "ENTER",
// //                         driverId,
// //                         ownerId = g.OwnerUserId, // Added for frontend filtering
// //                         distanceMeters = Math.Round(distanceMeters, 2),
// //                         radiusMeters = g.RadiusMeters,
// //                         at = evt.EventAt
// //                     };

// //                     // SignalR broadcast
// //                     if (targetGroups != null)
// //                     {
// //                         foreach (var group in targetGroups)
// //                             await _hub.Clients.Group(group).SendAsync("GeofenceTriggered", payload);
// //                     }
// //                     else
// //                     {
// //                         await _hub.Clients.All.SendAsync("GeofenceTriggered", payload);
// //                     }

// //                     // Send Push Notifications
// //                     await SendWebPushToParticipantsAsync(g, payload, driverId);

// //                     UpdateState(stateKey, true);
// //                 }
// //                 else
// //                 {
// //                     // Already inside, just update state timestamp
// //                     UpdateState(stateKey, true);
// //                 }
// //             }
// //             else
// //             {
// //                 // Currently Outside
// //                 if (last != null && last.IsInside)
// //                 {
// //                     // We were inside, now we are outside -> EXIT event
// //                     var evt = new GeofenceEvent
// //                     {
// //                         GeofenceId = g.GeofenceId,
// //                         DriverId = driverId,
// //                         EventType = "EXIT",
// //                         DistanceMeters = distanceMeters,
// //                         EventAt = DateTime.UtcNow
// //                     };
// //                     _db.geofenceEvents.Add(evt);
// //                     await _db.SaveChangesAsync();

// //                     var payload = new
// //                     {
// //                         geofenceId = g.GeofenceId,
// //                         name = g.Name,
// //                         @event = "EXIT",
// //                         driverId,
// //                         ownerId = g.OwnerUserId, // Added for frontend filtering
// //                         distanceMeters = Math.Round(distanceMeters, 2),
// //                         radiusMeters = g.RadiusMeters,
// //                         at = evt.EventAt
// //                     };

// //                     if (targetGroups != null)
// //                     {
// //                         foreach (var group in targetGroups)
// //                             await _hub.Clients.Group(group).SendAsync("GeofenceTriggered", payload);
// //                     }
// //                     else
// //                     {
// //                         await _hub.Clients.All.SendAsync("GeofenceTriggered", payload);
// //                     }

// //                      // Send Push Notifications (optional for exit, but good for completeness)
// //                     await SendWebPushToParticipantsAsync(g, payload, driverId);
// //                 }

// //                 UpdateState(stateKey, false);
// //             }
// //         }
// //     }

// //     private async Task SendWebPushToParticipantsAsync(Geofence g, object payload, int currentDriverId)
// //     {
// //         var notifyUserIds = new List<int>();

// //         // 1. Owner (Customer)
// //         if (g.OwnerUserId.HasValue) 
// //             notifyUserIds.Add(g.OwnerUserId.Value);

// //         // 2. Driver associated with the Order?
// //         // If the geofence is linked to an Order, we can fetch the order to find the driver too.
// //         // But we have the currentDriverId who triggered it. We should notify them too?
// //         if (currentDriverId > 0)
// //         {
// //              notifyUserIds.Add(currentDriverId);
// //         }

// //         // 3. If OrderId is present, we could check for other stakeholders (like Seller)
// //         if (g.OrderId.HasValue)
// //         {
// //              // Optional: look up order -> senderId, etc.
// //              // For now, Customer + Driver is the requirement.
// //         }

// //         if (!notifyUserIds.Any()) return;

// //         var distinctIds = notifyUserIds.Distinct().ToList();

// //         var subs = _db.pushSubscriptions
// //             .Where(s => distinctIds.Contains(s.UserId))
// //             .ToList();
        
// //         if (!subs.Any()) return;

// //         // Custom messages for different roles could be handled here, but for now generic:
// //         var jsonPayload = System.Text.Json.JsonSerializer.Serialize(new
// //         {
// //             title = "Ontrack Geofence Alert",
// //             body = $"Driver is nearby! Distance: {Math.Round(((Geofence)g).RadiusMeters)}m",
// //             data = payload
// //         });

// //         foreach (var s in subs)
// //         {
// //             try
// //             {
// //                 var subscription = new WebPush.PushSubscription(s.Endpoint, s.P256DH, s.Auth);
// //                 await _webPushClient.SendNotificationAsync(subscription, jsonPayload, _vapidDetails);
// //             }
// //             catch (WebPushException wex)
// //             {
// //                 if (wex.StatusCode == System.Net.HttpStatusCode.Gone ||
// //                     wex.StatusCode == System.Net.HttpStatusCode.NotFound)
// //                 {
// //                     _db.pushSubscriptions.Remove(s);
// //                 }
// //             }
// //             catch
// //             {
// //                 // ignore
// //             }
// //         }
// //         await _db.SaveChangesAsync();
// //     }

// //     private void UpdateState(string stateKey, bool isInside)
// //     {
// //         var state = new GeofenceState { IsInside = isInside, LastEventAt = DateTime.UtcNow };
// //         _cache.Set(stateKey, state, TimeSpan.FromHours(24));
// //     }

// //     private class GeofenceState { public bool IsInside { get; set; } public DateTime LastEventAt { get; set; } }
// //         private double HaversineDistanceMeters(double lat1, double lon1, double lat2, double lon2)
// //     {
// //         const double R = 6371000; 
// //         double dLat = ToRad(lat2 - lat1);
// //         double dLon = ToRad(lon2 - lon1);
// //         double rlat1 = ToRad(lat1);
// //         double rlat2 = ToRad(lat2);

// //         double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
// //                    Math.Cos(rlat1) * Math.Cos(rlat2) *
// //                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

// //         double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
// //         return R * c;
// //     }

// //     private double ToRad(double deg) => deg * (Math.PI / 180.0);
// // }


// namespace Backend.Services;

// // Services/GeofenceService.cs
// using Microsoft.AspNetCore.SignalR;
// using Microsoft.Extensions.Caching.Memory;
// using WebPush;
// using Backend.Domain.Entity;
// using Backend.Data;
// using Microsoft.EntityFrameworkCore;

// public class GeofenceService
// {
//     private readonly AppDbContext _db;
//     private readonly IHubContext<GeofenceHub> _hub;
//     private readonly IMemoryCache _cache;
//     private readonly WebPushClient _webPushClient;
//     private readonly VapidDetails _vapidDetails;

//     private readonly TimeSpan _repeatCooldown = TimeSpan.FromSeconds(5);

//     public GeofenceService(
//         AppDbContext db,
//         IHubContext<GeofenceHub> hub,
//         IMemoryCache cache,
//         IConfiguration config)
//     {
//         _db = db;
//         _hub = hub;
//         _cache = cache;
//         _webPushClient = new WebPushClient();

//         var publicKey = config["Vapid:PublicKey"] ?? throw new ArgumentNullException("Vapid:PublicKey");
//         var privateKey = config["Vapid:PrivateKey"] ?? throw new ArgumentNullException("Vapid:PrivateKey");
//         var subject = config["Vapid:Subject"] ?? "mailto:admin@example.com";

//         _vapidDetails = new VapidDetails(subject, publicKey, privateKey);
//     }

//     public async Task CreateGeofenceForOrderAsync(Order order)
//     {
//         var geofence = new Geofence
//         {
//             Name = $"Order-{order.Id}-{order.ReceiverName}",
//             CenterLat = order.DeliveryLatitude,
//             CenterLon = order.DeliveryLongitude,
//             RadiusMeters = 1000,
//             OrderId = order.Id,
//             OwnerUserId = order.CustomerId,
//             IsActive = true,
//             CreatedAt = DateTime.UtcNow
//         };

//         _db.Geofences.Add(geofence);
//         await _db.SaveChangesAsync();
//     }

//     public async Task CheckAndNotifyAsync(
//         int driverId,
//         double driverLat,
//         double driverLon,
//         IEnumerable<string>? targetGroups = null)
//     {
//         var driver = await _db.Users.FindAsync(driverId);
//         if (driver != null)
//         {
//             driver.CurrentLatitude = driverLat;
//             driver.CurrentLongitude = driverLon;
//             await _db.SaveChangesAsync();
//         }

//         var geofences = await _db.Geofences
//             .Where(g => g.IsActive)
//             .ToListAsync();

//         foreach (var g in geofences)
//         {
//             var distanceMeters = HaversineDistanceMeters(
//                 driverLat, driverLon, g.CenterLat, g.CenterLon);

//             bool isInside = distanceMeters <= g.RadiusMeters;
//             string stateKey = $"geofence_state:{g.GeofenceId}:driver:{driverId}";
//             var last = _cache.Get<GeofenceState>(stateKey);

//             if (isInside)
//             {
//                 if (last == null || !last.IsInside)
//                 {
//                     if (last != null &&
//                         (DateTime.UtcNow - last.LastEventAt) < _repeatCooldown)
//                     {
//                         UpdateState(stateKey, true);
//                         continue;
//                     }

//                     var evt = new GeofenceEvent
//                     {
//                         GeofenceId = g.GeofenceId,
//                         DriverId = driverId,
//                         EventType = "ENTER",
//                         DistanceMeters = distanceMeters,
//                         EventAt = DateTime.UtcNow
//                     };

//                     _db.GeofenceEvents.Add(evt);
//                     await _db.SaveChangesAsync();

//                     var payload = BuildPayload(g, evt, driverId);
//                     await BroadcastAsync(payload, targetGroups);
//                     await SendWebPushToParticipantsAsync(g, payload, driverId);

//                     UpdateState(stateKey, true);
//                 }
//                 else
//                 {
//                     UpdateState(stateKey, true);
//                 }
//             }
//             else
//             {
//                 if (last != null && last.IsInside)
//                 {
//                     var evt = new GeofenceEvent
//                     {
//                         GeofenceId = g.GeofenceId,
//                         DriverId = driverId,
//                         EventType = "EXIT",
//                         DistanceMeters = distanceMeters,
//                         EventAt = DateTime.UtcNow
//                     };

//                     _db.GeofenceEvents.Add(evt);
//                     await _db.SaveChangesAsync();

//                     var payload = BuildPayload(g, evt, driverId);
//                     await BroadcastAsync(payload, targetGroups);
//                     await SendWebPushToParticipantsAsync(g, payload, driverId);
//                 }

//                 UpdateState(stateKey, false);
//             }
//         }
//     }

//     private async Task BroadcastAsync(object payload, IEnumerable<string>? groups)
//     {
//         if (groups != null)
//         {
//             foreach (var g in groups)
//                 await _hub.Clients.Group(g)
//                     .SendAsync("GeofenceTriggered", payload);
//         }
//         else
//         {
//             await _hub.Clients.All
//                 .SendAsync("GeofenceTriggered", payload);
//         }
//     }

//     private async Task SendWebPushToParticipantsAsync(
//         Geofence g,
//         object payload,
//         int driverId)
//     {
//         var userIds = new List<int>();

//         if (g.OwnerUserId.HasValue)
//             userIds.Add(g.OwnerUserId.Value);

//         userIds.Add(driverId);

//         var subs = await _db.PushSubscriptions
//             .Where(s => userIds.Contains(s.UserId))
//             .ToListAsync();

//         if (!subs.Any()) return;

//         var jsonPayload = System.Text.Json.JsonSerializer.Serialize(new
//         {
//             title = "OnTrack Geofence Alert",
//             body = "Driver is near the delivery location",
//             data = payload
//         });

//         foreach (var s in subs)
//         {
//             try
//             {
//                 var sub = new PushSubscription(
//                     s.Endpoint, s.P256DH, s.Auth);

//                 await _webPushClient.SendNotificationAsync(
//                     sub, jsonPayload, _vapidDetails);
//             }
//             catch (WebPushException ex) when (
//                 ex.StatusCode == System.Net.HttpStatusCode.Gone ||
//                 ex.StatusCode == System.Net.HttpStatusCode.NotFound)
//             {
//                 _db.PushSubscriptions.Remove(s);
//             }
//         }

//         await _db.SaveChangesAsync();
//     }

//     private object BuildPayload(Geofence g, GeofenceEvent evt, int driverId) => new
//     {
//         geofenceId = g.GeofenceId,
//         name = g.Name,
//         @event = evt.EventType,
//         driverId,
//         ownerId = g.OwnerUserId,
//         distanceMeters = Math.Round(evt.DistanceMeters, 2),
//         radiusMeters = g.RadiusMeters,
//         at = evt.EventAt
//     };

//     private void UpdateState(string key, bool inside)
//     {
//         _cache.Set(key, new GeofenceState
//         {
//             IsInside = inside,
//             LastEventAt = DateTime.UtcNow
//         }, TimeSpan.FromHours(24));
//     }

//     private class GeofenceState
//     {
//         public bool IsInside { get; set; }
//         public DateTime LastEventAt { get; set; }
//     }

//     private double HaversineDistanceMeters(
//         double lat1, double lon1, double lat2, double lon2)
//     {
//         const double R = 6371000;
//         double dLat = ToRad(lat2 - lat1);
//         double dLon = ToRad(lon2 - lon1);

//         double a =
//             Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
//             Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) *
//             Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

//         return R * (2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a)));
//     }

//     private double ToRad(double d) => d * Math.PI / 180.0;
// }


namespace Backend.Services;

// Services/GeofenceService.cs
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;
using WebPush;
using Backend.Domain.Entity;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

public class GeofenceService
{
    private readonly AppDbContext _db;
    private readonly IHubContext<GeofenceHub> _hub;
    private readonly IMemoryCache _cache;
    private readonly WebPushClient _webPushClient;
    private readonly VapidDetails _vapidDetails;

    private readonly TimeSpan _repeatCooldown = TimeSpan.FromSeconds(5);

    public GeofenceService(
        AppDbContext db,
        IHubContext<GeofenceHub> hub,
        IMemoryCache cache,
        IConfiguration config)
    {
        _db = db;
        _hub = hub;
        _cache = cache;
        _webPushClient = new WebPushClient();

        var publicKey = config["Vapid:PublicKey"] ?? throw new ArgumentNullException("Vapid:PublicKey");
        var privateKey = config["Vapid:PrivateKey"] ?? throw new ArgumentNullException("Vapid:PrivateKey");
        var subject = config["Vapid:Subject"] ?? "mailto:admin@example.com";

        _vapidDetails = new VapidDetails(subject, publicKey, privateKey);
    }

    // THIS IS THE METHOD THAT WAS "MISSING" - Make sure it's public
    public async Task CreateGeofenceForOrderAsync(Order order)
    {
        var geofence = new Geofence
        {
            Name = $"Order-{order.Id}-{order.ReceiverName}",
            CenterLat = order.DeliveryLatitude,
            CenterLon = order.DeliveryLongitude,
            RadiusMeters = 1000,
            OrderId = order.Id,
            OwnerUserId = order.CustomerId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.Geofences.Add(geofence);
        await _db.SaveChangesAsync();
    }

    public async Task CheckAndNotifyAsync(
        int driverId,
        double driverLat,
        double driverLon,
        IEnumerable<string>? targetGroups = null)
    {
        var driver = await _db.Users.FindAsync(driverId);
        if (driver != null)
        {
            driver.CurrentLatitude = driverLat;
            driver.CurrentLongitude = driverLon;
            await _db.SaveChangesAsync();
        }

        var geofences = await _db.Geofences
            .Where(g => g.IsActive)
            .ToListAsync();

        foreach (var g in geofences)
        {
            var distanceMeters = HaversineDistanceMeters(
                driverLat, driverLon, g.CenterLat, g.CenterLon);

            bool isInside = distanceMeters <= g.RadiusMeters;
            string stateKey = $"geofence_state:{g.GeofenceId}:driver:{driverId}";
            var last = _cache.Get<GeofenceState>(stateKey);

            if (isInside)
            {
                if (last == null || !last.IsInside)
                {
                    if (last != null &&
                        (DateTime.UtcNow - last.LastEventAt) < _repeatCooldown)
                    {
                        UpdateState(stateKey, true);
                        continue;
                    }

                    var evt = new GeofenceEvent
                    {
                        GeofenceId = g.GeofenceId,
                        DriverId = driverId,
                        EventType = "ENTER",
                        DistanceMeters = distanceMeters,
                        EventAt = DateTime.UtcNow
                    };

                    _db.GeofenceEvents.Add(evt);
                    await _db.SaveChangesAsync();

                    var payload = BuildPayload(g, evt, driverId);
                    await BroadcastAsync(payload, targetGroups);
                    await SendWebPushToParticipantsAsync(g, payload, driverId);

                    UpdateState(stateKey, true);
                }
                else
                {
                    UpdateState(stateKey, true);
                }
            }
            else
            {
                if (last != null && last.IsInside)
                {
                    var evt = new GeofenceEvent
                    {
                        GeofenceId = g.GeofenceId,
                        DriverId = driverId,
                        EventType = "EXIT",
                        DistanceMeters = distanceMeters,
                        EventAt = DateTime.UtcNow
                    };

                    _db.GeofenceEvents.Add(evt);
                    await _db.SaveChangesAsync();

                    var payload = BuildPayload(g, evt, driverId);
                    await BroadcastAsync(payload, targetGroups);
                    await SendWebPushToParticipantsAsync(g, payload, driverId);
                }

                UpdateState(stateKey, false);
            }
        }
    }

    private async Task BroadcastAsync(object payload, IEnumerable<string>? groups)
    {
        if (groups != null)
        {
            foreach (var g in groups)
                await _hub.Clients.Group(g)
                    .SendAsync("GeofenceTriggered", payload);
        }
        else
        {
            await _hub.Clients.All
                .SendAsync("GeofenceTriggered", payload);
        }
    }

    private async Task SendWebPushToParticipantsAsync(
        Geofence g,
        object payload,
        int driverId)
    {
        var userIds = new List<int>();

        if (g.OwnerUserId.HasValue)
            userIds.Add(g.OwnerUserId.Value);

        userIds.Add(driverId);

        var subs = await _db.PushSubscriptions
            .Where(s => userIds.Contains(s.UserId))
            .ToListAsync();

        if (!subs.Any()) return;

        var jsonPayload = System.Text.Json.JsonSerializer.Serialize(new
        {
            title = "OnTrack Geofence Alert",
            body = "Driver is near the delivery location",
            data = payload
        });

        foreach (var s in subs)
        {
            try
            {
                var sub = new PushSubscription(
                    s.Endpoint, s.P256DH, s.Auth);

                await _webPushClient.SendNotificationAsync(
                    sub, jsonPayload, _vapidDetails);
            }
            catch (WebPushException ex) when (
                ex.StatusCode == System.Net.HttpStatusCode.Gone ||
                ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                _db.PushSubscriptions.Remove(s);
            }
        }

        await _db.SaveChangesAsync();
    }

    private object BuildPayload(Geofence g, GeofenceEvent evt, int driverId) => new
    {
        geofenceId = g.GeofenceId,
        name = g.Name,
        @event = evt.EventType,
        driverId,
        ownerId = g.OwnerUserId,
        distanceMeters = Math.Round(evt.DistanceMeters, 2),
        radiusMeters = g.RadiusMeters,
        at = evt.EventAt
    };

    private void UpdateState(string key, bool inside)
    {
        _cache.Set(key, new GeofenceState
        {
            IsInside = inside,
            LastEventAt = DateTime.UtcNow
        }, TimeSpan.FromHours(24));
    }

    private class GeofenceState
    {
        public bool IsInside { get; set; }
        public DateTime LastEventAt { get; set; }
    }

    private double HaversineDistanceMeters(
        double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371000;
        double dLat = ToRad(lat2 - lat1);
        double dLon = ToRad(lon2 - lon1);

        double a =
            Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
            Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) *
            Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        return R * (2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a)));
    }

    private double ToRad(double d) => d * Math.PI / 180.0;
}