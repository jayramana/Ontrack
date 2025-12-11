using Backend.Domain.Entity;
using System.Net.Http.Json;

namespace Backend.Services
{
    public class EmailService : IEmailService
    {
        private readonly HttpClient _client;
        private readonly string _apiKey = "re_r9NRDQrr_9VzwBsCCmHQbSg9JXmj3QL2q";

        public EmailService(IHttpClientFactory httpClientFactory)
        {
            _client = httpClientFactory.CreateClient();
            _client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
        }

        public async Task SendOrderEmailsAsync(Order order)
        {
            string trackingLink = $"http://localhost:5173/track/{order.TrackingId}";

            string senderHtml = $@"
                <h2>Order Created Successfully</h2>
                <p>Hello {order.SenderName},</p>
                <p>Your order has been placed.</p>
                <p><b>Tracking ID:</b> {order.TrackingId}</p>
                <p><a href=""{trackingLink}"">Click here to track your order</a></p>
            ";

            string receiverHtml = $@"
                <h2>Your Parcel is On the Way</h2>
                <p>Hello {order.ReceiverName},</p>
                <p>Your parcel has been shipped.</p>
                <p><b>Tracking ID:</b> {order.TrackingId}</p>
                <p><a href=""{trackingLink}"">Track your parcel here</a></p>
            ";

            var senderPayload = new
            {
                from = "ArriveNow <noreply@arrivenow.com>",
                to = order.SenderEmail,
                subject = $"Order Created — Tracking ID {order.TrackingId}",
                html = senderHtml
            };

            var senderRes = await _client.PostAsJsonAsync("https://api.resend.com/emails", senderPayload);

            if (!senderRes.IsSuccessStatusCode)
                Console.WriteLine("Sender email error: " + await senderRes.Content.ReadAsStringAsync());

            if (!string.IsNullOrWhiteSpace(order.ReceiverEmail))
            {
                var receiverPayload = new
                {
                    from = "ArriveNow <noreply@arrivenow.com>",
                    to = order.ReceiverEmail,
                    subject = $"Parcel Incoming — Tracking ID {order.TrackingId}",
                    html = receiverHtml
                };

                var receiverRes = await _client.PostAsJsonAsync("https://api.resend.com/emails", receiverPayload);

                if (!receiverRes.IsSuccessStatusCode)
                    Console.WriteLine("Receiver email error: " + await receiverRes.Content.ReadAsStringAsync());
            }
        }
    }
}
