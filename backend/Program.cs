using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Backend.Data;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSignalR();

// Register Services
builder.Services.AddScoped<Backend.Services.GeminiService>();
builder.Services.AddScoped<Backend.Services.RouteOptimizationService>();
builder.Services.AddScoped<Backend.Services.WarehouseAssignmentService>();
builder.Services.AddScoped<Backend.Services.DriverRouteOptimizationService>();

builder.Services.AddHttpClient<Backend.Services.GeminiService>();
builder.Services.AddHttpClient<Backend.Services.GeocodingService>();

builder.Services.AddHttpClient<Backend.Services.OpenRouteServiceClient>();

builder.Services.AddHttpClient();
builder.Services.AddScoped<IEmailService, EmailService>();




// Configure Entity Framework with PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure CORS to allow frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "YourSuperSecretKeyForJwtTokenGeneration12345";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"] ?? "OntrackAPI",
            ValidAudience = jwtSettings["Audience"] ?? "OntrackClient",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
        };
    });

builder.Services.AddAuthorization();



var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}


//to verify another hub is here or not
app.MapGet("/debug/hub-methods", () =>
{
    var hub = typeof(Backend.Hubs.LogisticsHub);
    var methods = hub.GetMethods().Select(m => m.Name).ToList();
    return methods;
});




// Use CORS
app.UseCors("AllowFrontend");
app.MapAuthEndpoints();

// Use Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<Backend.Hubs.LogisticsHub>("/hubs/logistics");

app.Run();
