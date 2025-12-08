// // // using Microsoft.AspNetCore.SignalR;

// // // namespace Backend.Hubs
// // // {
// // //     public class LogisticsHub : Hub
// // //     {
// // //         public async Task SendDriverLocation(int driverId, double lat, double lng)
// // //         {
// // //             await Clients.Group("Admins").SendAsync("ReceiveDriverLocation", driverId, lat, lng);
// // //             await Clients.Group($"Driver_{driverId}_Tracking").SendAsync("ReceiveDriverLocation", driverId, lat, lng);
// // //         }

// // //         public async Task JoinAdminGroup()
// // //         {
// // //             await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
// // //         }

// // //         public async Task JoinDriverTrackingGroup(int driverId)
// // //         {
// // //             await Groups.AddToGroupAsync(Context.ConnectionId, $"Driver_{driverId}_Tracking");
// // //         }

// // //         public async Task SendRouteUpdate(int driverId, object routeData)
// // //         {
// // //             await Clients.Group($"Driver_{driverId}").SendAsync("ReceiveRouteUpdate", routeData);
// // //         }
// // //     }
// // // }


// // using Microsoft.AspNetCore.SignalR;
// // using Backend.Data;
// // using Microsoft.EntityFrameworkCore;

// // namespace Backend.Hubs
// // {
// //     public class LogisticsHub : Hub
// //     {
// //         private readonly AppDbContext _context;

// //         public LogisticsHub(AppDbContext context)
// //         {
// //             _context = context;
// //         }

// //         // CUSTOMER JOINS ORDER-GROUP FOR LIVE TRACKING
// //         public async Task JoinOrderGroup(int orderId)
// //         {
// //             await Groups.AddToGroupAsync(Context.ConnectionId, $"Order_{orderId}");
// //         }

// //         // // DRIVER JOINS THEIR GROUP
// //         // public async Task JoinDriverGroup(int driverId)
// //         // {
// //         //     await Groups.AddToGroupAsync(Context.ConnectionId, $"Driver_{driverId}");
// //         // }

// //         // Driver joins route update group
// //         public async Task JoinDriverRouteGroup(int driverId)
// //         {
// //             await Groups.AddToGroupAsync(Context.ConnectionId, $"Driver_{driverId}_Route");
// //         }

// //         // Broadcast route update to driver
// //         public async Task SendRouteUpdate(int driverId, object routeData)
// //         {
// //             await Clients.Group($"Driver_{driverId}_Route")
// //                 .SendAsync("ReceiveRouteUpdate", routeData);
// //         }

// //         // ADMIN GROUP
// //         public async Task JoinAdminGroup()
// //         {
// //             await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
// //         }

// //         // DRIVER LOCATION UPDATE
// //         public async Task SendDriverLocation(int driverId, double lat, double lng)
// //         {
// //             // 1. Send to Admin Dashboard
// //             await Clients.Group("Admins").SendAsync("ReceiveDriverLocation", driverId, lat, lng);

// //             // 2. Send to Driver-Specific Tracking Group
// //             await Clients.Group($"Driver_{driverId}_Tracking")
// //                 .SendAsync("ReceiveDriverLocation", driverId, lat, lng);

// //             // 3. Send to all orders assigned to this driver
// //             var orderIds = await _context.Orders
// //                 .Where(o => o.DriverId == driverId)
// //                 .Select(o => o.Id)
// //                 .ToListAsync();

// //             foreach (var orderId in orderIds)
// //             {
// //                 await Clients.Group($"Order_{orderId}")
// //                     .SendAsync("ReceiveDriverLocation", new
// //                     {
// //                         latitude = lat,
// //                         longitude = lng,
// //                         updatedAt = DateTime.UtcNow
// //                     });
// //             }
// //         }
// //     }
// // }

// using Microsoft.AspNetCore.SignalR;
// using Backend.Data;
// using Microsoft.EntityFrameworkCore;

