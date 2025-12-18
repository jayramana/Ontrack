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

            var orders = await context.Orders
                .Where(o => o.SenderId == userId)
                .Select(o => new { o.Id, o.Price, o.Status, o.CreatedAt })
                .ToListAsync();

            var totalOrders = orders.Count;
            var totalRevenue = orders.Sum(o => o.Price);
            
            var deliveredCount = orders.Count(o => o.Status == "Delivered");
            var pendingCount = orders.Count(o => o.Status != "Delivered" && o.Status != "Cancelled");
            var cancelledCount = orders.Count(o => o.Status == "Cancelled");

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
var today = DateTime.UtcNow.Date;
var sevenDaysStart = today.AddDays(-6);
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

            var statusDistribution = orders
                .Where(o => o.CreatedAt.Date >= sevenDaysStart && o.CreatedAt.Date <= today)
                .GroupBy(o => o.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToList();

            // 4. Delivered vs Attempted (Bar Chart - Last 7 Days)
            // 4. Delivered vs Attempted (Bar Chart - Last 7 Days)
// 4. Delivered vs Not Delivered (Last 7 Days)



var deliveryStatsRaw = orders
    .Where(o => o.CreatedAt.Date >= sevenDaysStart && o.CreatedAt.Date <= today)
    .GroupBy(o => o.CreatedAt.Date)
    .Select(g => new
    {
        Date = g.Key,
        Delivered = g.Count(x =>
            x.Status.Trim().Equals("Delivered", StringComparison.OrdinalIgnoreCase)
        ),
        NotDelivered = g.Count(x =>
            !x.Status.Trim().Equals("Delivered", StringComparison.OrdinalIgnoreCase) &&
            !x.Status.Trim().Equals("Cancelled", StringComparison.OrdinalIgnoreCase)
        )
    })
    .ToList();

var deliveryVsNotDeliveredChart = new List<object>();

for (int i = 0; i < 7; i++)
{
    var targetDate = sevenDaysStart.AddDays(i);
    var existing = deliveryStatsRaw.FirstOrDefault(x => x.Date == targetDate);

    deliveryVsNotDeliveredChart.Add(new
    {
        day = targetDate.ToString("ddd"), // Mon, Tue, Wed
        delivered = existing?.Delivered ?? 0,
        notDelivered = existing?.NotDelivered ?? 0
    });
}

return Results.Ok(new
{
    totalOrders,
    totalRevenue,
    pendingOrders = pendingCount,
    deliveredOrders = deliveredCount,
    cancelledOrders = cancelledCount,
    revenueChart = fullRevenueChart,
    statusDistribution,
    deliveryVsAttemptedChart = deliveryVsNotDeliveredChart
});

        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "seller" });
    }
}
