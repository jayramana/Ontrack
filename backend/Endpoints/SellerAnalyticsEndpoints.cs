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

        group.MapGet("/", async (HttpContext http, AppDbContext context, int days = 7) =>
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

            // --- FILTERED DATA (Based on 'days' param) ---
            var startDate = DateTime.UtcNow.Date.AddDays(-days + 1); // e.g., if days=7, include today + previous 6 days
            var today = DateTime.UtcNow.Date;

            // 1. Revenue Chart
            var revenueChart = orders
                .Where(o => o.CreatedAt.Date >= startDate && o.CreatedAt.Date <= today)
                .GroupBy(o => o.CreatedAt.Date)
                .Select(g => new 
                { 
                    Date = g.Key.ToString("yyyy-MM-dd"), 
                    Amount = g.Sum(o => o.Price) 
                })
                .OrderBy(x => x.Date)
                .ToList();

            var fullRevenueChart = new List<object>();
            for (int i = 0; i < days; i++)
            {
                var date = startDate.AddDays(i).ToString("yyyy-MM-dd");
                var existing = revenueChart.FirstOrDefault(r => r.Date == date);
                fullRevenueChart.Add(new 
                { 
                    date, 
                    amount = existing != null ? existing.Amount : 0 
                });
            }

            // 2. Status Distribution (Filtered)
            var statusDistribution = orders
                .Where(o => o.CreatedAt.Date >= startDate && o.CreatedAt.Date <= today)
                .GroupBy(o => o.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToList();

            // 3. Delivered vs Not Delivered (Daily Breakdown - Filtered)
            var deliveryStatsRaw = orders
                .Where(o => o.CreatedAt.Date >= startDate && o.CreatedAt.Date <= today)
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

            for (int i = 0; i < days; i++)
            {
                var targetDate = startDate.AddDays(i);
                var existing = deliveryStatsRaw.FirstOrDefault(x => x.Date == targetDate);

                deliveryVsNotDeliveredChart.Add(new
                {
                    day = targetDate.ToString("MM/dd"), // e.g. 12/25
                    delivered = existing?.Delivered ?? 0,
                    notDelivered = existing?.NotDelivered ?? 0
                });
            }

            return Results.Ok(new
            {
                totalOrders, // Global stats (all time)
                totalRevenue,
                pendingOrders = pendingCount,
                deliveredOrders = deliveredCount,
                cancelledOrders = cancelledCount,
                
                // Charts (Filtered)
                revenueChart = fullRevenueChart,
                statusDistribution,
                deliveryVsAttemptedChart = deliveryVsNotDeliveredChart
            });

        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "seller" });
    }
}
