namespace Backend.DTO
{
    // ===============================
    // REQUEST DTOs
    // ===============================
    public record ASRDriverCaptureDto(string CustomerPhotoUrl, string SignatureUrl);

    public record ASRCustomerDocumentDto(
        List<string> DocumentUrls, 
        string AadhaarNumber
    );

    public record ASRAdminOverrideDto(string Reason);

    // ===============================
    // GEMINI OCR RESULT
    // ===============================
    public class GeminiAadhaarOcr
    {
        public string Name { get; set; } = "";
        public string Dob { get; set; } = "";
        public string YearOfBirth { get; set; } = "";
        public string Gender { get; set; } = "";
        public string AadhaarNumber { get; set; } = "";
        public string Address { get; set; } = "";
    }

    // ===============================
    // FACE MATCH RESULT
    // ===============================
    public class FaceMatchResult
    {
        public bool FaceMatch { get; set; }
        public double Similarity { get; set; }
        public double Distance { get; set; }
        public double Threshold { get; set; }
        public string Model { get; set; } = "";
        public string Reason { get; set; } = "";
    }

    // ===============================
    // VERIFICATION RESULT DTO
    // ===============================
    public class ASRVerificationResultDto
    {
        public bool Verified { get; set; }
        public double Score { get; set; }
        public List<string> Reasons { get; set; } = new();
        public object? AadhaarData { get; set; }
        public string VerificationType { get; set; } = "";
    }
}