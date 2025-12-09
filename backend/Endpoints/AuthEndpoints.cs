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
                    return Results.BadRequest(new { message = "All fields are required" });
                }

                var existingUser = await db.Users
                .FirstOrDefaultAsync(u => u.UserEmail.ToLower() == request.Email.ToLower());

                if (existingUser != null)
                {
                    return Results.BadRequest(new { message = "Email already registered" });
                }

                var user = request.ToEntity(request.Password);
                user.UserPass = hasher.HashPassword(user, request.Password);

                db.Users.Add(user);
                await db.SaveChangesAsync();

                return Results.Ok(new
                {
                    message = "Registration successful",
                    user_id = user.UserId,
                    email = user.UserEmail,
                    role = user.UserRole
                });
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

    if(user.UserEmail != login.Email || user.UserRole != login.Role)
    {
        return Results.NotFound("A user with this credentials does not exists");
    }
    var jwt = config.GetSection("JwtSettings");
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["SecretKey"]));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var claims = new[]
    {
        new Claim(ClaimTypes.Email, user.UserEmail),
        new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
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
        user_id = user.UserId,
        role = user.UserRole
    });
});
    }
}
