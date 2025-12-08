using Microsoft.AspNetCore.SignalR;

namespace Backend.Hubs
{
    public class LogisticsHub : Hub
    {
        public async Task SendDriverLocation(int driverId, double lat, double lng)
        {
            await Clients.Group("Admins").SendAsync("ReceiveDriverLocation", driverId, lat, lng);
            await Clients.Group($"Driver_{driverId}_Tracking").SendAsync("ReceiveDriverLocation", driverId, lat, lng);
        }

        public async Task JoinAdminGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        }

        public async Task JoinDriverTrackingGroup(int driverId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Driver_{driverId}_Tracking");
        }

        public async Task SendRouteUpdate(int driverId, object routeData)
        {
            await Clients.Group($"Driver_{driverId}").SendAsync("ReceiveRouteUpdate", routeData);
        }
    }
}
