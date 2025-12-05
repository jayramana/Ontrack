using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Data;
using Backend.DTO;
using Backend.Domain.Entity;
public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/login", async (
            [FromBody] LoginRequestDto request,
            AppDbContext context,
            IConfiguration config) =>
        {
            if (string.IsNullOrEmpty(request.Email) ||
                string.IsNullOrEmpty(request.Password) ||
                string.IsNullOrEmpty(request.Role))
            {
                return Results.BadRequest(new { message = "Email, password, and role are required" });
            }

            if (!UserRoles.IsValidRole(request.Role))
            {
                return Results.BadRequest(new { message = "Invalid role specified" });
            }

            var user = await context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Results.Unauthorized();
            }

            if (user.Role != request.Role)
            {
                return Results.Unauthorized();
            }

            var token = GenerateJwtToken(user, config);

            return Results.Ok(new LoginResponseDto
            {
                UserId = user.Id,
                Name = user.Name,
                Role = user.Role,
                Token = token,
                Message = "Login successful"
            });
        });

        group.MapPost("/register", async (
            [FromBody] RegisterRequestDto request,
            AppDbContext context,
            IConfiguration config) =>
        {
            if (string.IsNullOrEmpty(request.Name) ||
                string.IsNullOrEmpty(request.Email) ||
                string.IsNullOrEmpty(request.Password) ||
                string.IsNullOrEmpty(request.Role))
            {
                return Results.BadRequest(new { message = "All fields are required" });
            }

            if (request.Role == UserRoles.Admin)
            {
                return Results.BadRequest(new { message = "Admin registration is not allowed" });
            }

            if (!UserRoles.IsValidRole(request.Role))
            {
                return Results.BadRequest(new { message = "Invalid role specified" });
            }

            var exists = await context.Users
                .AnyAsync(u => u.Email.ToLower() == request.Email.ToLower());

            if (exists)
            {
                return Results.BadRequest(new { message = "Email already registered" });
            }

            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = request.Role
            };

            context.Users.Add(user);
            await context.SaveChangesAsync();

            var token = GenerateJwtToken(user, config);

            return Results.Ok(new LoginResponseDto
            {
                UserId = user.Id,
                Name = user.Name,
                Role = user.Role,
                Token = token,
                Message = "Registration successful"
            });
        });
    }

    private static string GenerateJwtToken(User user, IConfiguration config)
    {
        var jwtSettings = config.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? "YourSuperSecretKeyForJwtTokenGeneration12345";
        var issuer = jwtSettings["Issuer"] ?? "OntrackAPI";
        var audience = jwtSettings["Audience"] ?? "OntrackClient";

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: DateTime.Now.AddHours(24),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
