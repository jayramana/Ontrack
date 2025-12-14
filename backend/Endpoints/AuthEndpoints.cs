using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Data;
using Backend.Domain.Entity;
using Microsoft.AspNetCore.Identity;
using Backend.DTO;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Backend.Api.Mapping;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", async (
            RegisterRequestDto request,
            AppDbContext db,
            IPasswordHasher<User> hasher) =>
            {
                if (string.IsNullOrWhiteSpace(request.UserFName) ||
                string.IsNullOrWhiteSpace(request.UserLName) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.Role))
                {
                    return Results.BadRequest(new { message = "All basic user fields are required" });
                }

                var role = request.Role.ToLower();
                var isAddressRequired = role == "customer" || role == "seller";

                if (isAddressRequired)
                {
                    if (string.IsNullOrWhiteSpace(request.AddressLine1) ||
                        string.IsNullOrWhiteSpace(request.City) ||
                        string.IsNullOrWhiteSpace(request.State) ||
                        string.IsNullOrWhiteSpace(request.PostalCode) ||
                        string.IsNullOrWhiteSpace(request.Country))
                    {
                        return Results.BadRequest(new { message = "Address fields are required for this role" });
                    }
                }

                var existingUser = await db.Users
                .FirstOrDefaultAsync(u => u.UserEmail.ToLower() == request.Email.ToLower());

                if (existingUser != null)
                {
                    return Results.BadRequest(new { message = "Email already registered" });
                }

                var user = request.ToEntity(request.Password);
                user.UserPass = hasher.HashPassword(user, request.Password);

                using var transaction = await db.Database.BeginTransactionAsync();
                try
                {
                    db.Users.Add(user);
                    // Save user first to generate UserId
                    await db.SaveChangesAsync();

                    // Create Address only if required
                    if (isAddressRequired)
                    {
                        var address = new Address
                        {
                            UserId = user.UserId,
                            AddressLine1 = request.AddressLine1,
                            AddressLine2 = request.AddressLine2,
                            City = request.City,
                            State = request.State,
                            PostalCode = request.PostalCode,
                            Country = request.Country,
                            IsSeller = role == "seller",
                            SellerType = role == "seller" ? request.SellerType : null,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };

                        db.Addresses.Add(address);
                        await db.SaveChangesAsync();
                    }

                    await transaction.CommitAsync();

                    return Results.Ok(new
                    {
                        message = "Registration successful",
                        user_id = user.UserId,
                        email = user.UserEmail,
                        role = user.UserRole
                    });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return Results.BadRequest(new { message = "Registration failed: " + ex.Message });
                }
            });


        group.MapPost("/login", async (
        LoginRequestDto login,
        AppDbContext db,
        IConfiguration config,
        IPasswordHasher<User> hasher) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.UserEmail == login.Email);

    if (user == null)
    {
        return Results.BadRequest(new { message = "No user exists with this email" });
    }

    var result = hasher.VerifyHashedPassword(user, user.UserPass, login.Password);
    if (result == PasswordVerificationResult.Failed)
    {
        return Results.Unauthorized();
    }

    if (user.UserEmail != login.Email || user.UserRole != login.Role)
    {
        return Results.NotFound("A user with this credentials does not exists");
    }
    var jwt = config.GetSection("JwtSettings");
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["SecretKey"]));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var claims = new[]
    {
        new Claim("id", user.UserId.ToString()),                     // primary claim
        new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()), // backup claim (sub)
        new Claim(ClaimTypes.Email, user.UserEmail),
        new Claim(ClaimTypes.Role, user.UserRole)
    };

    var token = new JwtSecurityToken(
        issuer: jwt["Issuer"],
        audience: jwt["Audience"],
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(Convert.ToInt32(jwt["ExpiresInMinutes"])),
        signingCredentials: creds
    );

    var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

    return Results.Ok(new
    {
        message = "Login successful",
        token = tokenString,
        first_name = user.UserFName,
        last_name = user.UserLName,
        email = user.UserEmail,
        user_id = user.UserId,
        role = user.UserRole
    });
});

        group.MapGet("/", async (AppDbContext db) =>
        {
            var users = await db.Users.ToListAsync();
            return Results.Ok(users);
        });
        group.MapGet("/{id}", async (int id, AppDbContext db) =>
        {
            var users = await db.Users.FirstOrDefaultAsync(u => u.UserId == id);
            return Results.Ok(users);
        });

        group.MapGet("/profile", async (
            ClaimsPrincipal claims,
            AppDbContext db) =>
        {
            var userIdClaim = claims.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Results.Unauthorized();
            }

            var user = await db.Users.FindAsync(userId);
            if (user == null) return Results.NotFound("User not found via token claims");

            var address = await db.Addresses
                .FirstOrDefaultAsync(a => a.UserId == userId);

            var response = new UserProfileDto
            {
                UserId = user.UserId,
                FirstName = user.UserFName,
                LastName = user.UserLName,
                Email = user.UserEmail,
                Phone = user.UserPhonePrimary,
                Role = user.UserRole,
                
                AddressLine1 = address?.AddressLine1,
                AddressLine2 = address?.AddressLine2,
                City = address?.City,
                State = address?.State,
                PostalCode = address?.PostalCode,
                Country = address?.Country,
                
                IsSeller = address?.IsSeller ?? false,
                SellerType = address?.SellerType
            };

            return Results.Ok(response);
        }).RequireAuthorization(); // Ensure only logged-in users can call this
    }
}
