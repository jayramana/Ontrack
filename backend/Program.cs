using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Backend.Data;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

using Backend.Domain.Entity;
using Backend.Services;
using Backend.Endpoints;

var builder = WebApplication.CreateBuilder(args);
// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddOpenApi();
builder.Services.AddControllers();

// Add ASR Service
builder.Services.AddScoped<ASRService>();

// Update Gemini Service (ensure API key is configured)
// builder.Services.AddScoped<GeminiService>();




// Configure Entity Framework with PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure CORS to allow frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174","http://ontrack-frontend.s3-website.ap-south-1.amazonaws.com")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure Python service URL
builder.Services.Configure<Dictionary<string, string>>(options =>
{
    options["PythonVerificationService:Url"] = "http://localhost:5001";
});

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "YourSuperSecretKeyForJwtTokenGeneration12345";

// builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//     .AddJwtBearer(options =>
//     {
//         options.TokenValidationParameters = new TokenValidationParameters
//         {
//             ValidateIssuer = true,
//             ValidateAudience = true,
//             ValidateLifetime = true,
//             ValidateIssuerSigningKey = true,
//             ValidIssuer = jwtSettings["Issuer"] ?? "OntrackAPI",
//             ValidAudience = jwtSettings["Audience"] ?? "OntrackClient",
//             IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
//         };
//     });

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),

            //  CRITICAL FIX
            RoleClaimType = ClaimTypes.Role
        };
        //  CRITICAL: Add this for SignalR authentication
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddScoped<VerificationService>();

builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<IEtaservice, LocationService>();
// builder.Services.AddScoped<GeminiService>();
builder.Services.AddScoped<RouteOptimizationService>();
builder.Services.AddScoped<WarehouseAssignmentService>();
builder.Services.AddScoped<DriverRouteOptimizationService>();

builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddScoped<GeminiService>();          // registered twice (duplicate)
builder.Services.AddScoped<VerificationService>();    // same in both
builder.Services.AddHttpClient<GeocodingService>();
builder.Services.AddHttpClient<OpenRouteServiceClient>();

builder.Services.AddAuthorization();
builder.Services.AddSignalR();
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient();
builder.Services.AddScoped<GeminiOcrService>();

builder.Services.AddScoped<GeofenceService>();
builder.Services.AddHostedService<SimulationService>(); // 🚀 Simulation Service
var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapOpenApi();
}

// Map ASR endpoints
app.MapASREndpoints();

app.MapGeocodingEndpoints();

// Simple Health Check for AWS Elastic Beanstalk
app.MapGet("/", () => "Ontrack Backend is Running! 🚀");

app.MapVerificationEndpoints();

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
app.MapRoadIssueEndpoints();
app.MapRouteEndpoints();
app.MapDiagnosticEndpoints();

app.MapTrackingEndpoints();
app.MapPublicTrackingEndpoints();
app.MapSellerAnalyticsEndpoints();


app.MapHub<GeofenceHub>("/geofencehub");
app.MapHub<EtaHub>("/etahub");
app.MapHub<Backend.Hubs.LogisticsHub>("/hubs/logistics");


app.Run();

