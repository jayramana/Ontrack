using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Backend.Data;
using Backend.Domain.Entity;
using Backend.Services;
using System.Security.Claims;

namespace Backend.Endpoints
{
    [ApiController]
    [Route("api/[controller]")]
    public class DriverController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly DriverRouteOptimizationService _routeService;

        public DriverController(AppDbContext context, DriverRouteOptimizationService routeService)
        {
            _context = context;
            _routeService = routeService;
        }

        // GET: api/driver/orders/today
        [HttpGet("orders/today")]
        [Authorize(Roles = "Driver")]
        public async Task<IActionResult> GetTodaysOrders()
        {
            var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            var driverId = int.Parse(userIdClaim?.Value ?? "0");

            var orders = await _context.Orders
                .Where(o => o.DriverId == driverId)
                .Where(o => o.Status != "Delivered" && o.Status != "Cancelled")
                .Include(o => o.Sender)
                .Include(o => o.OriginWarehouse)
                .Include(o => o.DestinationWarehouse)
                .Include(o => o.CurrentWarehouse)
                .OrderBy(o => o.Priority)
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/driver/route/optimized
        [HttpGet("route/optimized")]
        [Authorize(Roles = "Driver")]
        public async Task<IActionResult> GetOptimizedRoute()
        {
            var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            var driverId = int.Parse(userIdClaim?.Value ?? "0");

            var optimizedRoute = await _routeService.GetOptimizedRouteForDriver(driverId);
            
            return Ok(optimizedRoute);
        }

        // POST: api/driver/location
        [HttpPost("location")]
        [Authorize(Roles = "Driver")]
        public async Task<IActionResult> UpdateLocation([FromBody] LocationUpdate update)
        {
            var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            var driverId = int.Parse(userIdClaim?.Value ?? "0");

            // Update user's current location
            var driver = await _context.Users.FindAsync(driverId);
            if (driver == null)
                return NotFound();

            driver.CurrentLatitude = update.Latitude;
            driver.CurrentLongitude = update.Longitude;

            // Store in DriverLocations table for history
            var location = new DriverLocation
            {
                DriverId = driverId,
                Latitude = update.Latitude,
                Longitude = update.Longitude,
                Speed = update.Speed,
                Heading = update.Heading,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.DriverLocations.AddAsync(location);
            await _context.SaveChangesAsync();

            // Future: Broadcast location via SignalR to customers tracking their orders

            return Ok(new { message = "Location updated successfully" });
        }

        // POST: api/driver/mark-delivered/{orderId}
        [HttpPost("mark-delivered/{orderId}")]
        [Authorize(Roles = "Driver")]
        public async Task<IActionResult> MarkDelivered(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                return NotFound();

            order.Status = "Delivered";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order marked as delivered" });
        }

        // POST: api/driver/mark-attempted/{orderId}
        [HttpPost("mark-attempted/{orderId}")]
        [Authorize(Roles = "Driver")]
        public async Task<IActionResult> MarkAttempted(int orderId, [FromBody] DeliveryAttempt attempt)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                return NotFound();

            order.Status = "DeliveryAttempted";
            order.DeliveryNotes = $"Attempt failed: {attempt.Reason}. {order.DeliveryNotes}";
            
            // Lower priority for next attempt
            order.Priority = 3;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Delivery attempt recorded" });
        }

        // POST: api/driver/report-issue
        [HttpPost("report-issue")]
        [Authorize(Roles = "Driver")]
        public async Task<IActionResult> ReportIssue([FromBody] IssueReport report)
        {
            var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            var driverId = int.Parse(userIdClaim?.Value ?? "0");

            var issue = new RoadIssue
            {
                DriverId = driverId,
                IssueType = report.IssueType,
                Description = report.Description,
                Latitude = report.Latitude,
                Longitude = report.Longitude,
                ReportedAt = DateTime.UtcNow
            };

            await _context.RoadIssues.AddAsync(issue);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Issue reported successfully", issueId = issue.Id });
        }
    }

    // DTOs
    public class LocationUpdate
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double Speed { get; set; } = 0;
        public double Heading { get; set; } = 0;
    }

    public class DeliveryAttempt
    {
        public string Reason { get; set; } = string.Empty;
    }

    public class IssueReport
    {
        public string IssueType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
