// public sealed record StopDto(
//     double lat,
//     double lng,
//     int priority,
//     DateTime? windowStart,
//     DateTime? windowEnd
// );

// public sealed record OptimizeRouteRequest(
//     List<StopDto> stops,
//     List<RoadIssueDto>? roadIssues,
//     StopDto? driverLocation // optional, can be null
// );

// public sealed record RoadIssueDto(
//     double latitude,
//     double longitude,
//     string severity // Critical/High/Medium/Low
// );

public sealed record StopDto(
    double lat,
    double lng,
    int priority,
    DateTime? windowStart,
    DateTime? windowEnd
);

public sealed record RoadIssueDto(
    double latitude,
    double longitude,
    string severity // Critical / High / Medium / Low
);

public sealed record OptimizeRouteRequest(
    List<StopDto> stops,
    List<RoadIssueDto>? roadIssues,
    StopDto? driverLocation,
    string optimizationMode // NEW
);
