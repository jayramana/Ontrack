using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

public static class FileUploadEndpoints
{
    public static RouteGroupBuilder MapFileUploadEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/uploads").WithTags("Uploads");

        group.MapPost("/files", async (IFormFile file, IWebHostEnvironment env) =>
        {
            if (file == null || file.Length == 0)
                return Results.BadRequest("No file uploaded");

            // Ensure wwwroot/uploads exists
            var uploadsPath = Path.Combine(env.ContentRootPath, "wwwroot", "uploads");
            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return relative "key" for DB storage
            var key = $"uploads/{fileName}";
            return Results.Ok(new { message = "File uploaded successfully", key });
        }).DisableAntiforgery();

        return group;
    }
}
