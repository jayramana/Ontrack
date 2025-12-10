using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Backend.Data;
using Microsoft.AspNetCore.Identity;
using Backend.Domain.Entity;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddOpenApi();
builder.Services.AddControllers();


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
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<IEtaservice, LocationService>();
builder.Services.AddScoped<GeminiService>();
builder.Services.AddScoped<RouteOptimizationService>();
builder.Services.AddScoped<WarehouseAssignmentService>();
builder.Services.AddScoped<DriverRouteOptimizationService>();


builder.Services.AddHttpClient<GeminiService>();
builder.Services.AddHttpClient<GeocodingService>();
builder.Services.AddAuthorization();
builder.Services.AddSignalR();
builder.Services.AddMemoryCache();
builder.Services.AddScoped<GeofenceService>();
var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapOpenApi();
}



// Use CORS
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapCustomerEndpoints();

app.MapAuthEndpoints();
app.MapLocationEndpoints();
app.MapAdminEndpoints();
app.MapDriverEndpoints();
app.MapOrdersEndpoints();
app.MapWarehouseEndpoints();
app.MapGeofenceEndpoints();


app.MapHub<GeofenceHub>("/geofencehub");
app.MapHub<EtaHub>("/etahub");


app.Run();

