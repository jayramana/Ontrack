using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Ontrack.Backend.Data;
using Ontrack.Backend.Models;

namespace Ontrack.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            try
            {
                // Validate input
                if (string.IsNullOrEmpty(request.Email) || 
                    string.IsNullOrEmpty(request.Password) || 
                    string.IsNullOrEmpty(request.Role))
                {
                    return BadRequest(new { message = "Email, password, and role are required" });
                }

                // Validate role
                if (!UserRoles.IsValidRole(request.Role))
                {
                    return BadRequest(new { message = "Invalid role specified" });
                }

                // Find user by email
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

                if (user == null)
                {
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                // Verify password
                if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                {
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                // Verify role matches
                if (user.Role != request.Role)
                {
                    return Unauthorized(new { message = $"User is not authorized as {request.Role}" });
                }

                // Generate JWT token
                var token = GenerateJwtToken(user);

                return Ok(new LoginResponse
                {
                    UserId = user.Id,
                    Name = user.Name,
                    Role = user.Role,
                    Token = token,
                    Message = "Login successful"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during login", error = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<LoginResponse>> Register([FromBody] RegisterRequest request)
        {
            try
            {
                // Validate input
                if (string.IsNullOrEmpty(request.Name) ||
                    string.IsNullOrEmpty(request.Email) ||
                    string.IsNullOrEmpty(request.Password) ||
                    string.IsNullOrEmpty(request.Role))
                {
                    return BadRequest(new { message = "All fields are required" });
                }

                // Validate role - Admin cannot register
                if (request.Role == UserRoles.Admin)
                {
                    return BadRequest(new { message = "Admin registration is not allowed" });
                }

                if (!UserRoles.IsValidRole(request.Role))
                {
                    return BadRequest(new { message = "Invalid role specified" });
                }

                // Check if email already exists
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

                if (existingUser != null)
                {
                    return BadRequest(new { message = "Email already registered" });
                }

                // Create new user
                var user = new User
                {
                    Name = request.Name,
                    Email = request.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    Role = request.Role
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Generate token for immediate login
                var token = GenerateJwtToken(user);

                return Ok(new LoginResponse
                {
                    UserId = user.Id,
                    Name = user.Name,
                    Role = user.Role,
                    Token = token,
                    Message = "Registration successful"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during registration", error = ex.Message });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"] ?? "YourSuperSecretKeyForJwtTokenGeneration12345";
            var issuer = jwtSettings["Issuer"] ?? "OntrackAPI";
            var audience = jwtSettings["Audience"] ?? "OntrackClient";

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.Now.AddHours(24),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
