using Backend.DTO;

public record PresignFileDto(string FileName, string ContentType);
public record PresignResponse(string UploadUrl, string Key);