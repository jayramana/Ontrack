namespace Backend.Services;

public class LocationService : IEtaservice
{
    public double GetDistance(double lat1, double lon1, double lat2, double lon2)
    {
        double radius_of_earth = 6371; //( This is radius of earth in km)
        double dLat = ToRadian(lat2 - lat1);
        double dLon = ToRadian(lon2 - lon1);

        lat1 = ToRadian(lat1);
        lat2 = ToRadian(lat2);

        double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(lat1) * Math.Cos(lat2) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return radius_of_earth * c;
    }

    public string GetETA(double distance, double speed)
    {
        if (speed <= 0) return "Invalid speed";

        double hrs = distance / speed;
        double mins = hrs * 60;
        
        return $"{Math.Round(mins)} minutes";
    }

    private double ToRadian(double val)
    {
        return Math.PI * val / 180.0;
    }
}