// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.IdentityModel.Tokens;
// using System.IdentityModel.Tokens.Jwt;
// using System.Security.Claims;
// using System.Text;
// using Backend.Data;
// using Backend.DTO;
// using Backend.Domain.Entity;
// public static class AuthEndpoints
// {
//     public static void MapAuthEndpoints(this IEndpointRouteBuilder routes)
//     {
//         var group = routes.MapGroup("/api/auth").WithTags("Auth");

//         group.MapPost("/login", async (
//             [FromBody] LoginRequestDto request,
//             AppDbContext context,
//             IConfiguration config) =>
//         {
//             if (string.IsNullOrEmpty(request.Email) ||
//                 string.IsNullOrEmpty(request.Password) ||
//                 string.IsNullOrEmpty(request.UserRole))
//             {
//                 return Results.BadRequest(new { message = "Email, password, and UserRole are required" });
//             }

//             if (!UserUserRoles.IsValidUserRole(request.UserRole))
//             {
//                 return Results.BadRequest(new { message = "Invalid UserRole specified" });
//             }

//             var user = await context.Users
//                 .FirstOrDefaultAsync(u => u.UserEmail.ToLower() == request.Email.ToLower());

//             if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.UserPass))
//             {
//                 System.Console.WriteLine(user);
//                 System.Console.WriteLine($"{request.Password}, {user.UserPass}");
//                 return Results.Unauthorized();
//             }

//             if (user.UserRole != request.UserRole)
//             {
//                 return Results.Unauthorized();
//             }

//             var token = GenerateJwtToken(user, config);

//             return Results.Ok(new LoginResponseDto
//             {
//                 UserId = user.UserId,
//                 First_Name = user.UserFName,
//                 UserRole = user.UserRole,
//                 Token = token,
//                 Message = "Login successful"
//             });
//         });

//         group.MapPost("/register", async (
//             [FromBody] RegisterRequestDto request,
//             AppDbContext context,
//             IConfiguration config) =>
//         {
//             if (string.IsNullOrEmpty(request.Name) ||
//                 string.IsNullOrEmpty(request.Email) ||
//                 string.IsNullOrEmpty(request.Password) ||
//                 string.IsNullOrEmpty(request.UserRole))
//             {
//                 return Results.BadRequest(new { message = "All fields are required" });
//             }

//             if (request.UserRole == UserUserRoles.Admin)
//             {
//                 return Results.BadRequest(new { message = "Admin registration is not allowed" });
//             }

//             if (!UserUserRoles.IsValidUserRole(request.UserRole))
//             {
//                 return Results.BadRequest(new { message = "Invalid UserRole specified" });
//             }

//             var exists = await context.User_details
//                 .AnyAsync(u => u.Email.ToLower() == request.Email.ToLower());

//             if (exists)
//             {
//                 return Results.BadRequest(new { message = "Email already registered" });
//             }

//             var user = new User
//             {
//                 Name = request.Name,
//                 Email = request.Email,
//                 UserPass = BCrypt.Net.BCrypt.HashPassword(request.Password),
//                 UserRole = request.UserRole
//             };

//             context.User_details.Add(user);
//             await context.SaveChangesAsync();

//             var token = GenerateJwtToken(user, config);

//             return Results.Ok(new LoginResponseDto
//             {
//                 UserId = user.UserId,
//                 Name = user.UserFName,
//                 UserRole = user.UserRole,
//                 Token = token,
//                 Message = "Registration successful"
//             });
//         });
//     }

//     private static string GenerateJwtToken(User user, IConfiguration config)
//     {
//         var jwtSettings = config.GetSection("JwtSettings");
//         var secretKey = jwtSettings["SecretKey"] ?? "YourSuperSecretKeyForJwtTokenGeneration12345";
//         var issuer = jwtSettings["Issuer"] ?? "OntrackAPI";
//         var audience = jwtSettings["Audience"] ?? "OntrackClient";

//         var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
//         var creds = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

//         var claims = new[]
//         {
//             new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
//             new Claim(ClaimTypes.Name, user.UserFName),
//             new Claim(ClaimTypes.Email, user.Email),
//             new Claim(ClaimTypes.UserRole, user.UserRole)
//         };

//         var token = new JwtSecurityToken(
//             issuer,
//             audience,
//             claims,
//             expires: DateTime.Now.AddHours(24),
//             signingCredentials: creds
//         );

//         return new JwtSecurityTokenHandler().WriteToken(token);
//     }
// }

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

                var hash_Pass = hasher.HashPassword(new User(), request.Password);
                var user = request.ToEntity(hash_Pass);

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
        user_id = user.UserId,
        role = user.UserRole
    });
});
    }
}
