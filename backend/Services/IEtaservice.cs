namespace Backend.Services;

public interface IEtaservice
{
    double GetDistance(double lat1, double lon1, double lat2, double lon2);
    string GetETA(double distance, double speed);
}