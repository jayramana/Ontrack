// using Amazon.S3;
// using Amazon.S3.Model;

// app.MapPost("/api/uploads/presign", async (
//     List<PresignFileDto> files,
//     IAmazonS3 s3
// ) =>
// {
//     var bucket = "your-bucket-name";
//     var results = new List<PresignResponse>();

//     foreach (var file in files)
//     {
//         var key = $"uploads/{Guid.NewGuid()}-{file.FileName}";

//         var request = new GetPreSignedUrlRequest
//         {
//             BucketName = bucket,
//             Key = key,
//             Verb = HttpVerb.PUT,
//             Expires = DateTime.UtcNow.AddMinutes(2),
//             ContentType = file.ContentType
//         };

//         var url = s3.GetPreSignedURL(request);
//         results.Add(new PresignResponse(url, key));
//     }

//     return Results.Ok(results);
// });


using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Data;
using Backend.Domain.Entity;
using Microsoft.AspNetCore.Identity;
using Backend.DTO;
using Backend.Api.Mapping;
using Amazon.S3;
using Amazon.S3.Model;

public static class AWSEndpoints
{
    public static RouteGroupBuilder MapAWSEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/aws").WithTags("AWS");
        group.MapPost("/uploads/presign", async (
            List<PresignFileDto> files,
            IAmazonS3 s3,
            IConfiguration config
        ) =>
        {
            var bucket = config["AWS:BucketName"];
            if (string.IsNullOrEmpty(bucket)) return Results.Problem("AWS BucketName is not configured.");

            var results = new List<PresignResponse>();

            foreach (var file in files)
            {
                var key = $"uploads/{Guid.NewGuid()}-{file.FileName}";
                var request = new GetPreSignedUrlRequest
                {
                    BucketName = bucket,
                    Key = key,
                    Verb = HttpVerb.PUT,
                    Expires = DateTime.UtcNow.AddMinutes(5),
                    ContentType = file.ContentType
                };

                var url = s3.GetPreSignedURL(request);
                results.Add(new PresignResponse(url, key));
            }
            return Results.Ok(results);
        });

        // 1. GET ALL FILES
        group.MapGet("/files", async (IAmazonS3 s3, IConfiguration config) =>
        {
            var bucket = config["AWS:BucketName"];
            if (string.IsNullOrEmpty(bucket)) return Results.Problem("AWS BucketName not configured");

            // Listing only files in 'uploads/' folder as requested
            var request = new ListObjectsV2Request { BucketName = bucket, Prefix = "uploads/" }; 
            var response = await s3.ListObjectsV2Async(request);

            if (response.S3Objects == null || response.S3Objects.Count == 0)
            {
                return Results.Ok(new { message = "The bucket is empty" });
            }

            var files = response.S3Objects.Select(o => new 
            {
                Key = o.Key,
                Size = o.Size,
                LastModified = o.LastModified,
                // Generate a temporary view link for convenience (valid for 15 mins)
                Url = s3.GetPreSignedURL(new GetPreSignedUrlRequest
                {
                    BucketName = bucket,
                    Key = o.Key,
                    Verb = HttpVerb.GET,
                    Expires = DateTime.UtcNow.AddMinutes(15)
                })
            });

            return Results.Ok(files);
        });

        // 1.5 GENERATE VIEW LINK (Separate Endpoint)
        group.MapGet("/files/view", (string key, IAmazonS3 s3, IConfiguration config) =>
        {
            var bucket = config["AWS:BucketName"];
            if (string.IsNullOrEmpty(bucket)) return Results.Problem("AWS BucketName not configured");

            var url = s3.GetPreSignedURL(new GetPreSignedUrlRequest
            {
                BucketName = bucket,
                Key = key,
                Verb = HttpVerb.GET,
                Expires = DateTime.UtcNow.AddMinutes(60)
            });

            return Results.Ok(new { url });
        });

        // 2. DELETE FILE
        group.MapDelete("/files/{*key}", async (string key, IAmazonS3 s3, IConfiguration config) =>
        {
            var bucket = config["AWS:BucketName"];
            if (string.IsNullOrEmpty(bucket)) return Results.Problem("AWS BucketName not configured");

            await s3.DeleteObjectAsync(bucket, key);
            return Results.Ok(new { message = $"File {key} deleted successfully" });
        });

        // 3. UPLOAD FILE (Multipart/Form-Data)
        group.MapPost("/files", async (IFormFile file, IAmazonS3 s3, IConfiguration config) =>
        {
            var bucket = config["AWS:BucketName"];
            if (string.IsNullOrEmpty(bucket)) return Results.Problem("AWS BucketName not configured");

            if (file == null || file.Length == 0) return Results.BadRequest("No file uploaded");

            var key = $"uploads/{Guid.NewGuid()}-{file.FileName}";

            using var stream = file.OpenReadStream();
            var request = new PutObjectRequest
            {
                BucketName = bucket,
                Key = key,
                InputStream = stream,
                ContentType = file.ContentType
            };

            await s3.PutObjectAsync(request);
            
            return Results.Ok(new { message = "File uploaded successfully", key });
        }).DisableAntiforgery(); // Disable antiforgery for simple API testing

        return group;
    }
}
