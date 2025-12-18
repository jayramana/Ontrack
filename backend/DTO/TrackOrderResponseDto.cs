namespace Backend.DTO
{
    public class TrackOrderResponseDto
    {
        public int OrderId { get; set; }
        public string TrackingId { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public string PickupAddress { get; set; } = string.Empty;
        public string DeliveryAddress { get; set; } = string.Empty;

        public double? DriverLatitude { get; set; }
        public double? DriverLongitude { get; set; }

        public string? DriverName { get; set; }
        public string? DriverPhone { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}