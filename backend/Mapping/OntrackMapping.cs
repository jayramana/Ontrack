using Backend.DTO;
using Backend.Domain.Entity;

namespace Backend.Api.Mapping;


public static class OntrackMapping
{
    public static User ToEntity(this RegisterRequestDto rrdto, string passwordHash)
    {
        
        return new User
        {
            UserFName = rrdto.UserFName,
            UserLName = rrdto.UserLName,
            UserEmail = rrdto.Email,
            UserPass = passwordHash,
            UserPhonePrimary = rrdto.PhonePrimary,
            UserPhoneSecondary = rrdto.PhoneSecondary,
            UserRole = rrdto.Role,
            IsAvailable = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }
}