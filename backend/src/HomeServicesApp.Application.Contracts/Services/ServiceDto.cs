using System;
using System.Collections.Generic;
using Volo.Abp.Application.Dtos;

namespace HomeServicesApp.Services
{
    public class ServiceDto : FullAuditedEntityDto<Guid>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public decimal Price { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public bool IsActive { get; set; }
        public Guid? ProviderId { get; set; }
        public string ProviderName { get; set; }
        public double AverageRating { get; set; }
        public int ReviewCount { get; set; }
        public int Duration { get; set; }
        public string DurationUnit { get; set; }
        public List<string> Images { get; set; } = new List<string>();
        public List<string> Tags { get; set; } = new List<string>();
        public bool IsAvailable { get; set; }
        public string ServiceArea { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string Address { get; set; }
        public List<ServiceAvailabilityDto> Availability { get; set; } = new List<ServiceAvailabilityDto>();
        public List<ServiceAddOnDto> AddOns { get; set; } = new List<ServiceAddOnDto>();
        public string CancellationPolicy { get; set; }
        public int BookingLeadTime { get; set; }
        public bool InstantBooking { get; set; }
    }

    public class ServiceAvailabilityDto
    {
        public string DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsAvailable { get; set; }
    }

    public class ServiceAddOnDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public bool IsRequired { get; set; }
    }
}   