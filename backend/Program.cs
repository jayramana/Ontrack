using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Backend.Data;
using Backend.Domain.Entity;
using Backend.Services;
using Backend.Endpoints;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using AWSSDK;

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
            .AllowCredentials()
            .SetIsOriginAllowed(_ => true) ;
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
builder.Services.AddScoped<DriverRouteOptimizationService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddHostedService<SimulationService>();
// builder.Services.AddAWSService<Amazon.S3.IAmazonS3>();
var awsOptions = builder.Configuration.GetSection("AWS");
var awsCredentials = new Amazon.Runtime.BasicAWSCredentials(awsOptions["AccessKey"], awsOptions["SecretKey"]);
var awsConfig = new Amazon.S3.AmazonS3Config { RegionEndpoint = Amazon.RegionEndpoint.GetBySystemName(awsOptions["Region"]) };
builder.Services.AddSingleton<Amazon.S3.IAmazonS3>(new Amazon.S3.AmazonS3Client(awsCredentials, awsConfig));


builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();
builder.Services.AddScoped<Microsoft.AspNetCore.Identity.IPasswordHasher<User>, Microsoft.AspNetCore.Identity.PasswordHasher<User>>();
builder.Services.AddSignalR();
builder.Services.AddAuthorization();
builder.Services.AddHttpClient<OpenRouteServiceClient>();
builder.Services.AddHttpClient<GeocodingService>();


var app = builder.Build();

// -------------------- MIDDLEWARE ORDER (IMPORTANT) --------------------

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.Use(async (context, next) =>
{
    if (context.Request.Method == "OPTIONS")
    {
        context.Response.StatusCode = 200;
        await context.Response.CompleteAsync();
        return;
    }
    await next();
});// MUST be before auth

app.UseAuthentication();
app.UseAuthorization();

// -------------------- ENDPOINTS --------------------

app.MapControllers().RequireCors("AllowFrontend");

app.MapASREndpoints().RequireCors("AllowFrontend");
app.MapAuthEndpoints().RequireCors("AllowFrontend");
app.MapCustomerEndpoints().RequireCors("AllowFrontend");
app.MapDriverEndpoints().RequireCors("AllowFrontend");
app.MapOrdersEndpoints().RequireCors("AllowFrontend");
app.MapWarehouseEndpoints().RequireCors("AllowFrontend");
app.MapGeofenceEndpoints().RequireCors("AllowFrontend");
app.MapRouteEndpoints().RequireCors("AllowFrontend");
app.MapTrackingEndpoints().RequireCors("AllowFrontend");
app.MapPublicTrackingEndpoints().RequireCors("AllowFrontend");
app.MapSellerAnalyticsEndpoints().RequireCors("AllowFrontend");
app.MapAdminEndpoints().RequireCors("AllowFrontend");
app.MapAWSEndpoints().RequireCors("AllowFrontend");
app.MapRoadIssueEndpoints().RequireCors("AllowFrontend");
app.MapLocationEndpoints().RequireCors("AllowFrontend");
app.MapGeocodingEndpoints().RequireCors("AllowFrontend");

app.MapHub<GeofenceHub>("/geofencehub").RequireCors("AllowFrontend");
app.MapHub<EtaHub>("/etahub").RequireCors("AllowFrontend");
app.MapHub<Backend.Hubs.LogisticsHub>("/hubs/logistics").RequireCors("AllowFrontend");

app.MapGet("/", () => "Ontrack Backend Running ");

app.Run();
