namespace HomeServicesApp.Providers
{
    public class ProviderSearchDto
    {
        public string? Specialization { get; set; }
        public string? ApprovalStatus { get; set; }
        public bool? IsAvailable { get; set; }
        public double? MinRating { get; set; }
        public double? MaxRating { get; set; }
        public string? Location { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public double? RadiusKm { get; set; }
    }
}
