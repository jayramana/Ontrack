namespace Backend.DTOs
{
    public class OrderEmailDto
    {
        public int OrderId { get; set; }
        public string TrackingId { get; set; } = string.Empty;

        public string SellerName { get; set; } = string.Empty;
        public string SellerPhone { get; set; } = string.Empty;
        public string SellerEmail { get; set; } = string.Empty;

        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;

        public string PickupAddress { get; set; } = string.Empty;
        public string DeliveryAddress { get; set; } = string.Empty;

        public decimal Price { get; set; }
        public bool IsASR { get; set; }
    }
}
