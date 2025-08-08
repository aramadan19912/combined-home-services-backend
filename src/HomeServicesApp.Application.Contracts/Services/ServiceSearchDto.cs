using System;
using System.Collections.Generic;
using Volo.Abp.Application.Dtos;

namespace HomeServicesApp.Services
{
    public class ServiceSearchDto : PagedAndSortedResultRequestDto
    {
        public string SearchTerm { get; set; }
        public string Category { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public double? MinRating { get; set; }
        public string Availability { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public double? RadiusKm { get; set; }
        public List<string> Tags { get; set; } = new List<string>();
        public bool? InstantBooking { get; set; }
        public string SortBy { get; set; } = "Relevance";
    }

    public class ServiceCategoryDto
    {
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
        public int ServiceCount { get; set; }
        public bool IsActive { get; set; }
    }

    public class ServiceSuggestionDto
    {
        public string Text { get; set; }
        public string Type { get; set; }
        public int Count { get; set; }
    }
}
