using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Backend.Data;
using Backend.Domain.Entity;
using Backend.Services;
using Backend.Endpoints;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// -------------------- SERVICES --------------------

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS (FIXED)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "https://d5p1wvesrltks.cloudfront.net"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
System.Console.WriteLine("Test-1");
// JWT Auth
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "SuperSecretKey123!";

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
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(secretKey)
            ),
            RoleClaimType = ClaimTypes.Role
        };

        // Needed for SignalR auth
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) &&
                    path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

// Services
builder.Services.AddScoped<ASRService>();
builder.Services.AddScoped<VerificationService>();
builder.Services.AddScoped<IEtaservice, LocationService>();
builder.Services.AddScoped<RouteOptimizationService>();
builder.Services.AddScoped<WarehouseAssignmentService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<GeminiService>();
builder.Services.AddScoped<DriverRouteOptimizationService>();
builder.Services.AddScoped<GeofenceService>();
builder.Services.AddScoped<GeminiOcrService>();
builder.Services.AddHttpClient<GeocodingService>();
builder.Services.AddHttpClient<OpenRouteServiceClient>();
builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();
builder.Services.AddScoped<Microsoft.AspNetCore.Identity.IPasswordHasher<User>, Microsoft.AspNetCore.Identity.PasswordHasher<User>>();
builder.Services.AddSignalR();
builder.Services.AddAuthorization();

var app = builder.Build();

// -------------------- MIDDLEWARE ORDER (IMPORTANT) --------------------

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");     // MUST be before auth

app.UseAuthentication();
app.UseAuthorization();

// -------------------- ENDPOINTS --------------------

app.MapControllers();

app.MapASREndpoints();
app.MapAuthEndpoints();
app.MapGeocodingEndpoints();
app.MapCustomerEndpoints();
app.MapDriverEndpoints();
app.MapOrdersEndpoints();
app.MapWarehouseEndpoints();
app.MapGeofenceEndpoints();
app.MapRouteEndpoints();
app.MapTrackingEndpoints();
app.MapPublicTrackingEndpoints();
app.MapSellerAnalyticsEndpoints();
app.MapAdminEndpoints();
app.MapRoadIssueEndpoints();
app.MapLocationEndpoints();
app.MapVerificationEndpoints();
app.MapDiagnosticEndpoints();

app.MapHub<GeofenceHub>("/geofencehub");
app.MapHub<EtaHub>("/etahub");
app.MapHub<Backend.Hubs.LogisticsHub>("/hubs/logistics");

app.MapGet("/", () => "Ontrack Backend Running ");

app.Run();
