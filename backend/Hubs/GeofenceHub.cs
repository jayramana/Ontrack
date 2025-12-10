using Microsoft.AspNetCore.SignalR;

public class GeofenceHub : Hub
{
    public Task JoinGroup(string groupName) => Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    public Task LeaveGroup(string groupName) => Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
}
