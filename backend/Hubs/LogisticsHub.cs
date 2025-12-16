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

//         // CUSTOMER JOINS ORDER GROUP
//         public async Task JoinOrderGroup(int orderId)
//         {
//             await Groups.AddToGroupAsync(Context.ConnectionId, $"Order_{orderId}");
//         }

//         // DRIVER JOINS ROUTE GROUP (route updates)
//         public async Task JoinDriverRouteGroup(int driverId)
//         {
//             await Groups.AddToGroupAsync(Context.ConnectionId, $"Driver_{driverId}_Route");
//         }

//         // DRIVER JOINS NOTIFICATION GROUP (reschedule, etc.)
//         public async Task JoinDriverGroup(int driverId)
//         {
//             await Groups.AddToGroupAsync(Context.ConnectionId, $"Driver_{driverId}");
//         }

//         // BROADCAST ROUTE UPDATES TO ONE DRIVER
//         public async Task SendRouteUpdate(int driverId, object routeData)
//         {
//             await Clients.Group($"Driver_{driverId}_Route")
//                 .SendAsync("ReceiveRouteUpdate", routeData);
//         }

//         // ORDER RESCHEDULED NOTIFICATION TO ONE DRIVER
//         public async Task NotifyOrderRescheduled(int driverId, object rescheduleData)
//         {
//             await Clients.Group($"Driver_{driverId}")
//                 .SendAsync("OrderRescheduled", rescheduleData);
//         }

//         // ADMIN JOINS GROUP
//         public async Task JoinAdminGroup()
//         {
//             await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
//         }

//         // ROAD ISSUE REPORTED → ADMINS
//         public async Task NotifyRoadIssue(object issueData)
//         {
//             await Clients.Group("Admins")
//                 .SendAsync("RoadIssueReported", issueData);
//         }

//         // DRIVER LOCATION BROADCAST (Admins + Customers tracking)
//         public async Task SendDriverLocation(int driverId, double lat, double lng)
//         {
//             // Admin dashboard
//             await Clients.Group("Admins")
//                 .SendAsync("ReceiveDriverLocation", driverId, lat, lng);

//             // Orders assigned to driver
//             var orderIds = await _context.Orders
//                 .Where(o => o.DriverId == driverId)
//                 .Select(o => o.Id)
//                 .ToListAsync();

//             foreach (var id in orderIds)
//             {
//                 await Clients.Group($"Order_{id}")
//                     .SendAsync("ReceiveDriverLocation", new
//                     {
//                         latitude = lat,
//                         longitude = lng,
//                         updatedAt = DateTime.UtcNow
//                     });
//             }
//         }

//         public override async Task OnConnectedAsync()
//         {
//             await base.OnConnectedAsync();
//         }

//         public override async Task OnDisconnectedAsync(Exception? exception)
//         {
//             await base.OnDisconnectedAsync(exception);
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

        // ============================================
        // CUSTOMER GROUPS
        // ============================================
        
        /// <summary>
        /// Customer joins order tracking group
        /// </summary>
        public async Task JoinOrderGroup(int orderId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Order_{orderId}");
        }

        /// <summary>
        /// 🆕 Customer joins their personal group for ASR notifications
        /// </summary>
        public async Task JoinCustomerGroup(int customerId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Customer_{customerId}");
        }

        // ============================================
        // DRIVER GROUPS
        // ============================================
        
        /// <summary>
        /// Driver joins route updates group
        /// </summary>
        public async Task JoinDriverRouteGroup(int driverId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Driver_{driverId}_Route");
        }

        /// <summary>
        /// Driver joins notification group (reschedule, ASR, etc.)
        /// </summary>
        public async Task JoinDriverGroup(int driverId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Driver_{driverId}");
        }

        // ============================================
        // ADMIN GROUPS
        // ============================================
        
        /// <summary>
        /// Admin joins admin group
        /// </summary>
        public async Task JoinAdminGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        }

        // ============================================
        // ROUTE & ORDER UPDATES
        // ============================================
        
        /// <summary>
        /// Broadcast route updates to one driver
        /// </summary>
        public async Task SendRouteUpdate(int driverId, object routeData)
        {
            await Clients.Group($"Driver_{driverId}_Route")
                .SendAsync("ReceiveRouteUpdate", routeData);
        }

        /// <summary>
        /// Order rescheduled notification to driver
        /// </summary>
        public async Task NotifyOrderRescheduled(int driverId, object rescheduleData)
        {
            await Clients.Group($"Driver_{driverId}")
                .SendAsync("OrderRescheduled", rescheduleData);
        }

        // ============================================
        // ROAD ISSUE NOTIFICATIONS
        // ============================================
        
        /// <summary>
        /// Road issue reported → notify admins
        /// </summary>
        public async Task NotifyRoadIssue(object issueData)
        {
            await Clients.Group("Admins")
                .SendAsync("RoadIssueReported", issueData);
        }

        // ============================================
        // DRIVER LOCATION TRACKING
        // ============================================
        
        /// <summary>
        /// Driver location broadcast (Admins + Customers tracking)
        /// </summary>
        public async Task SendDriverLocation(int driverId, double lat, double lng)
        {
            // Admin dashboard
            await Clients.Group("Admins")
                .SendAsync("ReceiveDriverLocation", new
                {
                    driverId,
                    latitude = lat,
                    longitude = lng,
                    updatedAt = DateTime.UtcNow
                });

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
                        driverId,
                        latitude = lat,
                        longitude = lng,
                        updatedAt = DateTime.UtcNow
                    });
            }
        }

        // ============================================
        // 🆕 ASR (ADULT SIGNATURE REQUIRED) EVENTS
        // ============================================
        
        /// <summary>
        /// 🆕 Driver requests ASR verification → notify customer
        /// </summary>
        public async Task NotifyASRRequest(int customerId, object data)
        {
            await Clients.Group($"Customer_{customerId}")
                .SendAsync("ASRVerificationRequested", data);
        }

        /// <summary>
        /// 🆕 Customer uploaded documents → notify driver
        /// </summary>
        public async Task NotifyCustomerDocumentsUploaded(int driverId, object data)
        {
            await Clients.Group($"Driver_{driverId}")
                .SendAsync("CustomerDocumentsUploaded", data);
        }

        /// <summary>
        /// 🆕 ASR verification completed → notify driver, customer, and admin
        /// </summary>
        public async Task NotifyASRVerificationCompleted(int driverId, int customerId, object data)
        {
            // Notify driver
            await Clients.Group($"Driver_{driverId}")
                .SendAsync("ASRVerificationCompleted", data);
            
            // Notify customer
            await Clients.Group($"Customer_{customerId}")
                .SendAsync("ASRVerificationCompleted", data);
            
            // Notify admin
            await Clients.Group("Admins")
                .SendAsync("ASRVerificationCompleted", data);
        }

        /// <summary>
        /// 🆕 Admin overrides ASR verification → notify driver
        /// </summary>
        public async Task NotifyASRAdminOverride(int driverId, object data)
        {
            await Clients.Group($"Driver_{driverId}")
                .SendAsync("ASRAdminOverride", data);
        }

        // ============================================
        // CONNECTION LIFECYCLE
        // ============================================
        
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}
