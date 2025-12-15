using Microsoft.AspNetCore.Mvc;
using System.Net.Http;

[ApiController]
[Route("api/route")]
public class RouteController : ControllerBase
{
    private readonly HttpClient _http;

    public RouteController(HttpClient http)
    {
        _http = http;
    }

    [HttpGet("osrm")]
    public async Task<IActionResult> GetRoute(
        [FromQuery] double startLng,
        [FromQuery] double startLat,
        [FromQuery] double endLng,
        [FromQuery] double endLat
    )
    {
        var url =
            $"https://router.project-osrm.org/route/v1/driving/" +
            $"{startLng},{startLat};{endLng},{endLat}" +
            "?overview=full&geometries=geojson";

        var response = await _http.GetAsync(url);
        var content = await response.Content.ReadAsStringAsync();

        return Content(content, "application/json");
    }
}
