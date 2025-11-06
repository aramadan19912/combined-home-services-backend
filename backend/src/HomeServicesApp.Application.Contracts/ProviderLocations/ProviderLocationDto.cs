using System;
using Volo.Abp.Application.Dtos;

namespace HomeServicesApp.ProviderLocations
{
    public class ProviderLocationDto : EntityDto<Guid>
    {
        public Guid ProviderId { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double? Accuracy { get; set; }
        public double? Speed { get; set; }
        public double? Heading { get; set; }
        public bool IsOnline { get; set; }
        public DateTime LastUpdated { get; set; }

        // Display properties
        public string ProviderName { get; set; }
    }
}
