using Backend.Data;
using Backend.Domain.Entity;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Endpoints
{
    public static class NotificationEndpoints
    {
        public static RouteGroupBuilder MapNotificationEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/notifications").RequireAuthorization().WithTags("Notifications");

            group.MapGet("/", async (ClaimsPrincipal user, NotificationService service) =>
            {
                var userIdStr = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                    return Results.Unauthorized();

                var notifications = await service.GetUserNotificationsAsync(userId);
                return Results.Ok(notifications);
            });

            group.MapPost("/{id}/read", async (int id, NotificationService service) =>
            {
                await service.MarkAsReadAsync(id);
                return Results.Ok();
            });

            group.MapPost("/read-all", async (ClaimsPrincipal user, NotificationService service) =>
            {
                var userIdStr = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                    return Results.Unauthorized();

                await service.MarkAllAsReadAsync(userId);
                return Results.Ok();
            });

            return group;
        }
    }
}