// namespace Backend.Hubs
// {
//     public class LogisticsHub : Hub
//     {
//         private readonly AppDbContext _context;

//         public LogisticsHub(AppDbContext context)
//         {
//             _context = context;
//         }

//         // ------------------------------
//         // CUSTOMER JOINS ORDER TRACKING
//         // ------------------------------
//         public async Task JoinOrderGroup(int orderId)
//         {
//             await Groups.AddToGroupAsync(Context.ConnectionId, $"Order_{orderId}");
//         }

//         // ------------------------------
//         // DRIVER JOINS ROUTE GROUP
//         // ------------------------------
//         public async Task JoinDriverRouteGroup(int driverId)
//         {
//             Console.WriteLine($"Driver connected to route group: {driverId}");
//             await Groups.AddToGroupAsync(Context.ConnectionId, $"Driver_{driverId}_Route");
//         }

//         // ------------------------------
//         // SEND ROUTE UPDATE TO DRIVER
//         // ------------------------------
//         public async Task SendRouteUpdate(int driverId, object routeData)
//         {
//             await Clients.Group($"Driver_{driverId}_Route")
//                 .SendAsync("ReceiveRouteUpdate", routeData);
//         }

//         // ------------------------------
//         // ADMIN GROUP
//         // ------------------------------
//         public async Task JoinAdminGroup()
//         {
//             await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
//         }

//         // ------------------------------
//         // DRIVER LOCATION BROADCASTING
//         // ------------------------------
//         public async Task SendDriverLocation(int driverId, double lat, double lng)
//         {
//             // 1. Admin Dashboard
//             await Clients.Group("Admins")
//                 .SendAsync("ReceiveDriverLocation", driverId, lat, lng);

//             // 2. Driver Tracking Group
//             await Clients.Group($"Driver_{driverId}_Tracking")
//                 .SendAsync("ReceiveDriverLocation", driverId, lat, lng);

//             // 3. Customers following this order
//             var orderIds = await _context.Orders
//                 .Where(o => o.DriverId == driverId)
//                 .Select(o => o.Id)
//                 .ToListAsync();

//             foreach (var orderId in orderIds)
//             {
//                 await Clients.Group($"Order_{orderId}")
//                     .SendAsync("ReceiveDriverLocation", new
//                     {
//                         latitude = lat,
//                         longitude = lng,
//                         updatedAt = DateTime.UtcNow
//                     });
//             }
//         }
//     }
// }

using Microsoft.AspNetCore.SignalR;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Hubs
{
    public class LogisticsHub : Hub
    {
        private readonly AppDbContext _context;

        public LogisticsHub(AppDbContext context)
        {
            _context = context;
        }

        // CUSTOMER JOINS ORDER GROUP
        public async Task JoinOrderGroup(int orderId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Order_{orderId}");
        }

        // DRIVER JOINS ROUTE GROUP
        public async Task JoinDriverRouteGroup(int driverId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Driver_{driverId}_Route");
        }

        // BROADCAST ROUTE UPDATES
        public async Task SendRouteUpdate(int driverId, object routeData)
        {
            await Clients.Group($"Driver_{driverId}_Route")
                .SendAsync("ReceiveRouteUpdate", routeData);
        }

        // ADMIN JOINS GROUP
        public async Task JoinAdminGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        }

        // DRIVER LOCATION BROADCAST
        public async Task SendDriverLocation(int driverId, double lat, double lng)
        {
            // Admin dashboard
            await Clients.Group("Admins")
                .SendAsync("ReceiveDriverLocation", driverId, lat, lng);

            // Orders assigned to driver
            var orderIds = await _context.Orders
                .Where(o => o.DriverId == driverId)
                .Select(o => o.Id)
                .ToListAsync();

            foreach (var id in orderIds)
            {
                await Clients.Group($"Order_{id}")
                    .SendAsync("ReceiveDriverLocation", new
                    {
                        latitude = lat,
                        longitude = lng,
                        updatedAt = DateTime.UtcNow
                    });
            }
        }
    }
}

