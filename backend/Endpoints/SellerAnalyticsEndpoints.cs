using Backend.Data;
using Backend.Domain.Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

public static class SellerAnalyticsEndpoints
{
    public static void MapSellerAnalyticsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/seller/analytics").WithTags("Seller Analytics");

        group.MapGet("/", async (HttpContext http, AppDbContext context) =>
        {
            var userIdClaim = http.User.FindFirst("id") ?? http.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Results.Unauthorized();
            }

            // fetch all orders for this sender
            var orders = await context.Orders
                .Where(o => o.SenderId == userId)
                .Select(o => new { o.Id, o.Price, o.Status, o.CreatedAt })
                .ToListAsync();

            // 1. Key Metrics
            var totalOrders = orders.Count;
            var totalRevenue = orders.Sum(o => o.Price);
            
            // Define status categories
            var deliveredCount = orders.Count(o => o.Status == "Delivered");
            var pendingCount = orders.Count(o => o.Status != "Delivered" && o.Status != "Cancelled");
            var cancelledCount = orders.Count(o => o.Status == "Cancelled");

            // 2. Revenue Chart (Last 7 Days)
            var sevenDaysAgo = DateTime.UtcNow.Date.AddDays(-6);
            var revenueChart = orders
                .Where(o => o.CreatedAt >= sevenDaysAgo)
                .GroupBy(o => o.CreatedAt.Date)
                .Select(g => new 
                { 
                    Date = g.Key.ToString("yyyy-MM-dd"), 
                    Amount = g.Sum(o => o.Price) 
                })
                .OrderBy(x => x.Date)
                .ToList();

            // Fill in missing days with 0
            var fullRevenueChart = new List<object>();
            for (int i = 0; i < 7; i++)
            {
                var date = sevenDaysAgo.AddDays(i).ToString("yyyy-MM-dd");
                var existing = revenueChart.FirstOrDefault(r => r.Date == date);
                fullRevenueChart.Add(new 
                { 
                    date, 
                    amount = existing != null ? existing.Amount : 0 
                });
            }

            // 3. Status Distribution (Doughnut Chart)
            var statusDistribution = orders
                .GroupBy(o => o.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToList();

            return Results.Ok(new
            {
                totalOrders,
                totalRevenue,
                pendingOrders = pendingCount,
                deliveredOrders = deliveredCount,
                cancelledOrders = cancelledCount,
                revenueChart = fullRevenueChart,
                statusDistribution
            });
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "seller" });
    }
}
