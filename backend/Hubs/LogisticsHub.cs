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

        // DRIVER JOINS ROUTE GROUP (route updates)
        public async Task JoinDriverRouteGroup(int driverId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Driver_{driverId}_Route");
        }

        // DRIVER JOINS NOTIFICATION GROUP (reschedule, etc.)
        public async Task JoinDriverGroup(int driverId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Driver_{driverId}");
        }

        // BROADCAST ROUTE UPDATES TO ONE DRIVER
        public async Task SendRouteUpdate(int driverId, object routeData)
        {
            await Clients.Group($"Driver_{driverId}_Route")
                .SendAsync("ReceiveRouteUpdate", routeData);
        }

        // ORDER RESCHEDULED NOTIFICATION TO ONE DRIVER
        public async Task NotifyOrderRescheduled(int driverId, object rescheduleData)
        {
            await Clients.Group($"Driver_{driverId}")
                .SendAsync("OrderRescheduled", rescheduleData);
        }

        // ADMIN JOINS GROUP
        public async Task JoinAdminGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        }

        // ROAD ISSUE REPORTED → ADMINS
        public async Task NotifyRoadIssue(object issueData)
        {
            await Clients.Group("Admins")
                .SendAsync("RoadIssueReported", issueData);
        }

        // DRIVER LOCATION BROADCAST (Admins + Customers tracking)
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

