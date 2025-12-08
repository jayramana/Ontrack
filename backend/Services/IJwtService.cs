using Backend.Domain.Entity;

namespace Backend.Services;
public interface IJwtService
{
    string GenerateToken(User user);
}
