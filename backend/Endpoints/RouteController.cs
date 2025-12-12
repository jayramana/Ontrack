using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text.Json;

namespace Backend.Endpoints
{
    [ApiController]
    [Route("api/[controller]")]
    public class RouteController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public RouteController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [HttpGet("osrm")]
        [Authorize(Roles = "Driver")]
        public async Task<IActionResult> GetOsrmRoute([FromQuery] string coords)
        {
            try
            {
                if (string.IsNullOrEmpty(coords))
                    return BadRequest(new { message = "Coordinates parameter is required" });

                var httpClient = _httpClientFactory.CreateClient();
                httpClient.Timeout = TimeSpan.FromSeconds(30);
                
                var url = $"http://router.project-osrm.org/route/v1/driving/{coords}?overview=full&geometries=geojson";

                var response = await httpClient.GetAsync(url);
                
                if (!response.IsSuccessStatusCode)
                    return StatusCode((int)response.StatusCode, new { message = "OSRM request failed" });

                var content = await response.Content.ReadAsStringAsync();
                var data = JsonDocument.Parse(content);

                return Ok(data.RootElement);
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(503, new { message = "Route service unavailable", error = ex.Message });
            }
            catch (TaskCanceledException)
            {
                return StatusCode(504, new { message = "Route calculation timed out" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to fetch route", error = ex.Message });
            }
        }
    }
}