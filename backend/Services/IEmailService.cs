using Backend.Domain.Entity;

namespace Backend.Services
{
    public interface IEmailService
    {
        Task SendOrderEmailsAsync(Order order);
    }
}
