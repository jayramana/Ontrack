using Backend.Data;
using Backend.Domain.Entity;
using Backend.DTOs;
using Backend.Hubs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Endpoints
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoadIssueController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<LogisticsHub> _hubContext;
        private readonly DriverRouteOptimizationService _routeService;

        public RoadIssueController(
            AppDbContext context,
            IHubContext<LogisticsHub> hubContext,
            DriverRouteOptimizationService routeService)
        {
            _context = context;
            _hubContext = hubContext;
            _routeService = routeService;
        }

        // 🆕 FEATURE 3: REPORT ROAD ISSUE
        [HttpPost("report")]
        [Authorize(Roles = "Driver")]
        public async Task<IActionResult> ReportIssue([FromBody] ReportIssueDto dto)
        {
            try
            {
                // Get driver ID from token
                var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
                int driverId = int.Parse(userIdClaim?.Value ?? "0");

                var driver = await _context.Users.FindAsync(driverId);
                if (driver == null || driver.Role != "Driver")
                    return Unauthorized(new { message = "Invalid driver" });

                // Create road issue
                var roadIssue = new RoadIssue
                {
                    DriverId = driverId,
                    IssueType = dto.IssueType,
                    Description = dto.Description,
                    Latitude = dto.Latitude,
                    Longitude = dto.Longitude,
                    ReportedAt = DateTime.UtcNow,
                    Status = "Active",
                    Severity = "Medium"
                };

                _context.RoadIssues.Add(roadIssue);
                await _context.SaveChangesAsync();

                // 🔥 NOTIFY ADMINS VIA SIGNALR
                await _hubContext.Clients
                    .Group("Admins")
                    .SendAsync("RoadIssueReported", new
                    {
                        issueId = roadIssue.Id,
                        driverId = roadIssue.DriverId,
                        driverName = driver.Name,
                        issueType = roadIssue.IssueType,
                        description = roadIssue.Description,
                        latitude = roadIssue.Latitude,
                        longitude = roadIssue.Longitude,
                        reportedAt = roadIssue.ReportedAt,
                        severity = roadIssue.Severity
                    });

                // 🔥 RE-OPTIMIZE AFFECTED DRIVERS
                // Get all drivers in the area (within 10km radius)
                var affectedDrivers = await GetDriversNearIssue(dto.Latitude, dto.Longitude, 10.0);

                foreach (var affectedDriverId in affectedDrivers)
                {
                    await _routeService.RecalculateDriverRouteAsync(affectedDriverId);
                    
                    // Push updated route
                    var optimizedRoute = await _routeService.GenerateRouteForDriver(affectedDriverId);
                    await _hubContext.Clients
                        .Group($"Driver_{affectedDriverId}_Route")
                        .SendAsync("ReceiveRouteUpdate", optimizedRoute);
                }

                return Ok(new
                {
                    message = "Road issue reported successfully",
                    issueId = roadIssue.Id,
                    affectedDrivers = affectedDrivers.Count
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = "Failed to report issue",
                    error = ex.Message
                });
            }
        }

        // GET ALL ROAD ISSUES (Admin)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllIssues()
        {
            var issues = await _context.RoadIssues
                .Include(r => r.Driver)
                .OrderByDescending(r => r.ReportedAt)
                .Select(r => new
                {
                    r.Id,
                    r.IssueType,
                    r.Description,
                    r.Latitude,
                    r.Longitude,
                    r.ReportedAt,
                    r.Status,
                    r.Severity,
                    isResolved = r.Status == "Resolved",
                    driver = new
                    {
                        r.Driver.Id,
                        r.Driver.Name,
                        r.Driver.Email
                    }
                })
                .ToListAsync();

            return Ok(issues);
        }

        // GET UNRESOLVED ISSUES (Admin)
        [HttpGet("unresolved")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUnresolvedIssues()
        {
            var issues = await _context.RoadIssues
                .Include(r => r.Driver)
                .Where(r => r.Status == "Active")
                .OrderByDescending(r => r.ReportedAt)
                .Select(r => new
                {
                    r.Id,
                    r.IssueType,
                    r.Description,
                    r.Latitude,
                    r.Longitude,
                    r.ReportedAt,
                    r.Severity,
                    driver = new
                    {
                        r.Driver.Id,
                        r.Driver.Name
                    }
                })
                .ToListAsync();

            return Ok(issues);
        }

        // MARK ISSUE AS RESOLVED (Admin)
        [HttpPost("{id}/resolve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ResolveIssue(int id)
        {
            var issue = await _context.RoadIssues.FindAsync(id);
            if (issue == null)
                return NotFound(new { message = "Issue not found" });

            issue.Status = "Resolved";

            await _context.SaveChangesAsync();

            return Ok(new { message = "Issue marked as resolved" });
        }

        // HELPER: Find drivers near issue location
        private async Task<List<int>> GetDriversNearIssue(double lat, double lng, double radiusKm)
        {
            var activeDrivers = await _context.Orders
                .Where(o => o.DriverId.HasValue && o.Status != "Delivered" && o.Status != "Cancelled")
                .Select(o => o.DriverId!.Value)
                .Distinct()
                .ToListAsync();

            var nearbyDrivers = new List<int>();

            foreach (var driverId in activeDrivers)
            {
                var driver = await _context.Users.FindAsync(driverId);
                if (driver != null && driver.CurrentLatitude.HasValue && driver.CurrentLongitude.HasValue)
                {
                    double distance = CalculateDistance(
                        lat, lng,
                        driver.CurrentLatitude.Value,
                        driver.CurrentLongitude.Value
                    );

                    if (distance <= radiusKm)
                        nearbyDrivers.Add(driverId);
                }
            }

            return nearbyDrivers;
        }

        // Haversine distance formula
        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371; // Earth radius in km

            var dLat = DegreesToRadians(lat2 - lat1);
            var dLon = DegreesToRadians(lon2 - lon1);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return R * c;
        }

        private double DegreesToRadians(double degrees)
        {
            return degrees * Math.PI / 180.0;
        }
    }
}