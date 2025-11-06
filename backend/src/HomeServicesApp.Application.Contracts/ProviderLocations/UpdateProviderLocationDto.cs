using System;
using System.ComponentModel.DataAnnotations;

namespace HomeServicesApp.ProviderLocations
{
    public class UpdateProviderLocationDto
    {
        [Required]
        public Guid ProviderId { get; set; }

        [Required]
        [Range(-90, 90)]
        public double Latitude { get; set; }

        [Required]
        [Range(-180, 180)]
        public double Longitude { get; set; }

        public double? Accuracy { get; set; }
        public double? Speed { get; set; }
        public double? Heading { get; set; }
    }
}
