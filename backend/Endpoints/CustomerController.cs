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
    public class CustomerController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly DriverRouteOptimizationService _routeService;

        public CustomerController(AppDbContext context, DriverRouteOptimizationService routeService)
        {
            _context = context;
            _routeService = routeService;
        }

        // GET: api/customer/orders
        [HttpGet("orders")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            var customerId = int.Parse(userIdClaim?.Value ?? "0");

            var orders = await _context.Orders
                .Where(o => o.CustomerId == customerId)
                .Include(o => o.Driver)
                .Include(o => o.OriginWarehouse)
                .Include(o => o.DestinationWarehouse)
                .Include(o => o.CurrentWarehouse)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/customer/track/{orderId}
        [HttpGet("track/{orderId}")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> TrackOrder(int orderId)
        {
            var order = await _context.Orders
                .Where(o => o.Id == orderId)
                .Include(o => o.Driver)
                .Include(o => o.OriginWarehouse)
                .Include(o => o.DestinationWarehouse)
                .Include(o => o.CurrentWarehouse)
                .FirstOrDefaultAsync();

            if (order == null)
                return NotFound();

            // Get driver's latest location if assigned
            DriverLocation? driverLocation = null;
            if (order.DriverId.HasValue)
            {
                driverLocation = await _context.DriverLocations
                    .Where(dl => dl.DriverId == order.DriverId.Value)
                    .OrderByDescending(dl => dl.UpdatedAt)
                    .FirstOrDefaultAsync();
            }

            return Ok(new
            {
                order,
                driverLocation,
                estimatedDelivery = order.EstimatedDeliveryDate
            });
        }

        // POST: api/customer/reschedule/{orderId}
        [HttpPost("reschedule/{orderId}")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> RescheduleDelivery(int orderId, [FromBody] RescheduleRequest request)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                return NotFound();

            // Update reschedule info
            order.RescheduledDate = request.NewDate.ToUniversalTime();
            order.Priority = 3; // Lower priority for rescheduled orders
            order.DeliveryNotes = $"Rescheduled by customer: {request.Reason}. {order.DeliveryNotes}";

            await _context.SaveChangesAsync();

            // Recalculate driver's route if order is assigned
            if (order.DriverId.HasValue)
            {
                await _routeService.RecalculateDriverRouteAsync(order.DriverId.Value);
            }

            return Ok(new { message = "Delivery rescheduled successfully", newPriority = order.Priority });
        }

        // GET: api/customer/orders/by-email/{email}
        [HttpGet("orders/by-email/{email}")]
        public async Task<IActionResult> GetOrdersByEmail(string email)
        {
            // Find customer by email
            var customer = await _context.Users
                .Where(u => u.Email == email && u.Role == "Customer")
                .FirstOrDefaultAsync();

            if (customer == null)
            {
                // Also check orders where receiver email matches
                var ordersByReceiverEmail = await _context.Orders
                    .Where(o => o.ReceiverEmail == email)
                    .Include(o => o.Driver)
                    .Include(o => o.OriginWarehouse)
                    .Include(o => o.DestinationWarehouse)
                    .Include(o => o.CurrentWarehouse)
                    .OrderByDescending(o => o.CreatedAt)
                    .ToListAsync();

                return Ok(ordersByReceiverEmail);
            }

            var orders = await _context.Orders
                .Where(o => o.CustomerId == customer.Id)
                .Include(o => o.Driver)
                .Include(o => o.OriginWarehouse)
                .Include(o => o.DestinationWarehouse)
                .Include(o => o.CurrentWarehouse)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }
    }

    // DTOs
    public class RescheduleRequest
    {
        public DateTime NewDate { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}
