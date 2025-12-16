using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Backend.Services
{
    public class GeminiOcrService
    {
        private readonly HttpClient _http;
        private readonly string _apiKey;

        public GeminiOcrService(IConfiguration config)
        {
            _http = new HttpClient();
            _apiKey = config["Gemini:ApiKey"]
                ?? throw new Exception("Gemini API key missing");
        }

        public async Task<AadhaarOcrResult?> ExtractAadhaarAsync(string base64Image)
        {
            var cleanBase64 = base64Image.Contains(",")
                ? base64Image.Split(',')[1]
                : base64Image;

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new object[]
                        {
                            new
                            {
                                inlineData = new
                                {
                                    mimeType = "image/jpeg",
                                    data = cleanBase64
                                }
                            },
                            new
                            {
                                text = """
                                Extract Aadhaar card details from this image.
                                Return JSON ONLY in this format:

                                {
                                  "name": "",
                                  "dob": "",
                                  "yearOfBirth": "",
                                  "gender": "",
                                  "aadhaarLast4": ""
                                }

                                If a field is not found, keep it empty.
                                """
                            }
                        }
                    }
                }
            };

            var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + _apiKey
            );

            httpRequest.Content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _http.SendAsync(httpRequest);
            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadAsStringAsync();
            var doc = JsonDocument.Parse(json);

            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return JsonSerializer.Deserialize<AadhaarOcrResult>(text ?? "{}",
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
    }

    public class AadhaarOcrResult
    {
        public string Name { get; set; } = "";
        public string Dob { get; set; } = "";
        public string YearOfBirth { get; set; } = "";
        public string Gender { get; set; } = "";
        public string AadhaarLast4 { get; set; } = "";
    }
}
