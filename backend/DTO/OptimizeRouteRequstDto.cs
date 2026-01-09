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
    string severity 
);

public sealed record OptimizeRouteRequest(
    List<StopDto> stops,
    List<RoadIssueDto>? roadIssues,
    StopDto? driverLocation,
    string optimizationMode
);