using Backend.DTOs;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Backend.Services
{
    public class EmailService : IEmailService   // ✅ THIS LINE FIXES THE ERROR
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendOrderPlacedEmailAsync(OrderEmailDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CustomerEmail))
                return;

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                "OnTrack Logistics",
                _config["EmailSettings:SenderEmail"]
            ));

            message.To.Add(MailboxAddress.Parse(dto.CustomerEmail));
            message.Subject = $"📦 Order Confirmed | Tracking ID: {dto.TrackingId}";

            message.Body = new TextPart("html")
            {
                Text = $@"
                    <h2>Hello {dto.CustomerName},</h2>
                    <p>Your order has been placed successfully.</p>

                    <p><b>Order ID:</b> {dto.OrderId}</p>
                    <p><b>Tracking ID:</b> {dto.TrackingId}</p>

                    <h3>Seller</h3>
                    <p>{dto.SellerName}<br/>
                       {dto.SellerPhone}<br/>
                       {dto.SellerEmail}</p>

                    <p><b>Pickup:</b> {dto.PickupAddress}</p>
                    <p><b>Delivery:</b> {dto.DeliveryAddress}</p>

                    <p><b>Total Price:</b> ₹{dto.Price}</p>
                    <p><b>ASR Required:</b> {(dto.IsASR ? "Yes" : "No")}</p>

                    <hr/>
                    <p>OnTrack Logistics 🚚</p>
                "
            };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(
                _config["EmailSettings:SmtpServer"],
                int.Parse(_config["EmailSettings:Port"]),
                SecureSocketOptions.StartTls
            );
            await smtp.AuthenticateAsync(
                _config["EmailSettings:Username"],
                _config["EmailSettings:Password"]
            );
            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);
        }
    }
}
