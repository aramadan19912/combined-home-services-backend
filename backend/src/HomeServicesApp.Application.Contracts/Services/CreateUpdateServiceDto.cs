using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HomeServicesApp.Services
{
    public class CreateUpdateServiceDto
    {
        [Required]
        [MaxLength(128)]
        public string Name { get; set; }

        [MaxLength(2048)]
        public string Description { get; set; }

        [Required]
        [MaxLength(64)]
        public string Category { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? MinPrice { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? MaxPrice { get; set; }

        public bool IsActive { get; set; } = true;

        public Guid? ProviderId { get; set; }

        [Range(1, 480)]
        public int Duration { get; set; } = 60;

        [MaxLength(20)]
        public string DurationUnit { get; set; } = "minutes";

        public List<string> Images { get; set; } = new List<string>();

        public List<string> Tags { get; set; } = new List<string>();

        [MaxLength(512)]
        public string ServiceArea { get; set; }

        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        [MaxLength(512)]
        public string Address { get; set; }

        public List<CreateServiceAvailabilityDto> Availability { get; set; } = new List<CreateServiceAvailabilityDto>();

        public List<CreateServiceAddOnDto> AddOns { get; set; } = new List<CreateServiceAddOnDto>();

        [MaxLength(1024)]
        public string CancellationPolicy { get; set; }

        [Range(0, 168)]
        public int BookingLeadTime { get; set; } = 2;

        public bool InstantBooking { get; set; } = false;
    }

    public class CreateServiceAvailabilityDto
    {
        [Required]
        [MaxLength(20)]
        public string DayOfWeek { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        public bool IsAvailable { get; set; } = true;
    }

    public class CreateServiceAddOnDto
    {
        [Required]
        [MaxLength(128)]
        public string Name { get; set; }

        [MaxLength(512)]
        public string Description { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        public bool IsRequired { get; set; } = false;
    }
} 