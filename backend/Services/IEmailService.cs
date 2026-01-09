using Backend.Domain.Entity;
using Backend.DTOs;

namespace Backend.Services
{
    public interface IEmailService
    {
        Task SendOrderPlacedEmailAsync(OrderEmailDto dto);
    }

}
